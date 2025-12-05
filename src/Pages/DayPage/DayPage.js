import { StatusBar } from 'expo-status-bar';
import { View, Text, Button } from 'react-native';
import { useNavigation } from '@react-navigation/native';

import styles from './DayPageStyle';

//Convert to a js Date object, so that simple addition is controlled by js.
function parseCustomDate(dateString) {
  const [day, month, year] = dateString.split(".").map(Number);
  return new Date(year, month - 1, day);
}

const DayPage = ( {route} ) => {

    const navigation = useNavigation();
    const {day, start_date, index, program_id} = route.params;

    const date = parseCustomDate(start_date);
    date.setDate(date.getDate() + (index));
    
    return (

        <View style={styles.container}>

            <View style={styles.header}>

                <View> 
                    <Text> {day} </Text> 
                </View>

            </View>

            <View style={styles.body}>
                <Text>  </Text>

        

            </View>

            <View style={styles.footer}>
                <Button 
                    title = "New Workout"
                    onPress={() => navigation.navigate('ExercisePage', {
                        program_id: program_id} 
                    )} 
                    style={styles.buttonContainer} />
            </View>

        </View>

    );


};

export default DayPage;