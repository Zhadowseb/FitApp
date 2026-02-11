import { StatusBar } from 'expo-status-bar';
import { View, Button, ScrollView, Text, TouchableOpacity, Switch } from 'react-native';
import { useState, useCallback, useEffect } from "react";
import { useSQLiteContext } from "expo-sqlite";
import { useFocusEffect } from "@react-navigation/native";

import ExerciseList from './Components/ExerciseList/ExerciseList';
import EditModeAdditions from './Components/EditModeAdditions/EditModeAdditions';
import WorkoutLabel from "../../Resources/Components/WorkoutLabel/WorkoutLabel";
import { WORKOUT_ICONS } from '../../Resources/Icons/WorkoutLabels';
import CircularProgression from '../../Resources/Components/CircularProgression';
import { useColorScheme } from "react-native";
import { Colors } from "../../Resources/GlobalStyling/colors";

import styles from "./WorkoutPageStyle";
import { ThemedTitle, 
        ThemedCard, 
        ThemedView, 
        ThemedText, 
        ThemedSwitch, 
        ThemedModal,
        ThemedHeader } 
  from "../../Resources/Components";

//Types of workouts:
import Run from "./WorkoutTypes/Run/Run";

const WorkoutPage = ({route}) =>  {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme] ?? Colors.light;

  const db = useSQLiteContext();

  const [editMode, set_editMode] = useState(false);
  const [refreshing, set_refreshing] = useState(0);
  const [labelModal_visible, set_labelModal_visible] = useState(false);
  const [label, set_Label] = useState(null);

  const [totalSets, set_totalSets] = useState(0);
  const [doneSets, set_doneSets] = useState(0);

  const {workout_id, workout_label, day, date} = route.params;

  const handleExerciseChange = () => {
    set_refreshing(prev => prev + 1);
  }

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

  useFocusEffect(
    useCallback(() => {
      loadTotalSets();
      loadCompletedSets();
    }, [workout_id])
  );  

  useEffect(() => {
    loadCompletedSets();
    loadTotalSets();
  }, [refreshing]);


  const SelectedIcon =
    WORKOUT_ICONS.find(item => item.id === workout_label)?.Icon;


  return (
    <ThemedView>

      <ThemedHeader right={
        SelectedIcon && (
          <View style={styles.label}>
            <SelectedIcon
              width={50}
              height={50}
              backgroundColor={theme.background}
            />
          </View> )
      }>
          
          <ThemedText size={18}> {workout_label}  </ThemedText>
          <ThemedText size={10}> {day} - {date}  </ThemedText>
      
      </ThemedHeader>

      {workout_label === "Cardio" && (
        <Run
          workout_id={workout_id}/>
      )}


      {/* 
      <ScrollView>


        <View style={styles.warmup}>
          <ThemedTitle type={"h2"}>
            Warmup
          </ThemedTitle>
        </View>

        <View style={styles.working_sets}>
          <ThemedTitle type={"h2"}>
            Working sets
          </ThemedTitle>

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

      </ScrollView>

      */}
    </ThemedView>
  );
}

export default WorkoutPage;


          {/* 
          <View style={{alignItems: "center", justifyContent: "center"}}>
            <ThemedTitle
              type="h2">
                Sets
            </ThemedTitle>

            <ThemedCard style={styles.sets}>

              <CircularProgression
                size = {100}
                strokeWidth = {10} 
                text= {doneSets + "/" + totalSets}
                textSize = {16}
                progressPercent = {(doneSets/totalSets) * 100}
              />

            </ThemedCard>
          </View>
          */}