// src/Components/ExerciseList/ExerciseList.js
import { View, Text } from "react-native";
import Checkbox from 'expo-checkbox';
import { useSQLiteContext } from "expo-sqlite";

import styles from "./SetListStyle";
  
const SetList = ({ sets, onToggleSet }) => {

  const db = useSQLiteContext();

  if (!sets || sets.length === 0) {
    return null;
  }

  return (
    <View style={styles.wrapper}>

      <View style={styles.container}>
        <View style={[styles.pause, styles.text, styles.override]}> 
          <Text> Pause </Text>
        </View>

        <View style={[styles.set, styles.text, styles.override]}> 
          <Text> Set </Text>
        </View>

        <View style={[styles.x, styles.text, styles.override]}> 
          <Text> x </Text>
        </View>

        <View style={[styles.reps, styles.text, styles.override]}> 
          <Text> Reps </Text>
        </View>

        <View style={[styles.rpe, styles.text, styles.override]}> 
          <Text> RPE </Text>
        </View>

        <View style={[styles.weight, styles.text, styles.override]}> 
          <Text> Weight </Text>
        </View>

        <View style={[styles.done, styles.text, styles.override]}> 
          <Text> Done </Text>
        </View>
      </View>

      {sets.map((set) => (

        <View key={set.set_id} style={styles.container}>
            <View style={[styles.pause, styles.text]}> 
              <Text> {set.pause} </Text>
            </View>
  
            <View style={[styles.set, styles.text]}>  
                <Text> {set.set_number} </Text>
            </View>

            <View style={[styles.x, styles.text]}> 
                <Text> x </Text>
            </View>

            <View style={[styles.reps, styles.text]}> 
                <Text> {set.reps} </Text>
            </View>

            <View style={[styles.rpe, styles.text]}> 
                <Text> {set.rpe} </Text>
            </View>

            <View style={[styles.weight, styles.text]}> 
                <Text> {set.weight} </Text>
            </View>

            <View style={[styles.done, styles.text]}> 
              <Checkbox
                value={set.done === 1}
                color={set.done ? "#4CAF50" : "#ccc"}
                onValueChange={(checked) => onToggleSet(set.sets_id, checked)}
                style={styles.checkbox} />
            </View>

        </View>
      ))}
    </View>
  );
};

export default SetList;
