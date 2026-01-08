import { StatusBar } from 'expo-status-bar';
import { View, Text, TouchableOpacity } from 'react-native';
import { useNavigation } from "@react-navigation/native";
import { useSQLiteContext } from "expo-sqlite";
import { useEffect, useState } from "react";

import styles from './DayStyle';
import SlantedDivider from "../../../../Resources/Figures/SlantedDivider"
import { WORKOUT_ICONS } from '../../../../Resources/Icons';

const Day = ( {day, program_id, microcycle_id} ) => {
    
    const db = useSQLiteContext();
    const navigation = useNavigation();
    const [workout_count, setWorkout_count] = useState(0);
    const [workouts_done, setWorkouts_done] = useState(false);
    const [day_id, setDay_id] = useState(0);
    const [date, setDate] = useState("");
    const [focusText, setFocusText] = useState("Rest");

    const initDay = async () => {
        try {
            const row = await db.getFirstAsync(
                `SELECT day_id, date FROM Day WHERE Weekday = ? AND microcycle_id = ?;`,
                [day, microcycle_id]
            );
                setDay_id(row?.day_id);
                setDate(row?.date);
        } catch (err) {
            console.error("Error ensuring Day exists:", err);
        }
    };

    useEffect(() => {
        const run = async () => {
            await initDay();
    };
        run();
    }, [microcycle_id, day]);

    useEffect(() => {
        const unsub = navigation.addListener("focus", async () => {
            await initDay();
            await loadDayStatus();
        });
        return unsub;
    }, [navigation]);

    useEffect(() => {
        if (!day_id) return;

        loadDayStatus();
    }, [day_id]);


    const loadDayStatus = async () => {
        try {
            // 1. Hent antal workouts for dagen
            const countRow = await db.getFirstAsync(
                `SELECT COUNT(*) AS workout_count FROM Workout WHERE day_id = ?;`,
                [day_id]
            );

            const count = countRow?.workout_count ?? 0;
            setWorkout_count(count);

            // 2. Afgør focus
            if (count === 0) { setFocusText("Rest"); } 
            else if (count === 1) {
                const labelRow = await db.getFirstAsync(
                    `SELECT label FROM Workout WHERE day_id = ? LIMIT 1;`,
                    [day_id]
                );
                console.log(labelRow);
                setFocusText(labelRow?.label ?? "Workout");
            } 
            else {
                setFocusText("Multiple workouts");
            }

            // 3. Done-status (som før)
            const dayRow = await db.getFirstAsync(
                `SELECT done FROM Day WHERE day_id = ?;`,
                [day_id]
            );
            setWorkouts_done(dayRow?.done === 1);
        } catch (error) {
            console.error("Error loading day status:", error);
        }
    };

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
                <Text> {focusText} </Text>
                <SelectedIcon
                  width={30}
                  height={30}
                  backgroundColor="#fff"
                />
            </View>

            <StatusBar style="auto" />
        </TouchableOpacity>
    );
};

export default Day;
