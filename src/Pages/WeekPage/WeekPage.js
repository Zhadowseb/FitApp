import { StatusBar } from 'expo-status-bar';
import { View, Text } from 'react-native';
import { useSQLiteContext } from "expo-sqlite";

import styles from './WeekPageStyle';
import Day from './Components/Day/Day';

const WeekPage = ( {route} ) => {
    const db = useSQLiteContext();

    const microcycle_id = route.params.microcycle_id;
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
                Week Overview (in testing)
            </Text>

            <Text>
                #program_id: {program_id}
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