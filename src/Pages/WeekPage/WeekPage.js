import { StatusBar } from 'expo-status-bar';
import { View, Text } from 'react-native';

import styles from './WeekPageStyle';
import Day from './Components/Day/Day';

const WeekPage = ( {route} ) => {

    const program_id = route.params.program_id;
    const start_date = route.params.start_date;
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
                    start_date={start_date}
                    index={index}
                    />
            ))}

        </View>

        <StatusBar style="auto" />

    </View>
  );
};

export default WeekPage;