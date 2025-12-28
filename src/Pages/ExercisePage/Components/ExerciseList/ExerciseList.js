// src/Components/ExerciseList/ExerciseList.js
import { use, useState } from "react";
import { View, Text, Button, TouchableOpacity, ScrollView } from "react-native";
import { SQLiteDatabase, useSQLiteContext } from "expo-sqlite";
import { useEffect } from "react";
import { useNavigation } from "@react-navigation/native";
import Checkbox from 'expo-checkbox';

import styles from "./ExerciseListStyle";
import {checkUniformWeights, 
        checkUniformReps} from "./Utils/checkUniformSets";

const ExerciseList = ( {workout_id, editMode, refreshing} ) => {
  const [exercises, setExercises] = useState([]);
  const [allDone, setAllDone] = useState(false);
  const [loading, setLoading] = useState(false);
  const db = useSQLiteContext();
  const navigation = useNavigation();

  const loadExercises = async () => {
    try {
      setLoading(true);

      const exercises = await db.getAllAsync(
        `SELECT 
          exercise_id, exercise_name, sets, done 
          FROM Exercise WHERE workout_id = ?;`,
        [workout_id]
      );

      const sets = await db.getAllAsync(
        `SELECT s.*
        FROM Sets s
        JOIN Exercise e ON e.exercise_id = s.exercise_id
        WHERE e.workout_id = ?;`,
        [workout_id]
      );

      const setsByExercise = {};
      for (const set of sets) {
        if (!setsByExercise[set.exercise_id]) {
          setsByExercise[set.exercise_id] = [];
        }
        setsByExercise[set.exercise_id].push(set);
      }

      const exercisesWithSets = exercises.map(ex => {
          const exSets = setsByExercise[ex.exercise_id] ?? [];
          return {
            ...ex,
            sets: exSets,
            setCount: exSets.length,
            allSetsDone:
              exSets.length > 0 && exSets.every(s => s.done === 1),
          };
        });
      setExercises(exercisesWithSets);

      const everythingDone = exercises.length > 0 && exercises.every(ex => ex.done === 1);
      setAllDone(everythingDone);

      await db.runAsync(
        `UPDATE Workout SET done = ? WHERE workout_id = ?;`,
        [everythingDone ? 1 : 0, workout_id]
      );

    } catch (error) {
      console.error("Error loading exercises", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadExercises();
  }, [refreshing]);

  useEffect(() => {
    loadExercises();
  }, []);

  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", () => {
      loadExercises();
    });

    return unsubscribe;
  }, [navigation]);

  const deleteExercise = async (exercise_id) => {
    try {
      await db.runAsync(
        `DELETE FROM Exercise WHERE exercise_id = ?;`,
        [exercise_id]);
    } catch (error) {
      console.error(error);
    }
  };

  const renderItem = (item) => (

    <TouchableOpacity
      style={styles.card}
      onPress={() => {
        navigation.navigate("SetPage", {
          exercise_id: item.exercise_id,
          exercise_name: item.exercise_name,
          sets: item.sets})
      }}>

        <View style={styles.exercise_container}>

          <View style={styles.exercise_name}>
            <Text style={item.done && { color: "green" }}>
              {item.exercise_name}
            </Text>
          </View>

          <View style={[styles.exercise_sets, styles.exercise_alignment]}>
            <Text> {item.sets.length} </Text>
          </View>

          <View style={[styles.exercise_x, styles.exercise_alignment]}>
            <Text> x </Text>
          </View>

          <View style={[styles.exercise_reps, styles.exercise_alignment]}>
            <Text> {checkUniformReps(item.sets)} </Text>
          </View>

          <View style={[styles.exercise_weight, styles.exercise_alignment]}>
            <Text> {checkUniformWeights(item.sets)} </Text>
          </View>

          <View style={[styles.exercise_done, styles.exercise_alignment]}>
            {!editMode && (
              <Checkbox
                value={item.done}
                color={item.done ? "#4CAF50" : "#ccc"}
                style={styles.checkbox} />
            )}
            {editMode && (
              <Button 
                title={"x"}
                color="red"
                onPress={() => deleteExercise()}
                />
            )}
          </View>

        </View>

    </TouchableOpacity>
  );

  return (
    <ScrollView style={styles.wrapper}>

        {exercises.length > 0 && (
          <View style={styles.headerRow}>
            <Text style={[styles.exercise_name, styles.headerText]}>
              Exercise</Text>
            <Text style={[styles.exercise_sets, styles.headerText]}>
              Sets</Text>
            <Text style={[styles.exercise_x, styles.headerText]}>
               </Text>
            <Text style={[styles.exercise_reps, styles.headerText]}>
              Reps</Text>
            <Text style={[styles.exercise_weight, styles.headerText]}>
              Weight</Text>
            {!editMode && (
              <Text style={[styles.headerText]}> Done </Text>
            )}
            {editMode && (
              <Text style={[styles.headerText]}> Delete </Text>
            )}
          </View>
        )}

      {exercises.length === 0 && !loading && (
        <Text>Ingen exercises fundet.</Text>
      )}

      {exercises.map(renderItem)}

    </ScrollView>
  );
};

export default ExerciseList;
