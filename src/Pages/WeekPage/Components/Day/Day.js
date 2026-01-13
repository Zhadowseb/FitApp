import { StatusBar } from 'expo-status-bar';
import { View, Text, TouchableOpacity } from 'react-native';
import { useNavigation } from "@react-navigation/native";
import { useSQLiteContext } from "expo-sqlite";
import { useEffect, useState } from "react";
import { useFocusEffect } from "@react-navigation/native";
import { useCallback } from "react";


import styles from './DayStyle';
import SlantedDivider from "../../../../Resources/Figures/SlantedDivider"
import { WORKOUT_ICONS } from '../../../../Resources/Icons/WorkoutLabels/index';
import ThreeDots from '../../../../Resources/Icons/UI-icons/ThreeDots';

const Day = ( {day, program_id, microcycle_id} ) => {
    
    const db = useSQLiteContext();
    const navigation = useNavigation();
    const [workout_count, setWorkout_count] = useState(0);
    const [workouts_done, setWorkouts_done] = useState(false);
    const [day_id, setDay_id] = useState(0);
    const [date, setDate] = useState("");
    const [focusText, setFocusText] = useState("Rest");
    
    const loadDay = async () => {
        try {
            const dayRow = await db.getFirstAsync(
                `SELECT day_id, date FROM Day WHERE Weekday = ? AND microcycle_id = ?;`,
                [day, microcycle_id]
            );

            if (!dayRow?.day_id) return;

            setDay_id(dayRow.day_id);
            setDate(dayRow.date);

            const countRow = await db.getFirstAsync(
                `SELECT COUNT(*) AS workout_count FROM Workout WHERE day_id = ?;`,
                [dayRow.day_id]
            );

            const count = countRow?.workout_count ?? 0;
            setWorkout_count(count);

            if (count === 0) {setFocusText("Rest"); } 
            else if (count === 1) {
                const labelRow = await db.getFirstAsync(
                    `SELECT label FROM Workout WHERE day_id = ? LIMIT 1;`,
                    [dayRow.day_id]
            );
                setFocusText(labelRow?.label ?? "Workout");
            } else { setFocusText("Multiple workouts"); }

            const doneRow = await db.getFirstAsync(
                `SELECT done FROM Day WHERE day_id = ?;`,
                [dayRow.day_id]
            );
            setWorkouts_done(doneRow?.done === 1);

        } catch (err) {
            console.error("Error loading day:", err);
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
        <TouchableOpacity
            style={[styles.container_row, styles.card]}
            onPress={() => {
            navigation.navigate("DayPage", {
                day_id: day_id,
                day: day, 
                date: date,
                program_id: program_id})
            }}>

            <SlantedDivider style={styles.slantedDivider} /> 

            <View style={styles.day}>
                <View style={styles.text}>
                    <Text style={[workouts_done && { color: "green" }]}>
                        {day}
                    </Text>

                    <Text>
                        {date}
                    </Text>
                </View>
            </View>

            <View style={[styles.workouts, styles.text]}>
                <Text> Workouts: {workout_count} </Text>
            </View>

            <View style={styles.focus}>
                <Text> Focus: </Text>
                <View style={{justifyContent: "center", alignItems: "center"}}>
                    <Text> {focusText} </Text>
                </View>

                {SelectedIcon && (
                    <View style={[styles.card, {padding: 4}]}>
                        <SelectedIcon
                            width={30}
                            height={30}
                            backgroundColor="#fff"
                    />
                    </View> )}
            </View>

            <TouchableOpacity
                style={styles.options}
                onPress={() => {
                    
                }}>

                <ThreeDots
                    width={24}
                    height={24}/>

            </TouchableOpacity>

            <StatusBar style="auto" />
        </TouchableOpacity>
    );
};

export default Day;
