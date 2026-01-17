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
import { WORKOUT_ICONS } from '../../Resources/Icons/WorkoutLabels';

import { ThemedTitle, 
        ThemedCard, 
        ThemedView, 
        ThemedText, 
        ThemedButton, 
        ThemedModal } 
  from "../../Resources/Components";

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

  const deleteWorkout = async (workout_id) => {
      try{
          await db.runAsync(
              `DELETE FROM Workout WHERE workout_id = ?;`,
              [workout_id]
          );
      }catch (error) {
          console.error(error);
      }
  }

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
    <ScrollView>

      <ThemedView style={{
        flex: 1,
        flexDirection: "row",
      }}>

        <ThemedCard style={styles.info}>
          <ThemedText>
             Info... (coming soon)
          </ThemedText>
        </ThemedCard>

        <ThemedCard style={styles.label}>
         <TouchableOpacity
          onPress={() => set_labelModal_visible(true)}>
          
            {SelectedIcon ? (
              <View style={styles.label}>
                <ThemedText> {label} </ThemedText>
                <SelectedIcon
                  width={50}
                  height={50}
                  backgroundColor="#fff"
                />
              </View>
            ) : (
              <ThemedText style={{ opacity: 0.5 }}>
                Add label
              </ThemedText>
            )}

          </TouchableOpacity> 

          <WorkoutLabel 
            visible={labelModal_visible}
            onClose={() => set_labelModal_visible(false)}
            onSubmit={handleLabel}/>
        </ThemedCard>

        <ThemedCard style={styles.editmode}>
          <ThemedText style={{paddingTop: 20,}}>
            Edit mode
          </ThemedText>

          <Switch
            value={editMode}
            onValueChange={set_editMode} />
        </ThemedCard>
      </ThemedView>

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
          onExerciseChange={handleExerciseChange}
          deleteWorkout={deleteWorkout}/>
      )}

      <StatusBar style="auto" />
    </ScrollView>
  );
}

export default ExercisePage;
