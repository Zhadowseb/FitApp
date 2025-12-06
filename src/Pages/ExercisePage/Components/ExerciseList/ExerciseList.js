// src/Components/ExerciseList/ExerciseList.js
import { useState } from "react";
import { View, Text, FlatList } from "react-native";
import { SQLiteDatabase, useSQLiteContext } from "expo-sqlite";
import { useEffect } from "react";

import styles from "./ExerciseListStyle";

const ExerciseList = ( {workout_id} ) => {
  const [exercises, setExercises] = useState([]);
  const [loading, setLoading] = useState(false);
  const db = useSQLiteContext();

  const loadExercises = async () => {
    try {
      setLoading(true);
      console.log("Loading exercises from DB...");

      const rows = await db.getAllAsync(
        "SELECT exercise_name, sets FROM Exercise WHERE workout_id = ?;",
        [workout_id]
      );

      setExercises(rows);
    } catch (error) {
      console.error("Error loading exercises", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadExercises();
  }, []);

  const renderItem = ({ item }) => (
    <View style={styles.row}>
      <Text style={styles.left}>{item.exercise_name}</Text>
      <Text style={styles.right}>{item.sets}</Text>
    </View>
  );

  return (
    <FlatList
      style={styles.wrapper}
      data={exercises}
      keyExtractor={(_, index) => index.toString()}
      refreshing={loading}
      onRefresh={loadExercises}
      ListHeaderComponent={
        exercises.length > 0 ? (
          <View style={styles.headerRow}>
            <Text style={[styles.left, styles.headerText]}>Exercise</Text>
            <Text style={[styles.right, styles.headerText]}>Sets</Text>
          </View>
        ) : null
      }
      ListEmptyComponent={
        !loading ? <Text>Ingen exercises fundet.</Text> : null
      }
      renderItem={renderItem}
    />
  );
};

export default ExerciseList;
