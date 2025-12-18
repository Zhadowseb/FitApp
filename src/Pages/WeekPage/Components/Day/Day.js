import { StatusBar } from 'expo-status-bar';
import { View, Text, TouchableOpacity } from 'react-native';
import { useNavigation } from "@react-navigation/native";
import { useSQLiteContext } from "expo-sqlite";
import { useEffect, useState } from "react";

import styles from './DayStyle';

function parseCustomDate(dateString) {
  const [day, month, year] = dateString.split(".").map(Number);
  return new Date(year, month - 1, day);
}

function formatDate(date) {
  const d = date.getDate().toString().padStart(2, "0");
  const m = (date.getMonth() + 1).toString().padStart(2, "0");
  const y = date.getFullYear();
  return `${d}-${m}-${y}`;
}

const Day = ( {day, index, program_id, microcycle_id} ) => {
    
    const db = useSQLiteContext();
    const navigation = useNavigation();
    const [workout_count, setWorkout_count] = useState(0);
    const [workouts_done, setWorkouts_done] = useState(false);
    const [program_day, setProgram_day] = useState(0);

    const calculate_date = async () => {
        try {
            const microcycle = await db.getFirstAsync(
                `SELECT mesocycle_id, microcycle_number FROM Microcycle WHERE microcycle_id = ?;`,
                [microcycle_id]
            );

            const mesocycle = await db.getFirstAsync(
                `SELECT mesocycle_number FROM Mesocycle WHERE 
                    mesocycle_id = ? AND 
                    program_id = ?;`,
                    [microcycle.mesocycle_id, program_id]
            )

            const row = await db.getFirstAsync(
                `SELECT COALESCE( SUM(weeks), 0) AS total_weeks FROM Mesocycle
                    WHERE program_id = ?
                    AND mesocycle_number < ?;`,
                    [program_id, mesocycle.mesocycle_number]
            )

            let week_count = row.total_weeks + microcycle.microcycle_number;

            let newDate = (week_count * 7 + index) - 7;

            const program = await db.getFirstAsync(
                `SELECT start_date FROM Program WHERE program_id = ?;`,
                [program_id]
            );

            const date = parseCustomDate(program.start_date);
            date.setDate(date.getDate() + newDate);
            const danishDate = formatDate(date);

            setProgram_day(danishDate);
        } catch (err) {
            console.error("Error ensuring Day exists:", err);
        }
    }

    calculate_date();

    const initDay = async () => {
        try {
            await db.runAsync(
                `INSERT INTO Day (microcycle_id, program_id, Weekday, date, done)
                SELECT ?, ?, ?, ?, 0
                WHERE NOT EXISTS (SELECT 1 FROM Day WHERE date = ?);`,
                [microcycle_id, program_id, day, program_day, program_day]
            );
        } catch (err) {
            console.error("Error ensuring Day exists:", err);
        }
    };

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
            console.error(error);
            Alert.alert("Error", error.message || "An error occured.");
        }
    };

    useEffect(() => {
      loadDayStatus();
    }, []);

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
                program_day: program_day,
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
