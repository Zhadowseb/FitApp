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

    const date = parseCustomDate(start_date);
    date.setDate(date.getDate() + (index));
    const danishDate = formatDate(date);

    const loadWorkoutCount = async () => {
        try {
            const result = await db.getFirstAsync(
                `SELECT COUNT(*) AS workout_count FROM Workout WHERE date = ?;`,
                    [danishDate]
            );
            setWorkout_count(result.workout_count);

        } catch (error) {
            console.error(error);
            Alert.alert(
            "Error",
            error.message || "An error occured when trying to create a new workout."
            );
        }
    };

    useEffect(() => {
      loadWorkoutCount();
    }, []);

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

            <View style={styles.day}>
                <Text> {day} </Text>    
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
