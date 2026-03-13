import { StatusBar } from 'expo-status-bar';
import { View, Button, ScrollView, Text } from 'react-native';
import { useSQLiteContext } from "expo-sqlite";
import { useState, useEffect } from "react";

import styles from './ExerciseStorageListStyle';
import { weightliftingService as weightliftingRepository } from "../../../../Services";

const ExerciseStorageList = ( {refreshKey} ) => {

    const db = useSQLiteContext();

    const [exercises, set_exercises] = useState([]);

    const loadExerciseStorage = async () => {
        try {
            const rows = await weightliftingRepository.getExerciseStorage(db);

            set_exercises(rows);
        } catch (error) {
            console.error("Error loading exercise_storage", error);
        } finally {
        }
    };

    useEffect(() => {
        loadExerciseStorage();
    }, [refreshKey]);

    
    return (
        <View style={styles.card}>
            <View style={styles.header}>
                <Text>
                    Available Exercises:
                </Text>
            </View>

            <View style={styles.body}>
                <ScrollView>
                    {exercises.map((exercise) => (
                        <View key={exercise.exercise_name}>
                            <Text> {exercise.exercise_name} </Text>
                        </View>
                    ))}

                </ScrollView>
            </View>

        </View>
    );
};

export default ExerciseStorageList;
