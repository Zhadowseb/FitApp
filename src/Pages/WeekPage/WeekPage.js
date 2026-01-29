import { StatusBar } from 'expo-status-bar';
import { View, Text } from 'react-native';
import { useSQLiteContext } from "expo-sqlite";
import { formatDate, parseCustomDate } from '../../Utils/dateUtils';
import { useEffect, useState } from "react";
import { WORKOUT_ICONS } from "../../Resources/Icons/WorkoutLabels";
import Rest from "../../Resources/Icons/WorkoutLabels/Rest";

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

    const [daySummaries, setDaySummaries] = useState([]);

    useEffect(() => {
    const loadWeekSummary = async () => {
        const summaries = [];

        for (let i = 0; i < 7; i++) {
            const date = parseCustomDate(period_start);
            date.setDate(date.getDate() + i);

        const dayRow = await db.getFirstAsync(
            `SELECT day_id FROM Day
            WHERE microcycle_id = ?
            AND date = ?`,
            [microcycle_id, formatDate(date)]
        );

        let icon = null;
        let iconLabel = null;

        if(dayRow){
            const workouts = await db.getAllAsync(
                `SELECT label FROM Workout WHERE day_id = ?`,
                [dayRow.day_id]
            );
        
            if (workouts.length === 1) {
                const found =
                    WORKOUT_ICONS.find(w => w.id === workouts[0].label);
                
                icon = found?.Icon ?? null;
                iconLabel = found?.short ?? workouts[0].label;
            } else if (workouts.length > 1) {
                const multi =
                    WORKOUT_ICONS.find(w => w.id === "Multiple");

                icon = multi?.Icon ?? null;
                iconLabel = "Multi";
            }
        }

        summaries.push({
            icon,
            iconLabel,
            active: formatDate(date) === formatDate(new Date()),
        });
        }

        setDaySummaries(summaries);
    };

    loadWeekSummary();
    }, [microcycle_id]);

    

    const days = weekDays.map((label, index) => ({
        label: label.slice(0, 3),
        active: daySummaries[index]?.active ?? false,
        icon: daySummaries[index]?.icon ?? null,
        iconLabel: daySummaries[index]?.iconLabel ?? null,
    }));
    

  return (
    <ThemedView>

        <View style={styles.header}>

            <WeekIndicator
                start={period_start.slice(0, 5)}
                end={period_end.slice(0, 5)}
                days={days}
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