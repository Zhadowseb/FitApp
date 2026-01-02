import { StatusBar } from 'expo-status-bar';
import { View, Button, ScrollView } from 'react-native';
import { useState } from "react";

import styles from './EditModeAdditionsStyle';
import AddExercise from './AddExercise/AddExercise';

const EditModeAdditions = ( {workout_id, date, onExerciseChange} ) => {

  return (
    <View style={styles.card}>
      <AddExercise 
        workout_id = {workout_id} 
        date = {date}
        onExerciseChange = {onExerciseChange}/>
    </View>
  );
};

export default EditModeAdditions;