import React, { useState } from "react";
import { View, Button, Text, TouchableOpacity } from "react-native";
import { useSQLiteContext } from "expo-sqlite";
import { useNavigation } from "@react-navigation/native";

import styles from "./MicrocyclePageStyle";
import MicrocycleList from "./Components/MicrocycleList/MicrocycleList";
import ThreeDots from "../../Resources/Icons/UI-icons/ThreeDots";
import Plus from "../../Resources/Icons/UI-icons/Plus";

import { ThemedButton, 
    ThemedBottomSheet, 
    ThemedView, 
    ThemedHeader, 
    ThemedText, 
    ThemedTitle, 
    ThemedPicker } from "../../Resources/ThemedComponents";

import { parseCustomDate, formatDate, getTodaysDate } from "../../Utils/dateUtils";

const MicrocyclePage = ( {route} ) => {
    const db = useSQLiteContext();
    const navigation = useNavigation();

    const {mesocycle_id, 
            mesocycle_number, 
            mesocycle_focus, 
            program_id, 
            period_start, 
            period_end} = route.params;

    const [refreshing, set_refreshing] = useState(0);
    const [OptionsBottomsheet_visible, set_OptionsBottomsheet_visible] = useState(false);
    const [focus, set_focus] = useState(mesocycle_focus);

    const weekDays = [
        'Monday', 
        'Tuesday', 
        'Wednesday', 
        'Thursday', 
        'Friday', 
        'Saturday', 
        'Sunday'];

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

  const updateFocus = async (focus) => {
    try {

      await db.getAllAsync(
        "UPDATE Mesocycle SET focus = ? WHERE mesocycle_id = ? ",
        [focus, mesocycle_id]
      );

      updateUI();
    } catch (error) {
      console.error("Error loading programs", error);
    } finally {
      setLoading(false);
    }
  }

    const addExtraWeek = async () => {
        try {
            //Get amount of weeks.
            const get_weeks = await db.getAllAsync(
                `SELECT microcycle_id, microcycle_number FROM Microcycle WHERE mesocycle_id = ?;`,
                [mesocycle_id]
            );
            const weeks = get_weeks.length;

            const get_lastDay = await db.getFirstAsync(
                `SELECT date FROM Day WHERE 
                    microcycle_id = ? AND
                    Weekday = "Sunday";`,
                [(get_weeks[weeks-1].microcycle_id)]
            );

            //Insert new week.
            const microcycle_result = await db.runAsync(
                `INSERT INTO Microcycle (mesocycle_id, program_id, microcycle_number) VALUES (?, ?, ?);`,
                [mesocycle_id, program_id, (weeks + 1)]
            );
            const microcycle_id = microcycle_result.lastInsertRowId;

            //Insert new days.
            for(let day = 1; day <= 7; day++){

                const date = parseCustomDate(get_lastDay.date);
                date.setDate(date.getDate() + day);

                await db.runAsync(
                    `INSERT INTO Day (microcycle_id, program_id, Weekday, date) VALUES (?,?,?,?);`,
                    [microcycle_id, program_id, weekDays[day-1], formatDate(date)]
                )
            }

            updateUI();
            set_OptionsBottomsheet_visible(false);

        } catch (error) {
            console.error(error);
        }
    };


    return (
        <>
        <ThemedView>

            <ThemedHeader
                right={
                    <TouchableOpacity onPress={() => {
                        set_focus(mesocycle_focus)
                        set_OptionsBottomsheet_visible(true) }}>
                        <ThreeDots width={20} height={20} />
                    </TouchableOpacity> } >
                
                <ThemedText size={18}>Mesocycle {mesocycle_number} </ThemedText>
                <ThemedText size={10}> {period_start} - {period_end}  </ThemedText>
            

            </ThemedHeader>
            
            <MicrocycleList
                program_id={program_id}
                mesocycle_id={mesocycle_id}
                period_start={period_start}
                period_end={period_end} 
                refreshKey={refreshing}
                updateui={updateUI}/>

            <ThemedButton 
                title="Delete Mesocycle"
                variant="danger"
                width={220}
                onPress={() => deleteMesocycle()}/>

        </ThemedView>

        <ThemedBottomSheet
            visible={OptionsBottomsheet_visible}
            onClose={() => set_OptionsBottomsheet_visible(false)} >

            <View style={styles.bottomsheet_title}>
                <ThemedTitle type={"h3"} style={{flex: 10}}> 
                    Mesocycle number: {mesocycle_number} 
                </ThemedTitle>

                <View style={styles.focus}>
                    <ThemedText> Change Focus </ThemedText>

                    <ThemedPicker
                        value={focus}
                        onChange={ (newFocus) => {
                            set_focus(newFocus);
                            updateFocus(newFocus);
                        }}
                        placeholder={focus}
                        title="Select Week Focus"
                        items={[
                            "Strength",
                            "Bodybuilding",
                            "Technique",
                            "Speed / Power",
                            "Easy / Recovery",
                            "Max Test",
                        ]}
                    />
                </View>

            </View>

            <View style={styles.bottomsheet_body}>
                {/* Add on week. */}
                <TouchableOpacity 
                    style={styles.option}
                    onPress={async () => {
                        addExtraWeek();
                    }}>

                    <Plus
                        width={24}
                        height={24}/>
                    <ThemedText style={styles.option_text}> 
                        Add week to mesocycle.
                    </ThemedText>

                </TouchableOpacity>
            </View>


        </ThemedBottomSheet>
        </>
    );
};

export default MicrocyclePage;
