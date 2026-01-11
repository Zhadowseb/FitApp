import { View, Text, Button, ScrollView, TouchableOpacity } from 'react-native';
import { useSQLiteContext } from "expo-sqlite";
import { use, useState } from "react";
import { useNavigation } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import styles from './ProgramOverviewPageStyle';
import Rm_List from './Components/rm_list/rm_list';

import AddEstimatedSet from './Components/rm_list/Components/AddEstimatedSet/AddEstimatedSet';
import TodayShortcut from './Components/TodayShortcut/TodayShortcut';
import MesocycleList from '../MesocyclePage/Components/MesocycleList/MesocycleList';

const ProgramOverviewPage = ( {route} ) => {
    const db = useSQLiteContext();
    const navigation = useNavigation();
    const insets = useSafeAreaInsets();

    const program_id = route.params.program_id;
    const start_date = route.params.start_date;

    const [addEstimatedSet_visible, set_AddEstimatedSet_visible] = useState(false);
    const [rmRefreshKey, setRmRefreshKey] = useState(0);

    const refresh = () => {
        setRmRefreshKey(prev => prev + 1);
    }

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
    <ScrollView 
        style={styles.container}
        contentContainerStyle={{ paddingBottom: insets.bottom + 15}}>

        <View style={[styles.day_container, styles.card]}>

            <View style={styles.container_header}>
                <Text> Today's Workout </Text>
            </View>

            <View style={styles.day_body}>    
                <TodayShortcut
                    program_id = {program_id}
                    style = {styles.day_touchable}/>
            </View>
        </View>


        <View style={[styles.rm_container, styles.card]}>
            
            <View style={styles.container_header}>
                <Text> Estimated 1 RM's </Text>
            </View>

            <View style={styles.rm_body}>
                <Rm_List
                    program_id = {program_id}
                    refreshKey = {rmRefreshKey}
                    refresh = {refresh} />
            </View>

            <View style={styles.rm_footer}>
                <Button 
                    title="Add 1 RM" 
                    onPress={() => set_AddEstimatedSet_visible(true)}/>

                <AddEstimatedSet 
                    visible={addEstimatedSet_visible}
                    onClose={() => set_AddEstimatedSet_visible(false)}
                    onSubmit={handleAdd}/>
            </View>
        </View>

        <TouchableOpacity
                style={[styles.mesocycle_container, styles.card]}
                onPress={() => {
                    navigation.navigate("MesocyclePage", {
                    program_id: program_id,
                    start_date: start_date})
            }} >

            <View style={styles.container_header}>
                <Text> Mesocycle's </Text>
            </View>
            
            <MesocycleList 
                program_id = {program_id}/>

        </TouchableOpacity>


        <View style={[styles.pr_container, styles.card]}>
            <View style={styles.container_header}>
                <Text> Program PR's </Text>
            </View>

            <Text>
                coming soon...
            </Text>
        </View>


        <View style={[styles.delete_button_container, styles.card]}>
            <Button 
                title="Delete program"
                color="red"
                onPress={() => deleteProgram()}/>
        </View>
    </ScrollView>
  );
};

export default ProgramOverviewPage;