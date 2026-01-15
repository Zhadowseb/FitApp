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

    const [today, setToday] = useState([]);
    const [workout_count, setWorkout_count] = useState(0);
    const [workouts_done, setWorkouts_done] = useState(false);
    
    const getToday = async () => {
        try{
            const rows_Day = await db.getFirstAsync(
            `SELECT day_id FROM Day WHERE program_id = ? AND date = ?;`,
                [program_id, getTodaysDate()]
            );
            if(!rows_Day) return;
            setToday(rows_Day);

            const rows_Workout = await db.getFirstAsync(
                `SELECT COUNT(*) AS count FROM Workout WHERE day_id = ?;`,
                [rows_Day.day_id]
            )
            setWorkout_count(rows_Workout.count);

            if(rows_Workout.count === 0){
                setWorkouts_done(true);
            } else {
                setWorkouts_done(false);
            }

        }catch (error) {
            console.error(error);
        }
    }

    useEffect(() => {
        getToday();
    }, []);

    return (
        <TouchableOpacity
            style={styles.container}
            onPress={() => {
                navigation.navigate("DayPage", {
                    day_id: today.day_id,
                    day: "1", 
                    date: getTodaysDate(),
                    program_id: program_id})
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

                    {workouts_done ? (
                        <Ionicons 
                            name="checkmark" 
                            size={50}
                            color="green" />
                    ) : (
                        <ThemedText>
                            {workout_count}
                        </ThemedText>
                    )}
                </ThemedCard>


            </View>
        </TouchableOpacity>
    );
};

export default TodayShortcut;
