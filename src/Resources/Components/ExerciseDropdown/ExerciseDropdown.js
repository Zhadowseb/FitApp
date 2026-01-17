import { useEffect, useState } from "react";
import { View, ActivityIndicator } from "react-native";
import { useSQLiteContext } from "expo-sqlite";

import styles from "./ExerciseDropdownStyle";
import { ThemedPicker, ThemedText } from "../";

const ExerciseDropdown = ({ selectedExerciseName, onChange }) => {
  const [exercises, setExercises] = useState([]);
  const [loading, setLoading] = useState(true);
  const db = useSQLiteContext();

  const loadExercises = async () => {
    try {
      setLoading(true);

      const rows = await db.getAllAsync(
        "SELECT exercise_name FROM Exercise_storage ORDER BY exercise_name;"
      );

      setExercises(rows);

      // Sæt default hvis intet valgt
      if (!selectedExerciseName && rows.length > 0) {
        onChange?.(rows[0].exercise_name);
      }
    } catch (error) {
      console.error("Error loading exercises", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadExercises();
  }, []);

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="small" />
      </View>
    );
  }

  if (exercises.length === 0) {
    return <ThemedText>Ingen øvelser fundet.</ThemedText>;
  }

  return (
    <View style={styles.container}>
      <ThemedPicker
        value={selectedExerciseName}
        onChange={onChange}
        placeholder="Select exercise"
        items={exercises.map(ex => ({
          label: ex.exercise_name,
          value: ex.exercise_name,
        }))}
      />
    </View>
  );
};

export default ExerciseDropdown;
