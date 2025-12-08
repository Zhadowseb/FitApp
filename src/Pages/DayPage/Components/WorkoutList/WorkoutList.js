// src/Components/ExerciseList/ExerciseList.js
import { useState } from "react";
import { View, Text, FlatList, TouchableOpacity } from "react-native";
import { SQLiteDatabase, useSQLiteContext } from "expo-sqlite";
import { useEffect } from "react";
import { useNavigation } from "@react-navigation/native";

import styles from "./WorkoutListStyle";

const WorkoutList = ( {date} ) => {
    const navigation = useNavigation();
  const [workouts, setWorkouts] = useState([]);
  const [loading, setLoading] = useState(false);
  const db = useSQLiteContext();

  const loadWorkouts = async () => {
    try {
      setLoading(true);
      console.log("Loading workouts from DB...");

      const rows = await db.getAllAsync(
        "SELECT workout_id FROM Workout WHERE date = ?;",
        [date]
      );

      setWorkouts(rows);
    } catch (error) {
      console.error("Error loading workouts", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWorkouts();
  }, []);

    const renderItem = ({ item }) => (
        <TouchableOpacity
            style={styles.row}
            onPress={() => navigation.navigate("ExercisePage", {
            workout_id: item.workout_id,
            date: date
            })}>

            <Text style={styles.left}>Workout #{item.workout_id}</Text>
        </TouchableOpacity>
    );

  return (
    <FlatList
      style={styles.wrapper}
      data={workouts}
      keyExtractor={(_, index) => index.toString()}
      refreshing={loading}
      onRefresh={loadWorkouts}
      ListHeaderComponent={
        workouts.length > 0 ? (
          <View style={styles.headerRow}>
            <Text style={[styles.left, styles.headerText]}>Workouts</Text>
          </View>
        ) : null
      }
      ListEmptyComponent={
        !loading ? <Text>No workouts found.</Text> : null
      }
      renderItem={renderItem}
    />
  );
};

export default WorkoutList;
