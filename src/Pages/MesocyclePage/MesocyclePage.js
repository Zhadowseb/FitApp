import React, { useState } from "react";
import { View, Text, TextInput, Button, Alert } from "react-native";
import { useSQLiteContext } from "expo-sqlite";

import styles from "./MesocyclePageStyle";

const AddMesocycle = () => {
  const db = useSQLiteContext();

  const [program_name, set_Program_name] = useState("");

  return (
    <View style={styles.wrapper}>
    
        <TextInput
            style={styles.input}
            placeholder="Program Name"
            value={program_name}
            onChangeText={set_Program_name} />

      <View style={styles.buttonContainer}>
        <Button title="Add" onPress={handleSubmit} />
      </View>
    </View>
  );
};

export default AddProgram;
