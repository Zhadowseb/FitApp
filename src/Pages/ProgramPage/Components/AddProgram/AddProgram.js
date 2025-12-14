import React, { useState } from "react";
import { View, Text, TextInput, Button, Alert } from "react-native";
import { useSQLiteContext } from "expo-sqlite";

import styles from "./AddProgramStyle";

const AddProgram = () => {
  const db = useSQLiteContext();

  const [program_name, set_Program_name] = useState("");
  const [start_date, set_Start_date] = useState("");
  const [end_date, set_End_date] = useState("");
  const [status, set_Status] = useState("");

  const handleSubmit = async () => {
    try {
      await db.runAsync(
        `INSERT INTO Program (program_name, start_date, end_date) VALUES (?, ?, ?);`,
        [program_name, start_date, end_date]
      );

      Alert.alert("Success", "Exercise tilføjet!");
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
    
        <TextInput
            style={styles.input}
            placeholder="Program Name"
            value={program_name}
            onChangeText={set_Program_name} />


        <TextInput
            style={styles.input}
            placeholder="Program Start Date"
            keyboardType="numeric"
            value={start_date}
            onChangeText={set_Start_date} />

        <TextInput
            style={styles.input}
            placeholder="Program End Date"
            keyboardType="numeric"
            value={end_date}
            onChangeText={set_End_date} />


      <View style={styles.buttonContainer}>
        <Button title="Add" onPress={handleSubmit} />
      </View>
    </View>
  );
};

export default AddProgram;
