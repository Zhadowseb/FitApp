import { useEffect, useState } from "react";
import { View, Text, FlatList, TouchableOpacity } from "react-native";
import { SQLiteDatabase, useSQLiteContext } from "expo-sqlite";
import { useNavigation } from "@react-navigation/native";
import { getTodaysDate } from '../../../../Utils/dateUtils';

import styles from "./TodayShortcutStyle"

const TodayShortcut = ( {program_id} ) => {
    const db = useSQLiteContext();
    const navigation = useNavigation();

    const [today, setToday] = useState([]);
    
    const getTodaysWorkouts = async () => {
        try{
            const rows = await db.getAllAsync(
            `SELECT day_id FROM Day WHERE program_id = ? AND date = ?;`,
                [program_id, getTodaysDate()]
            );
            setToday(rows);

        }catch (error) {
            console.error(error);
        }
    }

    useEffect(() => {
        getTodaysWorkouts();
    }, []);

    return (
        <TouchableOpacity
            style={styles.container}
            onPress={() => {
                navigation.navigate("DayPage", {
                    day_id: today.day_id,
                    day: "1", 
                    date: getTodaysDate(),
                    program_id: program_id})
            }}>

            <View style={styles.container}>

                <Text> {getTodaysDate()} </Text>

            </View>
        </TouchableOpacity>
    );
};

export default TodayShortcut;
