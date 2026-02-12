import { View, Text, Button, ScrollView, TouchableOpacity } from 'react-native';
import { useSQLiteContext } from "expo-sqlite";
import { use, useState } from "react";
import { useNavigation } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useFocusEffect } from "@react-navigation/native";
import { useCallback } from "react";

import styles from './ProgramOverviewPageStyle';
import Rm_List from './Components/rm_list/rm_list';

import AddEstimatedSet from './Components/rm_list/Components/AddEstimatedSet/AddEstimatedSet';
import TodayShortcut from './Components/TodayShortcut/TodayShortcut';
import MesocycleList from '../MesocyclePage/Components/MesocycleList/MesocycleList';

import { ThemedTitle, 
        ThemedCard, 
        ThemedView, 
        ThemedText, 
        ThemedButton, 
        ThemedModal,
        ThemedHeader } 
  from "../../Resources/ThemedComponents";

const ProgramOverviewPage = ( {route} ) => {
    const db = useSQLiteContext();
    const navigation = useNavigation();
    const insets = useSafeAreaInsets();

    const program_id = route.params.program_id;
    const start_date = route.params.start_date;

    const [addEstimatedSet_visible, set_AddEstimatedSet_visible] = useState(false);
    const [refreshKey, set_refreshKey] = useState(0);

    const refresh = () => {
        set_refreshKey(prev => prev + 1);
    }

    useFocusEffect(
        useCallback(() => {
            refresh();
        }, [])
    );

    const handleAdd = async (data) => {
        try {
            await db.runAsync(
                `INSERT INTO Estimated_set (program_id, exercise_name, estimated_weight) VALUES (?, ?, ?);`,
                [program_id, 
                data.selectedExerciseName, 
                data.estimated_weight]
            );

            refresh();
            set_AddEstimatedSet_visible(false);
        } catch (error) {
            console.error(error);
        }
        set_AddEstimatedSet_visible(false);
    }

    const deleteProgram = async () => {
        await db.execAsync("BEGIN TRANSACTION");

        try {
            await db.runAsync(`
            DELETE FROM Sets
            WHERE exercise_id IN (
                SELECT e.exercise_id
                FROM Exercise e
                JOIN Workout w ON w.workout_id = e.workout_id
                JOIN Day d ON d.day_id = w.day_id
                JOIN Microcycle mc ON mc.microcycle_id = d.microcycle_id
                JOIN Mesocycle m ON m.mesocycle_id = mc.mesocycle_id
                WHERE m.program_id = ?)`, 
                [program_id]
            );

            await db.runAsync(`
            DELETE FROM Exercise
            WHERE workout_id IN (
                SELECT w.workout_id
                FROM Workout w
                JOIN Day d ON d.day_id = w.day_id
                JOIN Microcycle mc ON mc.microcycle_id = d.microcycle_id
                JOIN Mesocycle m ON m.mesocycle_id = mc.mesocycle_id
                WHERE m.program_id = ?)`, 
                [program_id]
            );

            await db.runAsync(`
            DELETE FROM Workout
            WHERE day_id IN (
                SELECT d.day_id
                FROM Day d
                JOIN Microcycle mc ON mc.microcycle_id = d.microcycle_id
                JOIN Mesocycle m ON m.mesocycle_id = mc.mesocycle_id
                WHERE m.program_id = ?)`, 
                [program_id]);

            await db.runAsync(`
            DELETE FROM Day
            WHERE microcycle_id IN (
                SELECT mc.microcycle_id
                FROM Microcycle mc
                JOIN Mesocycle m ON m.mesocycle_id = mc.mesocycle_id
                WHERE m.program_id = ?)`, 
                [program_id]);

            await db.runAsync(`
            DELETE FROM Microcycle
            WHERE mesocycle_id IN (
                SELECT mesocycle_id FROM Mesocycle WHERE program_id = ?)`, 
                [program_id]);

            await db.runAsync(
            `DELETE FROM Mesocycle WHERE program_id = ?`,
                [program_id]
            );

            await db.runAsync(
            `DELETE FROM Program WHERE program_id = ?`,
                [program_id]
            );

            await db.execAsync("COMMIT");

        } catch (e) {
            await db.execAsync("ROLLBACK");
            throw e;
        }

        navigation.navigate("ProgramPage");
    };

  return (
    <ThemedView>
        <ThemedHeader>
            
            <ThemedText size={18}> Program Overview  </ThemedText>
            <ThemedText size={10}> {start_date} - ??  </ThemedText>
        
        </ThemedHeader>

        <ScrollView 
            style={styles.container}
            contentContainerStyle={{ paddingBottom: insets.bottom + 15}}>

            <View style={styles.day_body}>    
                <TodayShortcut
                    program_id = {program_id}
                    style = {styles.day_touchable}/>
            </View>

            <ThemedTitle type="h2"> Estimated 1 RM's </ThemedTitle>
            <ThemedCard style={styles.rm_container}>

                <View style={styles.rm_body}>
                    <Rm_List
                        program_id = {program_id}
                        refreshKey = {refreshKey}
                        refresh = {refresh} />
                </View>

                <View style={styles.rm_footer}>
                    <ThemedButton 
                        title="Add 1 RM" 
                        onPress={() => set_AddEstimatedSet_visible(true)}/>

                    <AddEstimatedSet 
                        visible={addEstimatedSet_visible}
                        onClose={() => set_AddEstimatedSet_visible(false)}
                        onSubmit={handleAdd}/>
                </View>
            </ThemedCard>

            <ThemedTitle type="h2"> Mesocycle's </ThemedTitle>
            <ThemedView>
                <TouchableOpacity
                        style={[styles.mesocycle_container]}
                        onPress={() => {
                            navigation.navigate("MesocyclePage", {
                            program_id: program_id,
                            start_date: start_date})
                    }} >
                    
                    <MesocycleList 
                        program_id = {program_id}
                        start_date={start_date}
                        refreshKey= {refreshKey} 
                        refresh={refresh}/>

                </TouchableOpacity>
            </ThemedView>

            <ThemedTitle type="h2"> Program PR's </ThemedTitle>
            <ThemedCard style={styles.pr_container}>

                <ThemedText>
                    coming soon...
                </ThemedText>
            </ThemedCard>


        
            <ThemedButton 
                title="Delete program"
                variant='danger'
                width={250}
                onPress={() => deleteProgram()}/>
            
        </ScrollView>
    </ThemedView>
  );
};

export default ProgramOverviewPage;