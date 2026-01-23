import { StatusBar } from 'expo-status-bar';
import { View, Button, ScrollView, Text, TouchableOpacity, Switch } from 'react-native';
import { useState, useCallback, useEffect } from "react";
import { useSQLiteContext } from "expo-sqlite";
import { useFocusEffect } from "@react-navigation/native";

import styles from './ExercisePageStyle';
import ExerciseList from './Components/ExerciseList/ExerciseList';
import EditModeAdditions from './Components/EditModeAdditions/EditModeAdditions';
import WorkoutLabel from "../../Resources/Components/WorkoutLabel/WorkoutLabel";
import { WORKOUT_ICONS } from '../../Resources/Icons/WorkoutLabels';
import CircularProgress from '../../Resources/Components/CircularProgression';

import { ThemedTitle, 
        ThemedCard, 
        ThemedView, 
        ThemedText, 
        ThemedSwitch, 
        ThemedModal } 
  from "../../Resources/Components";

const ExercisePage = ({route}) =>  {
  const db = useSQLiteContext();

  const [editMode, set_editMode] = useState(false);
  const [refreshing, set_refreshing] = useState(0);
  const [labelModal_visible, set_labelModal_visible] = useState(false);
  const [label, set_Label] = useState(null);

  const [totalSets, set_totalSets] = useState(0);
  const [doneSets, set_doneSets] = useState(0);

  const {workout_id, day, date} = route.params;

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

  const loadTotalSets = async () => {
    try {
      const result = await db.getFirstAsync(
        `SELECT SUM(sets) AS count FROM Exercise WHERE workout_id = ?`,
        [workout_id]
      );
      set_totalSets(result.count);
    } catch (err) {
      console.error("Failed to load the amount of sets to do for this workout:", err);
    }
  };

  const loadCompletedSets = async () => {
    try {
      const result = await db.getFirstAsync(
        `SELECT COUNT(*) AS done_sets
          FROM Sets s
          JOIN Exercise e ON e.exercise_id = s.exercise_id
          WHERE e.workout_id = ?
            AND s.done = 1; 
          `, [workout_id]);
      set_doneSets(result.done_sets);
    } catch (err) {
      console.error("Failed to load the done sets for this workout:", err);
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
      loadTotalSets();
      loadCompletedSets();
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

  useEffect(() => {
    loadCompletedSets();
    loadTotalSets();
  }, [refreshing]);


  const SelectedIcon =
    WORKOUT_ICONS.find(item => item.id === label)?.Icon;


  return (
    <ThemedView>
      <ScrollView>


        <View style={{
          flex: 1,
          flexDirection: "row",
        }}>

          <View style={styles.info}>
            <ThemedCard style={styles.info}>
              <ThemedText>
                {day}
              </ThemedText>             
              <ThemedText>
                {date}
              </ThemedText>
            </ThemedCard>
          </View>


          <View style={{alignItems: "center", justifyContent: "center"}}>
            <ThemedTitle
              type="h2">
                Sets
            </ThemedTitle>

            <ThemedCard style={styles.sets}>

              <CircularProgress
                size = {100}
                strokeWidth = {10} 
                text= {doneSets + "/" + totalSets}
                textSize = {16}
                progressPercent = {(doneSets/totalSets) * 100}
              />

            </ThemedCard>
          </View>


          <View style={{flexDirection: "column"}}>
            <View style={{alignItems: "center"}}>

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
            </View>

            <View style={{alignItems: "center"}}>
              <ThemedTitle type="h3">
                  Mode
              </ThemedTitle>

              <ThemedCard style={styles.editmode}>

                <ThemedSwitch
                  value={editMode}
                  onValueChange={set_editMode} />
              </ThemedCard>
            </View>

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
            onExerciseChange={handleExerciseChange}
            deleteWorkout={deleteWorkout}/>
        )}

        <StatusBar style="auto" />
      </ScrollView>
    </ThemedView>
  );
}

export default ExercisePage;
