// src/Components/ExerciseList/ExerciseList.js
import { useState } from "react";
import { View, Text, FlatList, TouchableOpacity, Button } from "react-native";
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

      const rows = await db.getAllAsync(
        "SELECT workout_id, done, date, day_id FROM Workout WHERE date = ?;",
        [date]
      );

      setWorkouts(rows);
    } catch (error) {
      console.error("Error loading workouts", error);
    } finally {
      setLoading(false);
    }
  };

  const deleteWorkout = async (workout_id) => {
      try{
          await db.runAsync(
              `DELETE FROM Workout WHERE workout_id = ?;`,
              [workout_id]
          );
      }catch (error) {
          console.error(error);
      }
  }

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

            <Text style={[styles.left, item.done === 1 && { color: "green" }]}>
              Workout #{item.workout_id}
            </Text>

              <Button 
                  title = "Delete Workout"
                  color = "red"
                  onPress={ () => {
                    deleteWorkout(item.workout_id);
                  }} />

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
