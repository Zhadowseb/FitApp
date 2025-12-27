import { StatusBar } from 'expo-status-bar';
import { View, Text } from 'react-native';
import { useSQLiteContext } from "expo-sqlite";
import { getWeeksBeforeMesocycle } from '../../Utils/getWeeksBeforeMesocycle';
import { useEffect, useState } from "react";

import styles from './WeekPageStyle';
import Day from './Components/Day/Day';

const WeekPage = ( {route} ) => {
    const db = useSQLiteContext();

    const microcycle_id = route.params.microcycle_id;
    const microcycle_number = route.params.microcycle_number;
    const program_id = route.params.program_id;
    const [total_weeks, setTotal_weeks] =  useState(0);

    useEffect(() => {
        const fetchTotalWeeks = async () => {
            try { getWeeksBeforeMesocycle   ({
                    db,
                    program_id,
                    mesocycle_number: microcycle_number,
                }).then(weeks => {
                    setTotal_weeks(weeks + microcycle_number);
                });
            } catch (error) {
                console.error("Error fetching total weeks:", error);
            }
        };
        fetchTotalWeeks();
    }, [db, program_id, microcycle_number]);

    const weekDays = [
        'Monday', 
        'Tuesday', 
        'Wednesday', 
        'Thursday', 
        'Friday', 
        'Saturday', 
        'Sunday'];

  return (
    <View style={styles.container}>

        <View style={styles.header}>

            <Text>
                Week Overview 
            </Text>

            <Text> Mesocyle Week: {microcycle_number} </Text>
            <Text> Total Week: {total_weeks} </Text>

        </View>

        <View style={styles.body}>
            
            {weekDays.map((day, index) => (
                <Day 
                    key={day} 
                    day={day}
                    index={index}
                    program_id={program_id}
                    microcycle_id={microcycle_id}
                    />
            ))}

        </View>

        <StatusBar style="auto" />

    </View>
  );
};

export default WeekPage;