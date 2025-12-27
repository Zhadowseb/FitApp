// src/Components/ExerciseList/ExerciseList.js
import { use, useState } from "react";
import { View, Text, FlatList, TouchableOpacity } from "react-native";
import { SQLiteDatabase, useSQLiteContext } from "expo-sqlite";
import { useEffect } from "react";
import { useNavigation } from "@react-navigation/native";

import styles from "./ExerciseListStyle";

const ExerciseList = ( {workout_id} ) => {
  const [exercises, setExercises] = useState([]);
  const [allDone, setAllDone] = useState(false);
  const [loading, setLoading] = useState(false);
  const db = useSQLiteContext();
  const navigation = useNavigation();

  const loadExercises = async () => {
    try {
      setLoading(true);

      const rows = await db.getAllAsync(
        "SELECT exercise_id, exercise_name, sets, done FROM Exercise WHERE workout_id = ?;",
        [workout_id]
      );

      setExercises(rows);

      const everythingDone = rows.length > 0 && rows.every(ex => ex.done === 1);
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
  }, []);

  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", () => {
      loadExercises();
    });

    return unsubscribe;
  }, [navigation]);

  const renderItem = ({ item }) => (

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
            <Text style={[styles.left, item.done && { color: "green" }]}>
              {item.exercise_name}
            </Text>
          </View>

          <View style={styles.exercise_sets}>
            <Text> set </Text>
          </View>

          <View style={styles.exercise_x}>
            <Text> x </Text>
          </View>

          <View style={styles.exercise_reps}>
            <Text> reps </Text>
          </View>

          <View style={styles.exercise_weight}>
            <Text style={styles.right}>{item.sets}</Text>
          </View>

        </View>

    </TouchableOpacity>
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
            <Text style={[styles.exercise_name, styles.headerText]}>Exercise</Text>
            <Text style={[styles.exercise_sets, styles.headerText]}>Sets</Text>
            <Text style={[styles.exercise_x, styles.headerText]}> </Text>
            <Text style={[styles.exercise_reps, styles.headerText]}>Reps</Text>
            <Text style={[styles.exercise_weight, styles.headerText]}>Weight</Text>
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
