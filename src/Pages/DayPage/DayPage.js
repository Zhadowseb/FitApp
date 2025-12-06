import { StatusBar } from 'expo-status-bar';
import { View, Text, Button } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSQLiteContext } from "expo-sqlite";

import styles from './DayPageStyle';
import WorkoutList from './Components/WorkoutList/WorkoutList';

//Convert to a js Date object, so that simple addition is controlled by js.
function parseCustomDate(dateString) {
  const [day, month, year] = dateString.split(".").map(Number);
  return new Date(year, month - 1, day);
}

function formatDate(date) {
  const d = date.getDate().toString().padStart(2, "0");
  const m = (date.getMonth() + 1).toString().padStart(2, "0");
  const y = date.getFullYear();
  return `${d}-${m}-${y}`;
}

const DayPage = ( {route} ) => {
    const db = useSQLiteContext();
    const navigation = useNavigation();
    const {day, start_date, index, program_id} = route.params;

    const date = parseCustomDate(start_date);
    date.setDate(date.getDate() + (index));
    const danishDate = formatDate(date);


    const handleNewWorkout = async () => {
        try {
            const result = await db.runAsync(
                `INSERT INTO Workout (date) VALUES (?);`,
                    [danishDate]
            );
            console.log("Added in new workout with date:", danishDate);
            return result.lastInsertRowId;

        } catch (error) {
            console.error(error);
            Alert.alert(
            "Error",
            error.message || "An error occured when trying to create a new workout."
            );
        }
    };

    return (

        <View style={styles.container}>

            <View style={styles.header}>

                <View> 
                    <Text> {day} </Text> 
                </View>

            </View>

            <View style={styles.body}>
                <Text>  </Text>

                <WorkoutList date={danishDate} />

            </View>

            <View style={styles.footer}>
                <Button 
                    title = "New Workout"
                    onPress={async () => {
                        const workout_id = await handleNewWorkout();

                        navigation.navigate('ExercisePage', {
                            program_id: program_id,
                            date: date,
                            workout_id: workout_id,
                        }); 
                    }} />

            </View>
        </View>
    );
};

export default DayPage;