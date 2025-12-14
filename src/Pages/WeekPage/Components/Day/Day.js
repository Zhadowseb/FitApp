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

const Day = ( {day, start_date, index, program_id} ) => {
    
    const db = useSQLiteContext();
    const navigation = useNavigation();
    const [workout_count, setWorkout_count] = useState(0);
    const [workouts_done, setWorkouts_done] = useState(false);

    const date = parseCustomDate(start_date);
    date.setDate(date.getDate() + (index));
    const danishDate = formatDate(date);

    const initDay = async () => {
        try {
            await db.runAsync(
                `INSERT INTO Day (date, Weekday, done)
                SELECT ?, ?, 0
                WHERE NOT EXISTS (SELECT 1 FROM Day WHERE date = ?);`,
                [danishDate, day, danishDate]
            );
        } catch (err) {
            console.error("Error ensuring Day exists:", err);
        }
    };

    const loadDayStatus = async () => {
        try {
            const count_row = await db.getFirstAsync(
                `SELECT COUNT(*) AS workout_count FROM Workout WHERE date = ?;`,
                    [danishDate]
            );
            setWorkout_count(count_row?.workout_count ?? 0);

            const day_row = await db.getFirstAsync(
                `SELECT done FROM Day WHERE date = ?`,
                [danishDate]
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
                danishDate: danishDate,
                index: index,
                program_id: program_id})
            }}>

            <Text style={[styles.day, workouts_done && { color: "green" }]}>
                {day}
            </Text>

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
