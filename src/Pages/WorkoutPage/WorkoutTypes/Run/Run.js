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

import { formatTime } from '../../../../Utils/timeUtils';

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
    const [hasStarted, setHasStarted] = useState(false);
    const [isRunning, setIsRunning] = useState(false);
    const [isFinished, setIsFinished] = useState(false);

    const [sessionTime, setSessionTime] = useState(0);
    const [currentSetIndex, setCurrentSetIndex] = useState(0);
    const [remainingTime, setRemainingTime] = useState(0);
    const [setsQueue, setSetsQueue] = useState([]);

    useEffect(() => {
        if (!isRunning) return;

        const interval = setInterval(() => {
            setSessionTime(prev => prev + 1);

            setRemainingTime(prev => {
                if (prev > 1) {
                    return prev - 1;
                }

                setCurrentSetIndex(prevIndex => {
                    const nextIndex = prevIndex + 1;

                    if (nextIndex < setsQueue.length) {
                    setRemainingTime(setsQueue[nextIndex].duration);
                    return nextIndex;
                    }

                    setIsRunning(false);
                    setIsFinished(true);
                    return prevIndex;
                });

                return 0;
            });

        }, 1000);

        return () => clearInterval(interval);
    }, [isRunning]);


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

    const startWorkout = async () => {
        if (isFinished){
            return;
        }

        if (hasStarted) {
            setIsRunning(true);
            return;
        }

        const queue = await buildSetsQueue();
        if (!queue.length) return;

        setSetsQueue(queue);
        setCurrentSetIndex(0);
        setRemainingTime(queue[0].duration);
        setSessionTime(0);

        setHasStarted(true);
        setIsRunning(true);
    };

    const buildSetsQueue = async () => {
        const rows = await db.getAllAsync(
            `SELECT * FROM Run WHERE 
            workout_id = ?
            ORDER BY 
            CASE type
                WHEN 'WARMUP' THEN 1
                WHEN 'WORKING_SET' THEN 2
                WHEN 'COOLDOWN' THEN 3
            END,
            set_number ASC;`,
            [workout_id]
        );

        return rows.map(r => ({
            id: r.id,
            type: r.type,
            duration: Math.max(0, Number(r.time ?? 0)) * 60}));
    };

    const endWorkout = () => {
        setIsRunning(false);
        setIsFinished(true);
    };

    return(
    <>
    <ScrollView>
    <View>
        <ThemedCard style={{alignItems: "center"}}>

            <View style={{flexDirection: "column", alignItems: "center"}}>
                <View style={{paddingBottom: 20, alignItems: "center"}}>
                    <ThemedText size={15}>
                        Session time
                    </ThemedText>
                    <ThemedText size={30}>
                        {formatTime(sessionTime)}
                    </ThemedText>
                </View>

                <View style={{flexDirection: "row"}}>

                    <View style={{paddingRight: 5}}>
                        <ThemedButton
                            title={
                                isFinished
                                    ? "Finished"
                                    : isRunning
                                        ? "Running..."
                                        : hasStarted
                                            ? "Continue"
                                            : "Start workout"}
                            onPress={startWorkout}
                            variant='secondary'>
                        </ThemedButton>
                    </View>

                    <View>
                        <ThemedButton
                            title={"Pause"}
                            onPress={ () => {setIsRunning(false)}}
                            variant='primary'
                            disabled={!isRunning || isFinished}>
                        </ThemedButton>
                    </View>

                    <View style={{paddingLeft: 5}}>
                        <ThemedButton
                            title={"End Workout"}
                            onPress={endWorkout}
                            variant='danger'
                            disabled={!hasStarted || isFinished}>
                        </ThemedButton>
                    </View>
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
            activeSetId={setsQueue[currentSetIndex]?.id}
            remainingTime={remainingTime}
            isRunning={isRunning}
            hasStarted={hasStarted}
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
            activeSetId={setsQueue[currentSetIndex]?.id}
            remainingTime={remainingTime}
            isRunning={isRunning}
            hasStarted={hasStarted}
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
            activeSetId={setsQueue[currentSetIndex]?.id}
            remainingTime={remainingTime}
            isRunning={isRunning}
            hasStarted={hasStarted}
        />
    </View>
    </ScrollView>
    </>
  );
}

export default Run;

