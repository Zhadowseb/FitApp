import React, { useState } from "react";
import { View, Text, TextInput, Button, Alert } from "react-native";
import { useSQLiteContext } from "expo-sqlite";

import ExerciseDropdown from "../../../../Components/ExerciseDropdown/ExerciseDropdown";
import styles from "./AddExerciseStyle";

const AddExercise = ( {workout_id, date, onExerciseChange} ) => {
  const db = useSQLiteContext();

  const [selectedExerciseName, setSelectedExerciseName] = useState(null);
  const [sets, setSets] = useState("");
  const [reps, setReps] = useState("");
  const [weight, setWeight] = useState("");

  const handleSubmit = async () => {
    try {

      checkInput();

      const exercise_row = await db.runAsync(
        `INSERT INTO Exercise (workout_id, exercise_name, sets) VALUES (?, ?, ?);`,
        [workout_id, selectedExerciseName, sets]
      );

      const setsInt = parseInt(sets, 10);
      const exercise_id = exercise_row.lastInsertRowId;

      for (let i = 1; i <= setsInt; i++) {
        await db.runAsync(
          `INSERT INTO Sets (set_number, date, exercise_id, weight, reps)
          VALUES (?, ?, ?, ?, ?);`,
          [i, date, exercise_id, weight, reps]
        );
      }

      setSets("");
      setReps("");
      setWeight("");

      onExerciseChange?.();
      
    } catch (error) {
      Alert.alert("Input error", error.message);
    }
  };

  const checkInput = () => {
    if (!selectedExerciseName) {
      throw new Error("Choose an exercise");
    }

    if (!sets.trim()) {
      throw new Error("Set amount of sets to be done.");
    }

    const setsInt = parseInt(sets, 10);
    if (Number.isNaN(setsInt) || setsInt <= 0) {
      throw new Error("Sæt skal være et positivt tal.");
    }

  }

  return (
    <View style={styles.wrapper}>
      <View style={styles.row}>

        <View style={styles.exercisedropdown}>
          <ExerciseDropdown
            selectedExerciseName={selectedExerciseName}
            onChange={setSelectedExerciseName}
          />
        </View>

        <View style={styles.sets}>
          <TextInput
            style={styles.input}
            placeholder="sets"
            keyboardType="numeric"
            value={sets}
            onChangeText={setSets}
          />
        </View>

        <View style={styles.reps}>
          <TextInput
            style={styles.input}
            placeholder="reps"
            keyboardType="numeric"
            value={reps}
            onChangeText={setReps}
          />
        </View>

        <View style={styles.weight}>
          <TextInput
            style={styles.input}
            placeholder="weight"
            keyboardType="numeric"
            value={weight}
            onChangeText={setWeight}
          />
        </View>
      </View>

      <View style={styles.buttonContainer}>
        <Button title="SAVE" onPress={handleSubmit} />
      </View>
    </View>
  );
};

export default AddExercise;
