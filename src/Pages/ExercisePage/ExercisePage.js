import { StatusBar } from 'expo-status-bar';
import { View, Button, ScrollView, Text } from 'react-native';
import { useState } from "react";
import { Switch } from "react-native";

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

      <View style={[styles.card, styles.header]}>

        <View style={styles.info}>

        </View>

        <View style={[styles.label, styles.card]}>

        </View>

        <View style={[styles.editmode, styles.card]}>
          <Text style={{paddingTop: 20,}}>
            Edit mode
          </Text>

          <Switch
            value={editMode}
            onValueChange={set_editMode} />
        </View>
      </View>

      <View >
        <ExerciseList 
          workout_id = {workout_id}
          editMode = {editMode}
          refreshing = {refreshing} 
          updateUI = {handleExerciseChange}/>
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
