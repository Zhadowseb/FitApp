import { StatusBar } from 'expo-status-bar';
import { View, Text, TouchableOpacity, Modal } from 'react-native';
import { useNavigation } from "@react-navigation/native";
import { useSQLiteContext } from "expo-sqlite";
import { useEffect, useState } from "react";
import { useFocusEffect } from "@react-navigation/native";
import { useCallback } from "react";
import { useColorScheme } from "react-native";
import { Colors } from "../../../../Resources/GlobalStyling/colors";
import DateTimePicker from '@react-native-community/datetimepicker';
import PickWorkoutModal from './Components/PickWorkoutModal/PickWorkoutModal';

import styles from './DayStyle';
import { WORKOUT_ICONS } from '../../../../Resources/Icons/WorkoutLabels/index';

//Icons:
import ThreeDots from '../../../../Resources/Icons/UI-icons/ThreeDots';
import Plus from '../../../../Resources/Icons/UI-icons/Plus';
import Copy from '../../../../Resources/Icons/UI-icons/Copy';

//Themed components and utility
import { ThemedCard, ThemedText, ThemedBottomSheet, ThemedBouncyCheckbox } from "../../../../Resources/Components";
import { formatDate } from '../../../../Utils/dateUtils';

const Day = ( {day, program_id, microcycle_id} ) => {
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme] ?? Colors.light;
    
    const db = useSQLiteContext();
    const navigation = useNavigation();

    const [workouts, set_workouts] = useState([]);
    const [workouts_done, setWorkouts_done] = useState(false);
    const [workoutExercises, set_workoutExercises] = useState([]);
    const [day_id, setDay_id] = useState(0);
    const [date, setDate] = useState("");
    const [done, set_done] = useState(false);
    const [focusText, setFocusText] = useState("Rest");
    const [globalWeeks, set_globalWeeks] = useState(0);

    //Copy workout to different day option.
    const [newDate, set_newDate] = useState(new Date());
    const [copiedWorkout, set_copiedWorkout] = useState(0);

    //PickWorkoutModal, Option menu or actually choosing. 
    const PICK_MODE = {
        NAVIGATE: "navigate",
        COPY: "copy",
        PASTE: "paste",
    };
    const [pickMode, set_pickMode] = useState(null);

    //Helps show the correct icon.
    const SelectedIcon =
        WORKOUT_ICONS.find(item => item.id === focusText)?.Icon;
    
    //Visibility variabels for modals.
    const [pickWorkoutModal_visible, set_pickWorkoutModal_visible] = useState(false);
    const [datePicker_visible, set_datePicker_visible] = useState(false);
    const [OptionsBottomsheet_visible, set_OptionsBottomsheet_visible] = useState(false);
    
    const hasWorkouts = workouts.length > 0;
    
    
    const loadDay = async () => {
        try {
            const dayRow = await db.getFirstAsync(
                `SELECT day_id, date, done FROM Day WHERE Weekday = ? AND microcycle_id = ?;`,
                [day, microcycle_id]
            );

            if (!dayRow?.day_id) return;

            setDay_id(dayRow.day_id);
            setDate(dayRow.date);
            set_done(dayRow.done);

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
                setFocusText("..."); 
            }


            const result = [];

            for (const workout of workouts) {
                const exercises = await db.getAllAsync(
                `SELECT exercise_name, sets
                FROM Exercise
                WHERE workout_id = ?;`,
                [workout.workout_id]
                );

                result.push({
                workout_id: workout.workout_id,
                label: workout.label,
                exercises,
                });
            }

            set_workoutExercises(result);

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

    const copyWorkoutToDate = async (workoutId, date) => {

        await db.execAsync("BEGIN TRANSACTION");

        try{
            const targetDay = await db.getFirstAsync(
                `SELECT day_id FROM Day WHERE date = ? AND program_id = ?`,
                [formatDate(date), program_id]
            );

            if (!targetDay?.day_id) {
                console.warn("No day found for date");
                return;
            }

            const newWorkout = await db.runAsync(
                `INSERT INTO Workout (date, day_id, label)
                SELECT ?, ?, label FROM Workout WHERE workout_id = ?`,
                [formatDate(date), targetDay.day_id, workoutId]
            );

            const oldExercises = await db.getAllAsync(
                `SELECT * FROM Exercise WHERE workout_id = ?`,
                [workoutId]
            );


            const exerciseIdMap = {}; // { oldId: newId }

            for (const ex of oldExercises) {
                const result = await db.runAsync(
                    `INSERT INTO Exercise (workout_id, exercise_name, sets, done)
                    VALUES (?, ?, ?, 0)`,[
                    newWorkout.lastInsertRowId,
                    ex.exercise_name,
                    ex.sets, ]
                );
                exerciseIdMap[ex.exercise_id] = result.lastInsertRowId;
            }

            for (const oldExerciseId in exerciseIdMap) {
                const newExerciseId = exerciseIdMap[oldExerciseId];

                const oldSets = await db.getAllAsync(
                    `SELECT * FROM Sets WHERE exercise_id = ?`,
                    [oldExerciseId]
                );

                for (const s of oldSets) {
                    await db.runAsync(
                    `INSERT INTO Sets (
                        set_number,
                        exercise_id,
                        date,
                        personal_record,
                        pause,
                        rpe,
                        weight,
                        reps,
                        done,
                        failed,
                        note
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0, 0, ?)`,
                    [
                        s.set_number,
                        newExerciseId,
                        s.date,
                        s.personal_record,
                        s.pause,
                        s.rpe,
                        s.weight,
                        s.reps,
                        s.note,
                    ]
                    );
                }
            }

            await db.execAsync("COMMIT");

        } catch (err) {
            await db.execAsync("ROLLBACK");
            console.error("Copy workout failed:", err);
            throw err;
        }

    };

    return (
        <>
        <ThemedCard
        style={[
            styles.card,
            hasWorkouts
            ? {
                flexGrow: 1,
                minHeight: 90,
                }
            : {
                height: 50,
                opacity: 0.6,
                },
        ]}
        >
            
            <TouchableOpacity
                style={{flex: 1, flexDirection: "row"}}
                onPress={() => {
                    if(workouts.length === 1){
                        navigation.navigate("ExercisePage", {
                            workout_id: workouts[0].workout_id,
                            day: day,
                            date: date,})   
                    } else if (workouts.length > 1){

                        set_pickMode(PICK_MODE.NAVIGATE);
                        set_pickWorkoutModal_visible(true);
                    }
                }}>

                <View style={[styles.day]}>

                    <View style={{flexDirection: "row"}}>
                        <ThemedBouncyCheckbox
                            value={done === 1}
                            size= "20"
                            edgeSize={2}
                            disabled
                            checkmarkColor={theme.cardBackground}
                            style={{paddingRight: 10}}
                        />

                        <View style={styles.text}>
                            <ThemedText style={[workouts_done]}>
                                {day.slice(0, 3)}
                            </ThemedText>

                            <ThemedText>
                                {date.slice(0, 5)}
                            </ThemedText>
                        </View>
                    </View>

                {hasWorkouts && (
                    <View style={{flexDirection: "column", alignItems: "center", marginTop: 5}}>

                    <View style={ {padding: 0}}>
                        <SelectedIcon
                            width={24}
                            height={24}
                        />
                    </View>

                    <ThemedText style={{color: theme.quietText}} size={10}> 
                        {focusText} 
                    </ThemedText>

                    </View> )}

                </View>

                <View style={[styles.workouts, styles.text, {alignItems: hasWorkouts ? "flex-start" : "center"}]}>

                    {workoutExercises.length > 0 && (
                    <View style={{ overflow: "hidden" }}>
                        {workoutExercises.length === 1 ? (
                        // One workout = display exercises.
                        workoutExercises[0].exercises.map((ex, i) => (
                            <ThemedText key={`${ex.exercise_name}-${i}`}>
                            {ex.exercise_name} × {ex.sets}
                            </ThemedText>
                        ))
                        ) : (
                        // If there's multiple workouts, add a workout title.
                        workoutExercises.map((workout, wIndex) => (
                            <View key={workout.workout_id} style={{ marginBottom: 6 }}>
                            <ThemedText style={{ fontWeight: "600", opacity: 0.8 }}>
                                Workout {wIndex + 1}:
                            </ThemedText>

                            {workout.exercises.map((ex, i) => (
                                <ThemedText
                                key={`${workout.workout_id}-${i}`}
                                style={{ paddingLeft: 8 }}
                                >
                                {ex.exercise_name} × {ex.sets}
                                </ThemedText>
                            ))}
                            </View>
                        ))
                        )}
                    </View>
                    )}



                    {!hasWorkouts && (
                        <View style={{flexDirection: "row"}}>

                        <View style={ {padding: 4}}>
                            <SelectedIcon
                                width={24}
                                height={24}
                            />
                        </View>

                        <ThemedText style={{paddingTop: 7}}> {focusText} </ThemedText>

                        </View>
                    )}
                </View>


                <TouchableOpacity
                    style={styles.options}
                    onPress={async () => {
                        set_OptionsBottomsheet_visible(true);
                    }}>

                    <ThreeDots
                        width={"20"}
                        height={"20"}/>

                </TouchableOpacity>


                <StatusBar style="auto" />

            </TouchableOpacity>
        </ThemedCard>

        <ThemedBottomSheet
            visible={OptionsBottomsheet_visible}
            onClose={() => set_OptionsBottomsheet_visible(false)} >

            <View style={styles.bottomsheet_title}>
                <ThemedText> {day} </ThemedText>
                <ThemedText> {date} </ThemedText>
            </View>

            <View style={styles.bottomsheet_body}>

                {/* Add new workout to a certain day */}
                <TouchableOpacity 
                    style={[styles.option, {paddingTop: 0}]}
                    onPress={async () => {
                        set_OptionsBottomsheet_visible(false);
                        const workout_id = await handleNewWorkout();

                        navigation.navigate('ExercisePage', {
                            program_id: program_id,
                            date: date,
                            workout_id: workout_id,
                        }); 
                    }}>
                    <Plus
                        width={24}
                        height={24}/>
                    <ThemedText style={styles.option_text}> 
                        Add new workout
                    </ThemedText>
                </TouchableOpacity>

                {/* Copy a workout, and paste it to a different day */}
                <TouchableOpacity 
                    style={styles.option}
                    onPress={async () => {

                        set_pickMode(PICK_MODE.COPY);
                        set_pickWorkoutModal_visible(true);
                    }}>

                    <Copy
                        width={24}
                        height={24}/>
                    <ThemedText style={styles.option_text}> 
                        Copy workout to a different day
                    </ThemedText>

                </TouchableOpacity>

            </View>

        </ThemedBottomSheet>


        <PickWorkoutModal 
            workouts={workouts}
            visible={pickWorkoutModal_visible}
            onClose={() => set_pickWorkoutModal_visible(false)}
            onSubmit={(workout) => {

                if(pickMode === PICK_MODE.NAVIGATE){
                    navigation.navigate("ExercisePage", {
                        program_id: program_id,
                        date: date,
                        workout_id: workout.workout_id
                    });
                }

                if(pickMode === PICK_MODE.COPY){
                    set_copiedWorkout(workout.workout_id);
                    set_datePicker_visible(true);
                    set_pickWorkoutModal_visible(false);
                }
            }}
        />


        {datePicker_visible && (
            <DateTimePicker
                value={newDate}
                mode="date"
                display="default"
                onChange={async (event, date) => {
                    set_datePicker_visible(false);
                    
                    if (event.type !== "set" || !date) return;

                    await copyWorkoutToDate(copiedWorkout, date)

                    set_copiedWorkout(null);
                    set_pickMode(null);
                }}
            />
        )}



        </>
    );
};

export default Day;
