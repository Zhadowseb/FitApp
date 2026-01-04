// src/Components/ExerciseList/ExerciseList.js
import { useState } from "react";
import { View, Text, Button, TouchableOpacity } from "react-native";
import { useSQLiteContext } from "expo-sqlite";
import { useNavigation } from "@react-navigation/native";
import Checkbox from 'expo-checkbox';

import styles from "./ExerciseRowStyle";
import SetList from "../SetList/SetList";
import {checkUniformWeights, 
        checkUniformReps} from "../../Utils/checkUniformSets";

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
    <View key={exercise.exercise_id} style={styles.card}>

      <TouchableOpacity
        onPress={() =>
          navigation.navigate("SetPage", {
            exercise_id: exercise.exercise_id,
            exercise_name: exercise.exercise_name,
            sets: exercise.sets,
          })
        }
      >
        <View style={[styles.exercise_container,
          exercise.done ? styles.exercise_complete : styles.exercise_uncomplete]}>
          <View style={styles.exercise_name}>
            <Text>
              {exercise.exercise_name}
            </Text>
          </View>

          <View style={[styles.exercise_sets, styles.exercise_alignment]}>
            <Text>{exercise.sets.length}</Text>
          </View>

          <View style={[styles.exercise_x, styles.exercise_alignment]}>
            <Text>x</Text>
          </View>

          <View style={[styles.exercise_reps, styles.exercise_alignment]}>
            <Text>{checkUniformReps(exercise.sets)}</Text>
          </View>

          <View style={[styles.exercise_weight, styles.exercise_alignment]}>
            <Text>{checkUniformWeights(exercise.sets)}</Text>
          </View>

          <View style={[styles.exercise_done, styles.exercise_alignment]}>
            {editMode ?
              <Button
                title="x"
                color="red"
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
      </TouchableOpacity>

      <View style={styles.SetList_container}>

        <View style={styles.SetList}>
          <TouchableOpacity
            onPress={() => toggleExpanded(exercise.exercise_id)}
            style={{ paddingVertical: 4 }}>

            <View style={styles.expandable}>
                <Text>
                {expandedExercises[exercise.exercise_id]
                    ? "▲ Hide sets"
                    : "▼ Show sets"}
                </Text>
            </View>

          </TouchableOpacity>

          {expandedExercises[exercise.exercise_id] && (
            <SetList 
                sets={exercise.sets}
                onToggleSet={onToggleSet}
                updateWeight={updateWeight}
                updateUI={updateUI}
                editMode={editMode} />
          )}
        </View>
      </View>
    </View>
  );
};

export default ExerciseRow;
