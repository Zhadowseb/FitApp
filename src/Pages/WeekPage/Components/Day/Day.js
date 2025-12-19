import { StatusBar } from 'expo-status-bar';
import { View, Text, TouchableOpacity } from 'react-native';
import { useNavigation } from "@react-navigation/native";
import { useSQLiteContext } from "expo-sqlite";
import { useEffect, useState } from "react";

import styles from './DayStyle';
import { calculateProgramDay } from "./Utils/dateCalculation";
import { initDay } from "./Utils/initDay";


const Day = ( {day, index, program_id, microcycle_id} ) => {
    
    const db = useSQLiteContext();
    const navigation = useNavigation();
    const [workout_count, setWorkout_count] = useState(0);
    const [workouts_done, setWorkouts_done] = useState(false);
    const [program_day, setProgram_day] = useState(0);

    const loadDayStatus = async () => {
        try {
            const count_row = await db.getFirstAsync(
                `SELECT COUNT(*) AS workout_count FROM Workout WHERE date = ?;`,
                    [program_day]
            );
            setWorkout_count(count_row?.workout_count ?? 0);

            const day_row = await db.getFirstAsync(
                `SELECT done FROM Day WHERE date = ?`,
                [program_day]
            );
            setWorkouts_done(day_row?.done === 1);

        } catch (error) {
            Alert.alert("Error", error.message || "An error occured.");
        }
    };

    useEffect(() => {
        const loadDate = async () => {
            const date = await calculateProgramDay({
                db,
                program_id,
                microcycle_id,
                weekdayIndex: index,
            });

            setProgram_day(date);
        };

        loadDate();
    }, [microcycle_id, index]);

    useEffect(() => {
        if (!program_day) return;

        const run = async () => {
            await initDay({
                db,
                microcycle_id,
                program_id,
                day,
                program_day
            });
            await loadDayStatus();
        };

        run();
    }, [program_day]);


    useEffect(() => {
        const unsub = navigation.addListener("focus", async () => {
            await initDay();
            await loadDayStatus();
        });
        return unsub;
    }, [navigation]);

    return (
        <TouchableOpacity
            style={styles.container_row}
            onPress={() => {
            navigation.navigate("DayPage", {
                day: day, 
                date: program_day,
                index: index,
                program_id: program_id})
            }}>

            <View style={styles.day}>
                <Text style={[workouts_done && { color: "green" }]}>
                    {day}
                </Text>

                <Text>
                    {program_day}
                </Text>
            </View>

            <View style={styles.workouts}>
                <Text> Workouts: {workout_count} </Text>
                <Text> (if workout) Show Focus </Text>
            </View>

            <View style={styles.focus}>
                <Text> Focus </Text>
            </View>

            <StatusBar style="auto" />
        </TouchableOpacity>
    );
};

export default Day;
