import { StatusBar } from 'expo-status-bar';
import { View, Text } from 'react-native';

import styles from './WeekPageStyle';
import Day from './Components/Day/Day';

const WeekPage = () => {

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

            <Text>
                //Week number, Program name, week focus point
            </Text>

        </View>

        <View style={styles.body}>
            
            {weekDays.map(day => (
                <Day key={day} day={day}/>
            ))}

        </View>

        <StatusBar style="auto" />

    </View>
  );
};

export default WeekPage;