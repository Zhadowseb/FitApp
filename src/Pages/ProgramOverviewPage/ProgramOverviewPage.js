import { View, Text, Button, ScrollView, TouchableOpacity } from 'react-native';
import { useSQLiteContext } from "expo-sqlite";
import { use, useState } from "react";
import { useNavigation } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useFocusEffect } from "@react-navigation/native";
import { useCallback } from "react";
import { useColorScheme } from "react-native";
import { Colors } from "../../Resources/GlobalStyling/colors";

import styles from './ProgramOverviewPageStyle';
import Rm_List from './Components/rm_list/rm_list';

import AddEstimatedSet from './Components/rm_list/Components/AddEstimatedSet/AddEstimatedSet';
import TodayShortcut from './Components/TodayShortcut/TodayShortcut';
import MesocycleList from '../MesocyclePage/Components/MesocycleList/MesocycleList';
import ThreeDots from "../../Resources/Icons/UI-icons/ThreeDots"

import { ThemedTitle, 
        ThemedCard, 
        ThemedView, 
        ThemedText, 
        ThemedButton, 
        ThemedModal,
        ThemedHeader,
        ThemedBottomSheet } 
  from "../../Resources/ThemedComponents";
import Delete from '../../Resources/Icons/UI-icons/Delete';

const ProgramOverviewPage = ( {route} ) => {
    const db = useSQLiteContext();
    const navigation = useNavigation();
    const insets = useSafeAreaInsets();
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme] ?? Colors.light;

    const program_id = route.params.program_id;
    const start_date = route.params.start_date;

    const [addEstimatedSet_visible, set_AddEstimatedSet_visible] = useState(false);
    const [refreshKey, set_refreshKey] = useState(0);
    const [status, set_status] = useState("NOT_STARTET");

    const [OptionsBottomsheet_visible, set_OptionsBottomsheet_visible] = useState(false);

    const refresh = () => {
        set_refreshKey(prev => prev + 1);
    }

    //Coming to page
    useFocusEffect(
        useCallback(() => {
            refresh();
            getStatus();
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

    const getStatus = async () => {
        try {
            const new_status = await db.getFirstAsync(
                `SELECT status FROM Program WHERE program_id = ?;`,
                [program_id]);
            set_status(new_status.status);
        } catch (error) {
            console.error(error);
        }
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

    const changeStatus = async (new_status) => {
        console.log(new_status);
        await db.runAsync(
            `UPDATE Program SET status = ? WHERE program_id = ?;`,
            [new_status, program_id]
        );
        set_status(new_status);
    }

  return (
    <>
    <ThemedView>
        <ThemedHeader
            right={
                <TouchableOpacity onPress={() => {
                    set_OptionsBottomsheet_visible(true) }}>
                    <ThreeDots width={20} height={20} />
                </TouchableOpacity> } >
            
            <ThemedText size={18}> Program Overview  </ThemedText>
            <ThemedText size={10}> {start_date} - ??  </ThemedText>
        
        </ThemedHeader>

        <ScrollView 
            style={styles.container}
            contentContainerStyle={{ paddingBottom: insets.bottom + 15}}>

            {/* Workout shortcut */}
            <View style={styles.day_body}>    
                <TodayShortcut
                    program_id = {program_id}
                    style = {styles.day_touchable}/>
            </View>

            {/* Mesocycle list */}
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

            {/* Program PR's */}
            <ThemedTitle type="h2"> New Bests </ThemedTitle>
            <ThemedCard style={styles.pr_container}>

                <ThemedText>
                    coming soon...
                </ThemedText>
            </ThemedCard>

            {/* 1 rm estimates. */}
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

            {/* Program setting and status */}
            <ThemedTitle type="h2"> Settings </ThemedTitle>
            <ThemedCard>

                {/* Change status of the program */}
                <View style={{alignItems: "center", paddingBottom: 10}}>
                    <ThemedText>
                        Program status
                    </ThemedText>
                </View>

                <View style={{flexDirection: "row", flex: 1}}>
                    
                    <View style={{flex: 1,
                        opacity: status === "COMPLETE" ? 1 : 0.2}}>
                        <ThemedButton
                            title="COMPLETE"
                            style={{backgroundColor: theme.COMPLETE}}
                            width={80}
                            textSize={8} 
                            onPress={ () => {
                                changeStatus("COMPLETE") }}/>
                    </View>

                    <View style={{flex: 1,
                        opacity: status === "ACTIVE" ? 1 : 0.2}}>
                        <ThemedButton
                            title="ACTIVE"
                            style={{backgroundColor: theme.ACTIVE}}
                            width={80}
                            textSize={8}
                            onPress={ () => {
                                changeStatus("ACTIVE") }} />
                    </View>


                    <View style={{flex: 1, 
                        opacity: status === "NOT_STARTED" ? 1 : 0.2}}>
                        <ThemedButton
                            title="NOT STARTED"
                            style={{backgroundColor: theme.NOT_STARTED}}
                            width={80}
                            textSize={8} 
                            onPress={ () => {
                                changeStatus("NOT_STARTED") }}/>
                    </View>
                </View>

                {/* Change program name */}
                <View style={{
                    alignItems: "center", 
                    paddingBottom: 10,
                    paddingTop: 10}}>
                    <ThemedText>
                        Program name
                    </ThemedText>
                </View>


            {/* 
        
            Change program name. 
            
            */}

            </ThemedCard>

            
        </ScrollView>
    </ThemedView>

        <ThemedBottomSheet
            visible={OptionsBottomsheet_visible}
            onClose={() => set_OptionsBottomsheet_visible(false)} >

            <View style={styles.bottomsheet_title}>
                <ThemedTitle type={"h3"} style={{flex: 10}}> 
                    test 
                </ThemedTitle>


            </View>

            <View style={styles.bottomsheet_body}>
                
                {/* Delete Program */}
                <TouchableOpacity 
                    style={styles.option}
                    onPress={async () => {
                        deleteProgram();
                    }}>

                    <Delete
                        width={24}
                        height={24}/>
                    <ThemedText style={styles.option_text}> 
                        Delete program.
                    </ThemedText>

                </TouchableOpacity>
            </View>


        </ThemedBottomSheet>
        </>
  );
};

export default ProgramOverviewPage;