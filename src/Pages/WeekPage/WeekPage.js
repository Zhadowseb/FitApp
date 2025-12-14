import { StatusBar } from 'expo-status-bar';
import { View, Text } from 'react-native';
import { useSQLiteContext } from "expo-sqlite";
import { useEffect, useState } from "react";
import { useNavigation } from "@react-navigation/native";

import styles from './WeekPageStyle';
import Day from './Components/Day/Day';

const WeekPage = ( {route} ) => {
    const db = useSQLiteContext();
    const navigation = useNavigation();

    const { program_id, start_date } = route.params;

    const [days, setDays] = useState([]);

    const weekDays = [
        'Monday', 
        'Tuesday', 
        'Wednesday', 
        'Thursday', 
        'Friday', 
        'Saturday', 
        'Sunday'];


    const loadDaysStatus = async () => {
        try {
            const results = [];

            for (let i = 0; i < 7; i++) {
                const dateObj = new Date(start_date);
                dateObj.setDate(dateObj.getDate() + i);

                const dateString = dateObj.toLocaleDateString("da-DK");

                const row = await db.getFirstAsync(
                    "SELECT done FROM Day WHERE date = ?;",
                    [dateString]
                );

                results.push({
                    date: dateString,
                    done: row?.done === 1
                });
            }

            setDays(results);
        } catch (err) {
            console.error("Error loading day done-status:", err);
        }
    };

    useEffect(() => {
        loadDaysStatus();
    }, []);

    useEffect(() => {
        const unsub = navigation.addListener("focus", () => {
            loadDaysStatus();
        });

        return unsub;
    }, [navigation]);

  return (
    <View style={styles.container}>

        <View style={styles.header}>

            <Text>
                Week Overview (in testing)
            </Text>

            <Text>
                #program_id: {program_id} #start_date: {start_date}
            </Text>

            <Text>
                //Week number, Program name, week focus point
            </Text>

        </View>

        <View style={styles.body}>
            
            {weekDays.map((day, index) => (
                <Day 
                    key={day} 
                    day={day}
                    program_id={program_id}
                    start_date={start_date}
                    index={index}
                    done={days[index]?.done ?? false}
                    />
            ))}

        </View>

        <StatusBar style="auto" />

    </View>
  );
};

export default WeekPage;