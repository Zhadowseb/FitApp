import { useEffect, useState } from "react";
import { View, Text, FlatList, TouchableOpacity } from "react-native";
import { SQLiteDatabase, useSQLiteContext } from "expo-sqlite";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";

import { getTodaysDate } from '../../../../Utils/dateUtils';

import styles from "./TodayShortcutStyle"
import { ThemedTitle, ThemedCard, ThemedView, ThemedText } 
  from "../../../../Resources/Components";

const TodayShortcut = ( {program_id} ) => {
    const db = useSQLiteContext();
    const navigation = useNavigation();

    const [day, set_day] = useState([]);
    const [workouts, set_workouts] = useState([]);
    
    const getToday = async () => {
        try{

            const day_res = await db.getFirstAsync(
            `SELECT day_id, Weekday FROM Day WHERE program_id = ? AND date = ?;`,
                [program_id, getTodaysDate()]
            );
            if(!day_res) return;
            set_day(day_res);

            const workout_res = await db.getAllAsync(
            `SELECT workout_id FROM Workout WHERE day_id = ?;`,
                [day_res.day_id]
            );
            if(!workout_res) return;
            set_workouts(workout_res);

        }catch (error) {
            console.error(error);
        }
    }

    useEffect(() => {
        getToday();
    }, []);

    // Label, Sets, show workouts.

    return (
        <TouchableOpacity
            style={styles.container}
            onPress={() => {
                navigation.navigate("ExercisePage", {
                    workout_id: workouts[0].workout_id,
                    day: day.Weekday,
                    date: getTodaysDate,})
            }}>

            <View style={styles.container}>

                <View style={styles.container_left}>

                    <View style={styles.today}>
                        <ThemedText> Go to today </ThemedText>
                    </View>

                    <View style={styles.today_date}>
                        <ThemedText> {getTodaysDate()} </ThemedText>
                    </View>

                </View>

                <ThemedCard>
                    
                    <ThemedText> Workouts: </ThemedText>
                </ThemedCard>


            </View>
        </TouchableOpacity>
    );
};

export default TodayShortcut;
