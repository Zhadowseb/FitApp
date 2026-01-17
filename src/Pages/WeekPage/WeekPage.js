import { StatusBar } from 'expo-status-bar';
import { View, Text } from 'react-native';
import { useSQLiteContext } from "expo-sqlite";
import { getWeeksBeforeMesocycle } from '../../Utils/getWeeksBeforeMesocycle';
import { useEffect, useState } from "react";

import styles from './WeekPageStyle';

import Day from './Components/Day/Day';

import { ThemedText, ThemedView } from "../../Resources/Components";

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
    <ThemedView>

        <View style={styles.header}>

            <ThemedText>
                Week Overview 
            </ThemedText>

            <ThemedText> Mesocyle Week: {microcycle_number} </ThemedText>
            <ThemedText> Total Week: </ThemedText>

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

    </ThemedView>
  );
};

export default WeekPage;