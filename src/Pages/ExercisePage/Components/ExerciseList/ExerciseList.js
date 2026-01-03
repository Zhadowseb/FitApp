// src/Components/ExerciseList/ExerciseList.js
import { use, useState } from "react";
import { View, Text, ScrollView } from "react-native";
import { SQLiteDatabase, useSQLiteContext } from "expo-sqlite";
import { useEffect } from "react";
import { useNavigation } from "@react-navigation/native";

import styles from "./ExerciseListStyle";

import EditModeOff from "./Components/EditModeOff/EditModeOff"
import EditModeOn from "./Components/EditModeOn/EditModeOn"
import Title from "./Components/Title/Title";

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
          };
        });
      setExercises(exercisesWithSets);

    } catch (error) {
      console.error("Error loading exercises", error);
    } finally {
      setLoading(false);
    }
  };

  const updateSetDone = async (set_id, done) => {
    await db.runAsync(
      `UPDATE Sets SET done = ? WHERE sets_id = ?`,
      [done ? 1 : 0, set_id]
    );

    await db.runAsync(
      `UPDATE Exercise
      SET done = 1
      WHERE exercise_id = 
      (SELECT exercise_id FROM Sets WHERE sets_id = ?)
      AND NOT EXISTS (
        SELECT 1
        FROM Sets
        WHERE Sets.exercise_id = Exercise.exercise_id
          AND Sets.done = 0 )`,
      [set_id]
    );


    loadExercises(); 
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
            exercise={item} 
            onToggleSet={updateSetDone} />
        </View>
      )}

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
