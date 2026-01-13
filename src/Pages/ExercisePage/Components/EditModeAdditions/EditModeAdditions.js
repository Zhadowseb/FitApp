import { StatusBar } from 'expo-status-bar';
import { View, Button, ScrollView } from 'react-native';
import { useState } from "react";
import { useNavigation } from "@react-navigation/native";

import styles from './EditModeAdditionsStyle';
import AddExercise from './AddExercise/AddExercise';

const EditModeAdditions = ( {workout_id, date, onExerciseChange, deleteWorkout} ) => {

  const navigation = useNavigation();

  return (
    <View style={styles.card}>
      <AddExercise 
        workout_id = {workout_id} 
        date = {date}
        onExerciseChange = {onExerciseChange}/>


      <Button
        title="Delete Workout"
        color="red"
        onPress={() => {
          deleteWorkout(workout_id);
          navigation.goBack();
        }}
      />
    </View>
    
  );
};

export default EditModeAdditions;