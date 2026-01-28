import { StatusBar } from 'expo-status-bar';
import { View, Text } from 'react-native';
import { useSQLiteContext } from "expo-sqlite";
import { getWeeksBeforeMesocycle } from '../../Utils/getWeeksBeforeMesocycle';
import { useEffect, useState } from "react";

import styles from './WeekPageStyle';

import Day from './Components/Day/Day';

import { ThemedText, ThemedView } from "../../Resources/Components";

import WeekIndicator from '../../Resources/Figures/WeekIndicator';

const WeekPage = ( {route} ) => {
    const db = useSQLiteContext();

    const microcycle_id = route.params.microcycle_id;
    const program_id = route.params.program_id;
    const period_start = route.params.period_start;
    const period_end = route.params.period_end;

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
                Week Overview (WeekPage)
            </ThemedText>

            <WeekIndicator
                start={period_start.slice(0, 5)}
                end={period_end.slice(0, 5)}
                days={[
                    { label: "Mon", active: false },
                    { label: "Tue", active: false },
                    { label: "Wed", active: true },   // ← i dag
                    { label: "Thu", active: false },
                    { label: "Fri", active: false },
                    { label: "Sat", active: false },
                    { label: "Sun", active: false },
                ]}
                size = {30}
                activeSize = {40}
                spacing = {60}
            />

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