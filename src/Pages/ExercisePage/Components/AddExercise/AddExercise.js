import React, { useState } from "react";
import { View, Text, TextInput, Button, Alert } from "react-native";
import { useSQLiteContext } from "expo-sqlite";

import ExerciseDropdown from "../../../../Components/ExerciseDropdown/ExerciseDropdown";
import styles from "./AddExerciseStyle";

const AddExercise = ( {workout_id, date} ) => {
  const db = useSQLiteContext();

  const [selectedExerciseName, setSelectedExerciseName] = useState(null);
  const [sets, setSets] = useState("");

  const handleSubmit = async () => {
    try {
      if (!selectedExerciseName) {
        throw new Error("Vælg en øvelse.");
      }

      if (!sets.trim()) {
        throw new Error("Angiv antal sæt.");
      }

      const setsInt = parseInt(sets, 10);
      if (Number.isNaN(setsInt) || setsInt <= 0) {
        throw new Error("Sæt skal være et positivt tal.");
      }

      await db.runAsync(
        `INSERT INTO Exercise (workout_id, exercise_name, sets) VALUES (?, ?, ?);`,
        [workout_id, selectedExerciseName, setsInt]
      );


      Alert.alert("Success", "Exercise tilføjet!");
      setSets("");
    } catch (error) {
      console.error(error);
      Alert.alert(
        "Error",
        error.message || "Der skete en fejl ved tilføjelsen."
      );
    }
  };

  return (
    <View style={styles.wrapper}>
      <View style={styles.row}>
        <View style={styles.left}>
          <ExerciseDropdown
            selectedExerciseName={selectedExerciseName}
            onChange={setSelectedExerciseName}
          />
        </View>

        <View style={styles.right}>
          <Text style={styles.label}>Sets</Text>
          <TextInput
            style={styles.input}
            placeholder="Antal sæt"
            keyboardType="numeric"
            value={sets}
            onChangeText={setSets}
          />
        </View>
      </View>

      <View style={styles.buttonContainer}>
        <Button title="GEM" onPress={handleSubmit} />
      </View>
    </View>
  );
};

export default AddExercise;
