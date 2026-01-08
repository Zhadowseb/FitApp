import { StatusBar } from 'expo-status-bar';
import { View, Button, ScrollView, Text, TouchableOpacity } from 'react-native';
import { useState } from "react";
import { Switch } from "react-native";
import { useSQLiteContext } from "expo-sqlite";
import { useFocusEffect } from "@react-navigation/native";
import { useCallback } from "react";

import styles from './ExercisePageStyle';
import ExerciseList from './Components/ExerciseList/ExerciseList';
import EditModeAdditions from './Components/EditModeAdditions/EditModeAdditions';
import WorkoutLabel from "../../Resources/Components/WorkoutLabel/WorkoutLabel";
import { WORKOUT_ICONS } from '../../Resources/Icons';

const ExercisePage = ({route}) =>  {
  const db = useSQLiteContext();

  const [editMode, set_editMode] = useState(false);
  const [refreshing, set_refreshing] = useState(0);
  const [labelModal_visible, set_labelModal_visible] = useState(false);
  const [label, set_Label] = useState(null);

  const {workout_id, date} = route.params;

  const handleExerciseChange = () => {
    set_refreshing(prev => prev + 1);
  }

  const handleLabel = ({id}) => {
    set_Label(id)
  };

  const loadLabel = async () => {
    try {
      const row = await db.getFirstAsync(
        `SELECT label FROM Workout WHERE workout_id = ?;`,
        [workout_id]
      );

      if (row?.label != null) {
        set_Label(row.label);
      } else {
        set_Label(null);
      }
    } catch (err) {
      console.error("Failed to load label:", err);
    }
  };

  const saveLabel = async () => {
    try {
      await db.runAsync(
        `UPDATE Workout 
        SET label = ? 
        WHERE workout_id = ?;`,
        [label, workout_id]
      );
    } catch (err) {
      console.error("Failed to save label:", err);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadLabel();
    }, [workout_id])
  );  

  useFocusEffect(
    useCallback(() => {
      return () => {
        if (label !== null) {
          saveLabel();
        }
      };
    }, [label, workout_id])
  );

  const SelectedIcon =
    WORKOUT_ICONS.find(item => item.id === label)?.Icon;

  return (
    <ScrollView style={styles.container}>

      <View style={[styles.card, styles.header]}>

        <View style={styles.info}>

        </View>

        <View style={[styles.label, styles.card]}>
         <TouchableOpacity
          onPress={() => set_labelModal_visible(true)}>
          
            {SelectedIcon ? (
              <View style={styles.label}>
                <Text> {label} </Text>
                <SelectedIcon
                  width={50}
                  height={50}
                  backgroundColor="#fff"
                />
              </View>
            ) : (
              <Text style={{ opacity: 0.5 }}>
                Add label
              </Text>
            )}

          </TouchableOpacity> 

          <WorkoutLabel 
            visible={labelModal_visible}
            onClose={() => set_labelModal_visible(false)}
            onSubmit={handleLabel}/>
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
