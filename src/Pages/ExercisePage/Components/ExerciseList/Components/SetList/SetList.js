// src/Components/ExerciseList/ExerciseList.js
import { View, Text } from "react-native";
import Checkbox from 'expo-checkbox';

import styles from "./SetListStyle";
  
const SetList = ({ sets }) => {
  if (!sets || sets.length === 0) {
    return null;
  }

  return (
    <View style={styles.wrapper}>
      {sets.map((set) => (

        <View key={set.set_id} style={styles.container}>
            <View style={styles.set}>  
                <Text> {set.set_number} </Text>
            </View>

            <View style={styles.x}> 
                <Text> x </Text>
            </View>

            <View style={styles.reps}> 
                <Text> {set.reps} </Text>
            </View>

            <View style={styles.weight}> 
                <Text> {set.weight} </Text>
            </View>

            <View style={styles.done}> 
              <Checkbox
                value={set.done === 1}
                color={set.done ? "#4CAF50" : "#ccc"}
                style={styles.checkbox} />
            </View>

        </View>
      ))}
    </View>
  );
};

export default SetList;
