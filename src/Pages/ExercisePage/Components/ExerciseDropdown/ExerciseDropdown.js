import { useEffect, useState } from "react";
import { View, ActivityIndicator, Text, FlatList } from "react-native";
import { useSQLiteContext } from "expo-sqlite";
import { Picker } from "@react-native-picker/picker";
import styles from "./ExerciseDropdownStyle";

const ExerciseDropdown = ({ selectedExerciseName, onChange }) => {
  const [exercises, setExercises] = useState([]);
  const [loading, setLoading] = useState(true);
  const db = useSQLiteContext();

  const loadExercises = async () => {
    try {
      setLoading(true);
      const rows = await db.getAllAsync(
        "SELECT exercise_name FROM Exercise_storage ORDER BY exercise_name;"
        // eller FROM Exercise hvis det er dér navnene ligger
      );
      setExercises(rows);

      if (!selectedExerciseName && rows.length > 0 && typeof onChange === "function") {
        onChange(rows[0].exercise_name);
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
    return <Text>Ingen øvelser fundet.</Text>;
  }

  return (
    <View style={styles.container}>
      <Picker
        selectedValue={selectedExerciseName}
        onValueChange={(value) => {
          if (typeof onChange === "function") {
            onChange(value);
          }
        }}
      >
        {exercises.map((ex, index) => (
          <Picker.Item
            key={index}
            label={ex.exercise_name}
            value={ex.exercise_name}   // 👈 vi bruger nu navnet som value
          />
        ))}
      </Picker>
    </View>
  );
};

export default ExerciseDropdown;
