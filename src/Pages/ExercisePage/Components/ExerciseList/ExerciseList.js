// src/Components/ExerciseList/ExerciseList.js
import { use, useState } from "react";
import { View, Text, ScrollView } from "react-native";
import { SQLiteDatabase, useSQLiteContext } from "expo-sqlite";
import { useEffect } from "react";
import { useNavigation } from "@react-navigation/native";

import styles from "./ExerciseListStyle";

import EditModeOff from "./Components/EditModeOff/EditModeOff"
import EditModeOn from "./Components/EditModeOn/EditModeOn"

const ExerciseList = ( {workout_id, editMode, refreshing, onExerciseChange} ) => {
  const [exercises, setExercises] = useState([]);
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

  const renderItem = (item) => (
    <View key={item.exercise_id}>

      {editMode && (
        <View>
          <EditModeOn
            exercise={item}
            onExerciseChange={onExerciseChange} />
        </View>
      )}

      {!editMode && (
        <View>  
          <EditModeOff
            exercise={item} />
        </View>
      )}

    </View>
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
