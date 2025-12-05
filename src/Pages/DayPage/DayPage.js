import { StatusBar } from 'expo-status-bar';
import { View, Text } from 'react-native';

import styles from './DayPageStyle';

function parseCustomDate(dateString) {
  const [day, month, year] = dateString.split(".").map(Number);
  return new Date(year, month - 1, day);
}

const DayPage = ( {route} ) => {

    const {day, start_date, index} = route.params;

    const date = parseCustomDate(start_date);
    date.setDate(date.getDate() + index);
    console.log(date);
    
    return (

        <View style={styles.container}>

            <View style={styles.header}>

            </View>

            <View style={styles.body}>
                <Text> test {day} {start_date} - {index} </Text>
            </View>

        </View>

    );


};

export default DayPage;