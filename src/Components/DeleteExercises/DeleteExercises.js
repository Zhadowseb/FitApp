// src/Components/AddExercise.js
import React, { useState } from "react";
import { View, Text, TextInput, Button, Alert } from "react-native";
import { useSQLiteContext } from "expo-sqlite";
import styles from "./DeleteExercisesStyle";

const ClearDB = () => {
  const db = useSQLiteContext();

  const handleSubmit = async () => {
    try {
      await db.runAsync(
        `DELETE FROM Exercise;`);
        Alert.alert("Success", "All exercises deleted!");
    } catch (error) {
      console.error(error);
      Alert.alert("Error", error.message || "Der skete en fejl ved tilføjelsen.");
    }
  };

  return (
    <View style={styles.buttonContainer}>
        <Button title="Clear out exercises (test button)" onPress={handleSubmit} />
    </View>
  );
};

export default ClearDB;
