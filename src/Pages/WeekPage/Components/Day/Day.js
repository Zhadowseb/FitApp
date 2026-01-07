import { StatusBar } from 'expo-status-bar';
import { View, Text, TouchableOpacity } from 'react-native';
import { useNavigation } from "@react-navigation/native";
import { useSQLiteContext } from "expo-sqlite";
import { useEffect, useState } from "react";
import Svg, {Polygon, Defs, LinearGradient, Stop} from "react-native-svg"

import styles from './DayStyle';
import globalStyles from "../../../../Utils/GlobalStyling/Style"

import { calculateProgramDay } from "./dateCalculation";


const Day = ( {day, program_id, microcycle_id} ) => {
    
    const db = useSQLiteContext();
    const navigation = useNavigation();
    const [workout_count, setWorkout_count] = useState(0);
    const [workouts_done, setWorkouts_done] = useState(false);
    const [day_id, setDay_id] = useState(0);
    const [date, setDate] = useState("");
    const [program_day, setProgram_day] = useState(0);

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

    const loadDayStatus = async () => {
        try {
            const count_row = await db.getFirstAsync(
                `SELECT COUNT(*) AS workout_count FROM Workout WHERE date = ?;`,
                    [program_day]
            );
            setWorkout_count(count_row?.workout_count ?? 0);

            const day_row = await db.getFirstAsync(
                `SELECT done FROM Day WHERE date = ?`,
                [program_day]
            );
            setWorkouts_done(day_row?.done === 1);

        } catch (error) {
            Alert.alert("Error", error.message || "An error occured.");
        }
    };

    useEffect(() => {
        if (!program_day) return;

        const run = async () => {
            await initDay();
            await loadDayStatus();
        };

        run();
    }, [program_day]);


    useEffect(() => {
        const unsub = navigation.addListener("focus", async () => {
            await initDay();
            await loadDayStatus();
        });
        return unsub;
    }, [navigation]);


    const SlantedDivider = () => (
    <Svg width={24} height="100%" viewBox="0 0 24 100">
        <Defs>
        <LinearGradient id="grad" x1="0" y1="0" x2="1" y2="0">
            <Stop offset="0%" stopColor="#9e9e9e" />
            <Stop offset="100%" stopColor="#8a8a8a" />
        </LinearGradient>
        </Defs>

        <Polygon
        points="0,0 24,0 8,100 0,100"
        fill="url(#grad)"
        stroke="#000"
        strokeWidth={1}
        />
    </Svg>
    );

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

            <View style={styles.day}>
                <Text style={[workouts_done && { color: "green" }]}>
                    {day}
                </Text>

                <Text>
                    {date}
                </Text>
            </View>

            <SlantedDivider />

            <View style={styles.workouts}>
                <Text> Workouts: {workout_count} </Text>
                <Text> (if workout) Show Focus </Text>
            </View>

            <View style={styles.focus}>
                <Text> Focus </Text>
            </View>

            <StatusBar style="auto" />
        </TouchableOpacity>
    );
};

export default Day;
