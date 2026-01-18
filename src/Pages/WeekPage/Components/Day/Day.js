import { StatusBar } from 'expo-status-bar';
import { View, Text, TouchableOpacity, Modal } from 'react-native';
import { useNavigation } from "@react-navigation/native";
import { useSQLiteContext } from "expo-sqlite";
import { useEffect, useState } from "react";
import { useFocusEffect } from "@react-navigation/native";
import { useCallback } from "react";


import styles from './DayStyle';
import SlantedDivider from "../../../../Resources/Figures/SlantedDivider"
import { WORKOUT_ICONS } from '../../../../Resources/Icons/WorkoutLabels/index';
import ThreeDots from '../../../../Resources/Icons/UI-icons/ThreeDots';
import PickWorkoutModal from './PickWorkoutModal/PickWorkoutModal';

import { ThemedCard, ThemedText, ThemedView, ThemedBottomSheet } from "../../../../Resources/Components";

const Day = ( {day, program_id, microcycle_id} ) => {
    
    const db = useSQLiteContext();
    const navigation = useNavigation();
    const [workouts, set_workouts] = useState([]);
    const [workouts_done, setWorkouts_done] = useState(false);
    const [day_id, setDay_id] = useState(0);
    const [date, setDate] = useState("");
    const [focusText, setFocusText] = useState("Rest");

    const [PickWorkoutModal_visible, set_PickWorkoutModal_visible] = useState(false);
    
    const loadDay = async () => {
        try {
            const dayRow = await db.getFirstAsync(
                `SELECT day_id, date FROM Day WHERE Weekday = ? AND microcycle_id = ?;`,
                [day, microcycle_id]
            );

            if (!dayRow?.day_id) return;

            setDay_id(dayRow.day_id);
            setDate(dayRow.date);

            const workouts = await db.getAllAsync(
                `SELECT workout_id, label, done, day_id FROM Workout WHERE day_id = 
                (SELECT day_id FROM Day WHERE Weekday = ? AND microcycle_id = ?);`,
                [day, microcycle_id]
            );
            set_workouts(workouts);

            if (workouts.length === 0) {setFocusText("Rest"); } 
            else if (workouts.length === 1) {

                setFocusText(workouts[0].label);
            } else { 
                setFocusText("Multiple workouts"); 
            }

            const doneRow = await db.getFirstAsync(
                `SELECT done FROM Day WHERE day_id = ?;`,
                [dayRow.day_id]
            );
            setWorkouts_done(doneRow?.done === 1);

        } catch (err) {
            console.error("Error loading day:", err);
        }
    };

    const handleNewWorkout = async () => {
        try {
            const result = await db.runAsync(
                `INSERT INTO Workout (date, day_id) VALUES (?, ?);`,
                    [date, day_id]
            );
            return result.lastInsertRowId;

        } catch (error) {
            console.error(error);
        }
    };

    useFocusEffect(
        useCallback(() => {
            loadDay();
        }, [day, microcycle_id])
    );



    const SelectedIcon =
        WORKOUT_ICONS.find(item => item.id === focusText)?.Icon;

    return (
        <>
        <ThemedCard
            style={{
            flex: 1}}>
            
            <TouchableOpacity
                style={{flex: 1, flexDirection: "row"}}
                onPress={() => {
                    if(workouts.length === 1){
                        navigation.navigate("ExercisePage", {
                            workout_id: workouts[0].workout_id,
                            date: date,})   
                    } else if (workouts.length > 1){

                        set_PickWorkoutModal_visible(true);
                    }
                }}>

                <View style={styles.day}>
                    <View style={styles.text}>
                        <ThemedText style={[workouts_done && { color: "green" }]}>
                            {day}
                        </ThemedText>

                        <ThemedText>
                            {date}
                        </ThemedText>
                    </View>
                </View>

                <View style={[styles.workouts, styles.text]}>
                    <ThemedText> Workouts: {workouts.length} </ThemedText>
                </View>

                <View style={styles.focus}>
                    <ThemedText> Focus: </ThemedText>
                    <View style={{justifyContent: "center", alignItems: "center"}}>
                        <ThemedText> {focusText} </ThemedText>
                    </View>

                    {SelectedIcon && (
                        <View style={[styles.card, {padding: 4}]}>
                            <SelectedIcon
                                width={24}
                                height={24}
                                backgroundColor="#fff"
                        />
                        </View> )}
                </View>

                <TouchableOpacity
                    style={styles.options}
                    onPress={async () => {
                        set_PickWorkoutModal_visible(true);


                        /*
                        const workout_id = await handleNewWorkout();

                        navigation.navigate('ExercisePage', {
                            program_id: program_id,
                            date: date,
                            workout_id: workout_id,
                        }); 

                        */
                    }}>

                    <ThreeDots
                        width={24}
                        height={24}/>

                </TouchableOpacity>


                <StatusBar style="auto" />

            </TouchableOpacity>
        </ThemedCard>

        <ThemedBottomSheet
            visible={PickWorkoutModal_visible}
            onClose={() => set_PickWorkoutModal_visible(false)} >
                
        </ThemedBottomSheet>

        {/* 
        <PickWorkoutModal 
            workouts={workouts}
            visible={PickWorkoutModal_visible}
            onClose={() => set_PickWorkoutModal_visible(false)}
            />
        */}
        
        </>
    );
};

export default Day;
