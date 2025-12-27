import { StatusBar } from 'expo-status-bar';
import { View, Button } from 'react-native';
import { useState } from "react";

import styles from './ExercisePageStyle';
import AddExercise from './Components/AddExercise/AddExercise';
import ExerciseList from './Components/ExerciseList/ExerciseList';

const ExercisePage = ({route}) =>  {

  const [editMode, set_editMode] = useState(false);
  const [refreshing, set_refreshing] = useState(0);

  const {workout_id, date} = route.params;

  const handleExerciseAdded = () => {
    set_refreshing(prev => prev + 1);
  }


  return (
    <View style={styles.container}>

      <Button 
        title={editMode ? "Edit mode: ON" : "Edit mode: OFF"}
        onPress={() => set_editMode(prev => !prev)}
        />

      <View style={styles.card}>
        <ExerciseList 
          workout_id = {workout_id}
          refreshing = {refreshing} />
      </View> 
      
      {editMode && (
        <View style={styles.card}>
          <AddExercise 
            workout_id = {workout_id} 
            date = {date}
            onAdded = {handleExerciseAdded}/>
        </View>
      )}

      <StatusBar style="auto" />

    </View>
  );
}

export default ExercisePage;
