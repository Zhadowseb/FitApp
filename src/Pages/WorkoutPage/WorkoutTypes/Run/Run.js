import { StatusBar } from 'expo-status-bar';
import { View, Button, ScrollView, Text, TouchableOpacity, Switch } from 'react-native';
import { useState, useCallback, useEffect, useRef } from "react";
import { useSQLiteContext } from "expo-sqlite";
import { useFocusEffect } from "@react-navigation/native";
import RunSetList from "./RunSetList";
// import * as Location from 'expo-location';

import { useColorScheme, Vibration } from "react-native";
import { Colors } from "../../../../Resources/GlobalStyling/colors";

import { ThemedTitle, 
        ThemedCard, 
        ThemedView, 
        ThemedText, 
        ThemedSwitch, 
        ThemedModal,
        ThemedHeader,
        ThemedButton, } 
  from "../../../../Resources/ThemedComponents";

import WorkoutStopwatch from '../../../../Resources/Components/StopWatch';
import Plus from '../../../../Resources/Icons/UI-icons/Plus';
import styles from './RunStyle';

import { formatTime, formatWorkoutStart } from '../../../../Utils/timeUtils';
import {
    runningRepository,
    workoutRepository,
} from "../../../../Database/repository";

// const LOCATION_TASK = 'background-location-task';
const Run = ({workout_id}) =>  {
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme] ?? Colors.light;
    const db = useSQLiteContext();

    const [updateCount, set_updateCount] = useState(0);
    const triggerReload = () => {
        set_updateCount(prev => prev + 1);
    };

    const [warmupEmpty, set_WarmupEmpty] = useState(true);
    const [workingEmpty, set_WorkingEmpty] = useState(true);
    const [cooldownEmpty, set_CooldownEmpty] = useState(true);


    //Workout timer state:
    const [original_start_time, set_original_start_time] = useState(null);
    const [timer_start, set_timer_start] = useState(null);
    const [elapsed_time, set_elapsed_time] = useState(0);
    const [isDone, set_isDone] = useState(false);
    const [isRunning, set_isRunning] = useState(false);
    
    const [activeSet, set_activeSet] = useState("");
    const [activeSet_remainingTime, set_activeSet_remainingTime] = useState(0);

    const previousActiveSetRef = useRef(null);


    //Focus coming back to the page
    useFocusEffect(
        useCallback(() => {
            const reload = async () => {
                const row = await workoutRepository.getWorkoutTimerState(db, workout_id);

                if(row.timer_start !== null){
                    set_isRunning(true);
                }
                set_isDone(Number(row.done) === 1);
                set_original_start_time(row.original_start_time);
                set_timer_start(row.timer_start);
                set_elapsed_time(row.elapsed_time);
            }
            reload();

        }, [workout_id])
    );

    //Save leaving page
    useFocusEffect(
        useCallback(() => {
            return () => {
                
                const saveState = async () => {
                    await workoutRepository.persistWorkoutTimerState(db, {
                        workoutId: workout_id,
                        timerStart: timer_start,
                        elapsedTime: elapsed_time,
                    });
                }
                saveState();
            };

        }, [timer_start, elapsed_time])
    );

    useEffect(() => {
        const interval = setInterval(() => {
            
            if(isRunning){
                let currentTime = computeCurrentElapsed();
                calculateActiveSet(elapsed_time + currentTime);
            }

        }, 1000);

        return () => clearInterval(interval);
    }, [timer_start, isRunning, workout_id]);
    

    const computeCurrentElapsed = () => {
        if (!timer_start) return 0;

        return Math.floor(
            (Date.now() - timer_start) / 1000
        );
    };

    const updateElapsed = async () => {
        const newElapsed = Math.floor(
            elapsed_time + computeCurrentElapsed()
        );
        
        await workoutRepository.updateWorkoutElapsedTime(db, {
            workoutId: workout_id,
            elapsedTime: newElapsed,
        });

        set_elapsed_time(newElapsed);
    };

    const startWorkout = async () => {
        set_isRunning(true);

        const row = await workoutRepository.getWorkoutOriginalStartTime(db, workout_id);

        //Miliseconds since 1. januar 1970 at 00:00:00 UTC
        const start_time = Date.now();

        if(row.original_start_time === null){
            set_original_start_time(start_time);
            await workoutRepository.setWorkoutOriginalStartTime(db, {
                workoutId: workout_id,
                startTime: start_time,
            });
        } 
        Vibration.vibrate(500);
        set_timer_start(start_time);

        // await startTracking();
    };

    /*
    const startTracking = async () => {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') return;

        await Location.requestBackgroundPermissionsAsync();

        const hasStarted = await Location.hasStartedLocationUpdatesAsync(LOCATION_TASK);
        if (hasStarted) return;

        await Location.startLocationUpdatesAsync(LOCATION_TASK, {
            accuracy: Location.Accuracy.High,
            timeInterval: 2000,         //Miliseconds - aka 2 seconds
            distanceInterval: 5,        //Meters - aka 5 meters
            showsBackgroundLocationIndicator: true,
            foregroundService: {
                notificationTitle: "Workout tracking active",
                notificationBody: "Tracking your run...",
            },
        });
    };
    */

    const pauseWorkout = async () => {
        
        updateElapsed();

        Vibration.vibrate([0, 100, 100, 100]);
        set_isRunning(false);
        set_timer_start(null);
    };

    const endWorkout = async () => {
        set_isRunning(false);
        set_isDone(true);
        set_timer_start(null);

        // await Location.stopLocationUpdatesAsync(LOCATION_TASK);
        
        await workoutRepository.setWorkoutDone(db, {
            workoutId: workout_id,
            done: true,
        });

    };

    const restartWorkout = async () => {
        await workoutRepository.resetWorkoutState(db, workout_id);
        set_original_start_time(null);
        set_timer_start(null);
        set_elapsed_time(0);
        set_isRunning(false);
        set_isDone(false);
        triggerReload();
    }

    const calculateActiveSet = async (currentElapsed) => {
        const sets = await runningRepository.getOrderedRunSetsForWorkout(
            db,
            workout_id
        );

        let remainingElapsed = currentElapsed; 

        for (let i = 0; i < sets.length; i++) { 
            const setDuration = (sets[i].time ?? 0) * 60; 
       
             if (remainingElapsed >= setDuration) { 
                if (!sets[i].done) { 
                    await runningRepository.updateRunSetDone(db, {
                        runId: sets[i].Run_id,
                        done: true,
                    });
                    } 
                remainingElapsed -= setDuration; 
            } else {  
                const newActiveSet = sets[i].Run_id;
                //Vibration function for sets.
                if (previousActiveSetRef.current !== newActiveSet) {
                    previousActiveSetRef.current = newActiveSet;

                    if (sets[i].is_pause) {
                        Vibration.vibrate([0, 100, 100, 100]);
                    } else {
                        Vibration.vibrate(500);
                    }
                }

                set_activeSet(newActiveSet);
                set_activeSet_remainingTime(
                    Math.max(0, setDuration - remainingElapsed)); 
                return; 
            } 
        } 
                
        set_activeSet(null);
        set_activeSet_remainingTime(0);
    }

    const addSet = async (setVariety) => {
        try {
            await runningRepository.addRunSet(db, {
                workoutId: workout_id,
                type: setVariety,
            });
            triggerReload();
        } catch (error) {
            console.error("Failed to add warmup set:", error);
        }
    };

    return(
    <>
    <ScrollView>

    <View>
        <ThemedCard style={{alignItems: "center"}}>

            <View style={{flexDirection: "column", alignItems: "center"}}>
                <View style={{paddingBottom: 10, alignItems: "center"}}>
                    
                    {original_start_time !== null ? (
                        <View> 
                            <ThemedText size={10} setColor={theme.quietText}>
                                Workout started on:
                            </ThemedText>
                            <ThemedText size={10} setColor={theme.quietText}>
                                {formatWorkoutStart(original_start_time)}
                            </ThemedText>
                        </View>
                    ) : (
                        <ThemedText size={10} setColor={theme.quietText}>
                            workout has not been started yet.
                        </ThemedText>
                    )}

                    <ThemedText size={15}>
                        Elapsed time
                    </ThemedText>
                    <ThemedText size={30}>
                        {formatTime(elapsed_time + computeCurrentElapsed())}
                    </ThemedText>
                </View>

                <View style={{flexDirection: "row"}}>

                    {!isRunning && !isDone && (
                    <View style={{paddingRight: 5}}>
                        <ThemedButton
                            title={
                                (original_start_time !== null) ?
                                    "Continue"
                                    : "Start" }
                            onPress={startWorkout}
                            variant='secondary'
                            disabled={isDone || isRunning}>
                        </ThemedButton>
                    </View>
                    )}

                    {isRunning && (
                    <View>
                        <ThemedButton
                            title={"Pause"}
                            onPress={pauseWorkout}
                            variant='primary'
                            disabled={!isRunning || isDone}>
                        </ThemedButton>
                    </View>
                    )}

                    {!isRunning && !isDone && (original_start_time !== null) && (
                    <View style={{paddingLeft: 5}}>
                        <ThemedButton
                            title={"End Workout"}
                            onPress={endWorkout}
                            variant='danger'
                            disabled={
                                original_start_time === null ||
                                isDone}>
                        </ThemedButton>
                    </View>
                    )}

                    {isDone && (
                        <View style={{paddingTop: 5}}>
                            <ThemedButton
                                title={"Restart"}
                                onPress={restartWorkout}
                                variant='danger'
                                disabled={
                                    original_start_time === null ||
                                    !isDone}>
                            </ThemedButton>
                        </View>
                    )}

                </View>
            </View>

        </ThemedCard>
    </View>

    <View>
        <View style={{flexDirection: "row", alignItems: "center"}}>
            <View style={{opacity: warmupEmpty ? 0.2 : 1}}>
                <ThemedTitle type={"h2"}>
                    Warmup
                </ThemedTitle>
            </View>

            <View style={{marginLeft: "auto", marginRight: "15"}}>
                <TouchableOpacity
                    onPress={ () => {
                        addSet("WARMUP")
                    }}>
                    <Plus
                        width={24}
                        height={24}/>
                </TouchableOpacity>
            </View>
        </View>

        <RunSetList
            reloadKey={updateCount}
            triggerReload={triggerReload}
            empty={set_WarmupEmpty}
            workout_id={workout_id}
            type="WARMUP" 
            activeSet={activeSet}
            activeSet_remainingTime={activeSet_remainingTime}
            />
    </View>



    <View>
        <View style={{flexDirection: "row", alignItems: "center"}}>
            <View style={{opacity: workingEmpty ? 0.2 : 1}}>
                <ThemedTitle type={"h2"}>
                    Working Sets
                </ThemedTitle>
            </View>

            <View style={{marginLeft: "auto", marginRight: "15"}}>
                <TouchableOpacity
                    onPress={ () => {
                        addSet("WORKING_SET");
                    }}>
                    <Plus
                        width={24}
                        height={24}/>
                </TouchableOpacity>
            </View>
        </View>

        <RunSetList
            reloadKey={updateCount}
            triggerReload={triggerReload}
            empty={set_WorkingEmpty}
            workout_id={workout_id}
            type="WORKING_SET"
            activeSet={activeSet}
            activeSet_remainingTime={activeSet_remainingTime}
        />

    </View>


    <View>
        <View style={{flexDirection: "row", alignItems: "center"}}>
            <View style={{opacity: cooldownEmpty ? 0.2 : 1}}>
                <ThemedTitle type={"h2"}>
                    Cooldown
                </ThemedTitle>
            </View>

            <View style={{marginLeft: "auto", marginRight: "15"}}>
                <TouchableOpacity
                    onPress={ () => {
                        addSet("COOLDOWN");
                    }}>
                    <Plus
                        width={24}
                        height={24}/>
                </TouchableOpacity>
            </View>
        </View>

        <RunSetList
            reloadKey={updateCount}
            triggerReload={triggerReload}
            empty={set_CooldownEmpty}
            workout_id={workout_id}
            type="COOLDOWN"
            activeSet={activeSet}
            activeSet_remainingTime={activeSet_remainingTime}
        />
    </View>
    </ScrollView>
    </>
  );
}

export default Run;

