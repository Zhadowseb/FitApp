import { View, Text, Button } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSQLiteContext } from "expo-sqlite";
import { useState, useEffect } from "react";

import styles from './DayPageStyle';
import WorkoutList from './Components/WorkoutList/WorkoutList';

const DayPage = ( {route} ) => {
    const db = useSQLiteContext();
    const navigation = useNavigation();
    const [allDone, setAllDone] = useState(false);
    const {day_id, day, date, program_id} = route.params;

    const handleNewWorkout = async () => {
        try {
            const result = await db.runAsync(
                `INSERT INTO Workout (date, day_id) VALUES (?, ?);`,
                    [date, day_id]
            );
            console.log("Added in new workout with date:", date);
            return result.lastInsertRowId;

        } catch (error) {
            console.error(error);
        }
    };

    const checkIfAllWorkoutsDone = async () => {
        try {
            const rows = await db.getAllAsync(
                `SELECT done FROM Workout WHERE date = ?;`,
                [date]
            );

            if (rows.length === 0) return false;

            return rows.every(r => r.done === 1);
        } catch (error) {
            console.error("Error checking workout done state", error);
            return false;
        }
    };

    const updateDayDone = async (isDone) => {
        try {
            await db.runAsync(
                `UPDATE Day SET done = ? WHERE date = ?;`,
                [isDone ? 1 : 0, date]
            );
        } catch (error) {
            console.error("Error updating Day.done", error);
        }
    };

    useEffect(() => {
        const unsub = navigation.addListener("focus", async () => {
            const result = await checkIfAllWorkoutsDone();
            setAllDone(result);

            await updateDayDone(result);
        });

        return unsub;
    }, [navigation]);

    return (

        <View style={styles.container}>

            <View style={styles.header}>

                <View> 
                    <Text style={[styles.headerText, allDone && { color: "green" }]}>
                        {day}
                    </Text>
                </View>

            </View>

            <View style={styles.body}>
                
                <WorkoutList date={date} />

            </View>

            <View style={styles.footer}>
                <Button 
                    title = "New Workout"
                    onPress={async () => {
                        const workout_id = await handleNewWorkout();

                        navigation.navigate('ExercisePage', {
                            program_id: program_id,
                            date: date,
                            workout_id: workout_id,
                        }); 
                    }} />

            </View>
        </View>
    );
};

export default DayPage;