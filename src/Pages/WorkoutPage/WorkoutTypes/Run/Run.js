import { StatusBar } from 'expo-status-bar';
import { View, Button, ScrollView, Text, TouchableOpacity, Switch } from 'react-native';
import { useState, useCallback, useEffect } from "react";
import { useSQLiteContext } from "expo-sqlite";
import { useFocusEffect } from "@react-navigation/native";
import RunSetList from "./RunSetList";
import ListHeader from './ListHeader';

import { useColorScheme } from "react-native";
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

    const [isRunning, set_isRunning] = useState(false);
    const [activeSet, set_activeSet] = useState("");
    const [activeSet_remainingTime, set_activeSet_remainingTime] = useState(0);
    const [isDone, set_isDone] = useState(false);


    //Focus coming back to the page
    useFocusEffect(
        useCallback(() => {
            const reload = async () => {
                const row = await db.getFirstAsync(
                    `SELECT 
                        done,
                        original_start_time,
                        timer_start, 
                        elapsed_time FROM Workout 
                    WHERE workout_id = ?;`,
                    [workout_id]
                );

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
                    await db.getFirstAsync(
                        `UPDATE Workout
                            SET timer_start = ?, 
                            elapsed_time = ?
                            WHERE workout_id = ?;`,
                        [timer_start, elapsed_time, workout_id]
                    );  
                }
                saveState();
            };

        }, [timer_start, elapsed_time])
    );

    useEffect(() => {
        const interval = setInterval(() => {
            
            if(isRunning){
                let time = computeElapsed();
                set_elapsed_time(time);
                calculateActiveSet(time);
            }

        }, 1000);

        return () => clearInterval(interval);
    }, [timer_start, isRunning, workout_id]);

    const computeElapsed = () => {
        if(timer_start === null){return}

        const seconds = Math.floor(
            elapsed_time + ((Date.now() - timer_start) / 1000)
        );
        return seconds;
    }

    const startWorkout = async () => {
        set_isRunning(true);

        const row = await db.getFirstAsync(
            `SELECT original_start_time FROM Workout 
            WHERE workout_id = ?;`,
            [workout_id]
        );

        //Miliseconds since 1. januar 1970 at 00:00:00 UTC
        const start_time = Date.now();

        if(row.original_start_time === null){
            set_original_start_time(start_time);
            await db.runAsync(
                `UPDATE Workout SET original_start_time = ? 
                WHERE workout_id = ?;`,
                [start_time, workout_id]
            );
        }
        await db.runAsync(
            `UPDATE Workout SET timer_start = ? WHERE workout_id = ?;`,
            [start_time, workout_id]
        );
        set_timer_start(start_time);
    };

    const pauseWorkout = async () => {
        set_isRunning(false);
        set_timer_start(null);
        
        await db.runAsync(
            `UPDATE Workout SET timer_start = NULL
            WHERE workout_id = ?;`,
            [workout_id]
        );
    };

    const endWorkout = async () => {
        set_isRunning(false);
        set_isDone(true);
        set_timer_start(null);
        
        await db.runAsync(
            `UPDATE Workout SET done = 1
            WHERE workout_id = ?;`,
            [workout_id]
        );
    };

    const restartWorkout = async () => {
        await db.runAsync(
            `UPDATE Workout SET 
                done = 0,
                original_start_time = NULL,
                timer_start = NULL, 
                elapsed_time = 0
                WHERE workout_id = ?;`,
            [workout_id]
        );
        set_original_start_time(null);
        set_timer_start(null);
        set_elapsed_time(0);
        set_isRunning(false);
        set_isDone(false);
        triggerReload();
    }

    const calculateActiveSet = async (currentElapsed) => {
        const sets = await db.getAllAsync( 
            `SELECT * FROM Run WHERE workout_id = ? 
                ORDER BY 
                    CASE type 
                        WHEN 'WARMUP' THEN 1 
                        WHEN 'WORKING_SET' THEN 2 
                        WHEN 'COOLDOWN' THEN 3 
                    END, 
                set_number ASC;`, [workout_id] );

        let remainingElapsed = currentElapsed; 

        for (let i = 0; i < sets.length; i++) { 
            const setDuration = (sets[i].time ?? 0) * 60; 
       
            // Hvis vi har mere elapsed end dette set varer 
             if (remainingElapsed >= setDuration) { 
                // Marker set som done hvis det ikke allerede er det 
                if (!sets[i].done) { 
                    await db.runAsync( 
                        `UPDATE Run SET done = 1 WHERE Run_id = ?;`, 
                        [sets[i].Run_id] ); 
                    } 
                remainingElapsed -= setDuration; 
            } else {  
                set_activeSet(sets[i].Run_id);
                set_activeSet_remainingTime(
                    Math.max(0, setDuration - remainingElapsed)); 
                return; 
            } 
        } 
                
        // Hvis vi når hertil → alle sets er færdige 
        setCurrentSetId(null); 
        setRemainingTime(0);
    }

    const addSet = async (setVariety) => {
        try {
            const row = await db.getFirstAsync(
                `SELECT COUNT(*) as count FROM Run WHERE 
                    workout_id = ? AND 
                    type = ? AND
                    is_pause = 0;`,
                [workout_id, setVariety]
            );

            const set_number = row.count + 1;

            await db.runAsync(
            `INSERT INTO Run (workout_id, type, set_number) 
                VALUES (?, ?, ?);`,
            [workout_id, setVariety, set_number]);
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
                        {formatTime(elapsed_time)}
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

