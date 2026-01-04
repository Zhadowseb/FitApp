// src/Components/ExerciseList/ExerciseList.js
import { View, Text, TextInput } from "react-native";
import Checkbox from 'expo-checkbox';

import styles from "./SetListStyle";
import Title from "./Title/Title";
  
const SetList = ({ sets, onToggleSet, editMode }) => {


  if (!sets || sets.length === 0) {
    return null;
  }

  return (
    <View style={styles.wrapper}>

      <Title />

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
                {editMode ? 
                  <Text> {set.weight} </Text>
                  :
                  <TextInput 
                    placeholder="test"/>}
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
