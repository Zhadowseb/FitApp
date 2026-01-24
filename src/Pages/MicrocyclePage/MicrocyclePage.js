import React, { useState } from "react";
import { View, Button, Text } from "react-native";
import { useSQLiteContext } from "expo-sqlite";
import { useNavigation } from "@react-navigation/native";

import styles from "./MicrocyclePageStyle";
import MicrocycleList from "./Components/MicrocycleList/MicrocycleList";

import { ThemedButton, ThemedCard, ThemedView } from "../../Resources/Components";

const MicrocyclePage = ( {route} ) => {
    const db = useSQLiteContext();
    const navigation = useNavigation();

    const {mesocycle_id, program_id} = route.params;

    const [refreshing, set_refreshing] = useState(0);

    const updateUI = () => {
        set_refreshing(prev => prev + 1);
    }

    const deleteMesocycle = async () => {
        await db.execAsync("BEGIN TRANSACTION");

        try {
            // 1. Delete Sets
            await db.runAsync(`
            DELETE FROM Sets
            WHERE exercise_id IN (
                SELECT e.exercise_id
                FROM Exercise e
                JOIN Workout w ON w.workout_id = e.workout_id
                JOIN Day d ON d.day_id = w.day_id
                JOIN Microcycle mc ON mc.microcycle_id = d.microcycle_id
                WHERE mc.mesocycle_id = ?
            )
            `, [mesocycle_id]);

            // 2. Delete Exercises
            await db.runAsync(`
            DELETE FROM Exercise
            WHERE workout_id IN (
                SELECT w.workout_id
                FROM Workout w
                JOIN Day d ON d.day_id = w.day_id
                JOIN Microcycle mc ON mc.microcycle_id = d.microcycle_id
                WHERE mc.mesocycle_id = ?
            )
            `, [mesocycle_id]);

            // 3. Delete Workouts
            await db.runAsync(`
            DELETE FROM Workout
            WHERE day_id IN (
                SELECT d.day_id
                FROM Day d
                JOIN Microcycle mc ON mc.microcycle_id = d.microcycle_id
                WHERE mc.mesocycle_id = ?
            )
            `, [mesocycle_id]);

            // 4. Delete Days
            await db.runAsync(`
            DELETE FROM Day
            WHERE microcycle_id IN (
                SELECT microcycle_id
                FROM Microcycle
                WHERE mesocycle_id = ?
            )
            `, [mesocycle_id]);

            // 5. Delete Microcycles
            await db.runAsync(`
            DELETE FROM Microcycle
            WHERE mesocycle_id = ?
            `, [mesocycle_id]);

            // 6. Delete Mesocycle
            await db.runAsync(`
            DELETE FROM Mesocycle
            WHERE mesocycle_id = ?
            `, [mesocycle_id]);

            await db.execAsync("COMMIT");

        } catch (e) {
            await db.execAsync("ROLLBACK");
            console.error("deleteMesocycle failed:", e);
            throw e;
        }

        navigation.goBack();
    };


    return (
        <ThemedView>
            
            <MicrocycleList
                program_id={program_id}
                mesocycle_id={mesocycle_id} 
                refreshKey={refreshing}
                updateui={updateUI}/>

            <ThemedButton 
                title="Delete Mesocycle"
                variant="danger"
                width={220}
                onPress={() => deleteMesocycle()}/>

        </ThemedView>
    );
};

export default MicrocyclePage;
