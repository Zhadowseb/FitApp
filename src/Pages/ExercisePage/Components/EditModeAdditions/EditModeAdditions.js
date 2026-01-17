import { StatusBar } from 'expo-status-bar';
import { View, Button, ScrollView } from 'react-native';
import { useState } from "react";
import { useNavigation } from "@react-navigation/native";

import styles from './EditModeAdditionsStyle';
import AddExercise from './AddExercise/AddExercise';

import {ThemedCard, 
        ThemedButton, 
        ThemedText,
        ThemedView,  } 
  from "../../../../Resources/Components";

const EditModeAdditions = ( {workout_id, date, onExerciseChange, deleteWorkout} ) => {

  const navigation = useNavigation();

  return (
    <ThemedView>

      <ThemedCard>
        <AddExercise 
          workout_id = {workout_id} 
          date = {date}
          onExerciseChange = {onExerciseChange}/>

      </ThemedCard>

      <ThemedCard>
        <ThemedButton
          title="Delete Workout"
          variant='danger'
          width={150}
          onPress={() => {
            deleteWorkout(workout_id);
            navigation.goBack();
          }}
        />
      </ThemedCard>
      
    </ThemedView>
    
  );
};

export default EditModeAdditions;