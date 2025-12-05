import { StatusBar } from 'expo-status-bar';
import { View, Text, TouchableOpacity } from 'react-native';
import { useNavigation } from "@react-navigation/native";

import styles from './DayStyle';

const Day = ( {day, start_date, index} ) => {
    
    const navigation = useNavigation();

    return (
        <TouchableOpacity
            style={styles.container_row}
            onPress={() => {
            navigation.navigate("DayPage", {
                day: day, 
                start_date: start_date,
                index: index})
            }}>

            <View style={styles.day}>
                <Text> {day} </Text>    
            </View>

            <View style={styles.workouts}>
                <Text> Workouts: ? </Text>
                <Text> (if workout) Show Focus </Text>
            </View>

            <View style={styles.focus}>
                <Text> Focus </Text>
            </View>

            <StatusBar style="auto" />
        </TouchableOpacity>
    );
};

export default Day;
