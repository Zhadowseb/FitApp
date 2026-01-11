import { StatusBar } from 'expo-status-bar';
import { View, Text } from 'react-native';
import { useSQLiteContext } from "expo-sqlite";
import { getWeeksBeforeMesocycle } from '../../Utils/getWeeksBeforeMesocycle';
import { useEffect, useState } from "react";

import styles from './WeekPageStyle';
import globalStyles from "../../Utils/GlobalStyling/Style"

import Day from './Components/Day/Day';

const WeekPage = ( {route} ) => {
    const db = useSQLiteContext();

    const microcycle_id = route.params.microcycle_id;
    const microcycle_number = route.params.microcycle_number;
    const program_id = route.params.program_id;

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
            <Text> Total Week: </Text>

        </View>

        <View style={styles.body}>
            
            {weekDays.map((day) => (
                <Day 
                    key={day}
                    day={day}
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