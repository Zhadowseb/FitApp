import { StatusBar } from 'expo-status-bar';
import { View, Button, ScrollView } from 'react-native';
import { useState } from "react";

import styles from './ExercisePageStyle';
import ExerciseList from './Components/ExerciseList/ExerciseList';
import EditModeAdditions from './Components/EditModeAdditions/EditModeAdditions';

const ExercisePage = ({route}) =>  {

  const [editMode, set_editMode] = useState(false);
  const [refreshing, set_refreshing] = useState(0);

  const {workout_id, date} = route.params;

  const handleExerciseChange = () => {
    set_refreshing(prev => prev + 1);
  }


  return (
    <ScrollView style={styles.container}>

      <Button 
        title={editMode ? "Edit mode: ON" : "Edit mode: OFF"}
        onPress={() => set_editMode(prev => !prev)}
        />

      <View style={styles.card}>
        <ExerciseList 
          workout_id = {workout_id}
          editMode = {editMode}
          refreshing = {refreshing} 
          onExerciseChange = {handleExerciseChange}/>
      </View> 
      
      {editMode && (
        <EditModeAdditions 
          workout_id={workout_id}
          date={date}
          onExerciseChange={handleExerciseChange}/>
      )}

      <StatusBar style="auto" />

    </ScrollView>
  );
}

export default ExercisePage;
