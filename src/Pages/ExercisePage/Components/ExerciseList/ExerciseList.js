// src/Components/ExerciseList/ExerciseList.js
import { use, useState } from "react";
import { View, Text, ScrollView } from "react-native";
import { SQLiteDatabase, useSQLiteContext } from "expo-sqlite";
import { useEffect } from "react";
import { useNavigation } from "@react-navigation/native";

import styles from "./ExerciseListStyle";

import ExerciseRow from "./Components/ExerciseRow/ExerciseRow"
import Title from "./Components/Title/Title";

const ExerciseList = ( {workout_id, editMode, refreshing, updateUI} ) => {
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
          };
        });
      setExercises(exercisesWithSets);

    } catch (error) {
      console.error("Error loading exercises", error);
    } finally {
      setLoading(false);
    }
  };

  const updateSetDone = async (sets_id, done) => {
    await db.execAsync("BEGIN TRANSACTION");

    try {
      // 1. Update the set ticket off
      await db.runAsync(
        `UPDATE Sets SET done = ? WHERE sets_id = ?`,
        [done ? 1 : 0, sets_id]
      );

      // 2. Update Exercise.done (true = all sets done)
      await db.runAsync(
        `
        UPDATE Exercise
        SET done = (
          NOT EXISTS (
            SELECT 1
            FROM Sets
            WHERE Sets.exercise_id = Exercise.exercise_id
              AND Sets.done = 0
          )
        )
        WHERE exercise_id = (
          SELECT exercise_id FROM Sets WHERE sets_id = ?
        )
        `,
        [sets_id]
      );

      // 3. Update Workout.done (true = all exercises done)
      await db.runAsync(
        `
        UPDATE Workout
        SET done = (
          NOT EXISTS (
            SELECT 1
            FROM Exercise
            WHERE Exercise.workout_id = Workout.workout_id
              AND Exercise.done = 0
          )
        )
        WHERE workout_id = ?
        `,
        [workout_id]
      );

      // 4. Update Day.done (true = all workouts done)
      await db.runAsync(
        `
        UPDATE Day
        SET done = (
          NOT EXISTS (
            SELECT 1
            FROM Workout
            WHERE Workout.day_id = Day.day_id
              AND Workout.done = 0
          )
        )
        WHERE day_id = (
          SELECT day_id FROM Workout WHERE workout_id = ?
        )
        `,
        [workout_id]
      );

      // 5. Update Microcycle.done (true = all workouts done)
      await db.runAsync(
        `
        UPDATE Microcycle
        SET done = (
          NOT EXISTS (
            SELECT 1
            FROM Workout
            JOIN Day ON Day.day_id = Workout.day_id
            WHERE Day.microcycle_id = Microcycle.microcycle_id
              AND Workout.done = 0
          )
        )
        WHERE microcycle_id = (
          SELECT Day.microcycle_id
          FROM Day
          JOIN Workout ON Workout.day_id = Day.day_id
          WHERE Workout.workout_id = ?
        )
        `,
        [workout_id]
      );

      // 5. Commit hvis ALT lykkes
      await db.execAsync("COMMIT");

      // 6. Reload UI
      loadExercises();

    } catch (error) {
      // Hvis bare én query fejler → rollback alt
      await db.execAsync("ROLLBACK");
      console.error("updateSetDone failed:", error);
      throw error;
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

      <ExerciseRow 
        exercise={item}
        updateUI={updateUI}
        onToggleSet={updateSetDone}
        editMode={editMode}
        refreshing={refreshing}/>
    </View>
  );

  return (
    <Title
      exercises={exercises}
      loading={loading}
      editMode={editMode}
      renderItem={renderItem}
    />
  );
};

export default ExerciseList;
