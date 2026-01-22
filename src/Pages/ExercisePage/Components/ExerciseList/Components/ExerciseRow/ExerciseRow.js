// src/Components/ExerciseList/ExerciseList.js
import { useState } from "react";
import { View, Text, Button, TouchableOpacity } from "react-native";
import { useSQLiteContext } from "expo-sqlite";
import { useNavigation } from "@react-navigation/native";
import Checkbox from 'expo-checkbox';

import styles from "./ExerciseRowStyle";
import SetList from "./SetList/SetList";
import {checkUniformWeights, 
        checkUniformReps} from "../../Utils/checkUniformSets";

import ArrowUp from "../../../../../../Resources/Icons/UI-icons/ArrowUp";
import ArrowDown from "../../../../../../Resources/Icons/UI-icons/ArrowDown";

import {ThemedCard,
        ThemedText,
        ThemedButton} 
  from "../../../../../../Resources/Components";


const ExerciseRow = ( {exercise, updateUI, editMode, onToggleSet, updateWeight} ) => {
  const [expandedExercises, setExpandedExercises] = useState({});

  const db = useSQLiteContext();
  const navigation = useNavigation();

  const toggleExpanded = (exercise_id) => {
    setExpandedExercises(prev => ({
      ...prev,
      [exercise_id]: !prev[exercise_id],
    }));
  };

  const deleteExercise = async (exercise_id) => {
    try {
      await db.runAsync(
        `DELETE FROM Exercise WHERE exercise_id = ?;`,
        [exercise_id]);
      updateUI?.();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <ThemedCard key={exercise.exercise_id}
      style={{
        marginHorizontal: 1}}>

      <TouchableOpacity
        onPress={() => toggleExpanded(exercise.exercise_id)}>
        
        <View style={[styles.exercise_container,
          exercise.done ? styles.exercise_complete : styles.exercise_uncomplete]}>
          <View style={styles.exercise_name}>
            <ThemedText>
              {exercise.exercise_name}
            </ThemedText>
          </View>

          <View style={[styles.exercise_sets, styles.exercise_alignment]}>
            <ThemedText>{exercise.sets.length}</ThemedText>
          </View>

          <View style={[styles.exercise_x, styles.exercise_alignment]}>
            <ThemedText>x</ThemedText>
          </View>

          <View style={[styles.exercise_reps, styles.exercise_alignment]}>
            <ThemedText>{checkUniformReps(exercise.sets)}</ThemedText>
          </View>

          <View style={[styles.exercise_weight, styles.exercise_alignment]}>
            <ThemedText>{checkUniformWeights(exercise.sets)}</ThemedText>
          </View>

          <View style={[styles.exercise_done, styles.exercise_alignment]}>
            {editMode ?
              <ThemedButton
                title="x"
                variant="danger"
                style={{
                  paddingVertical: 0,
                  paddingHorizontal: 0,
                  marginRight: 5,
                  marginBottom: 3,
                  height: 25,
                  width: 25,
                }}
                onPress={() => deleteExercise(exercise.exercise_id)}
              />
              :
              <Checkbox
                value={exercise.done === 1}
                color={exercise.done ? "#4CAF50" : "#ccc"}
              />
            
            }
          </View>
        </View>

        {expandedExercises[exercise.exercise_id] && (
          <View>
            <SetList 
                sets={exercise.sets}
                onToggleSet={onToggleSet}
                updateWeight={updateWeight}
                updateUI={updateUI}
                editMode={editMode} />

            <TouchableOpacity
              onPress={() => toggleExpanded(exercise.exercise_id)}
              style={styles.hideset}>
              
            </TouchableOpacity>

          </View>
        )}

      </TouchableOpacity>

    </ThemedCard>
  );
};

export default ExerciseRow;
