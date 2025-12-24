import React, { useState } from "react";
import { Modal, View, Text, TextInput, Button } from "react-native";
import { Picker } from "@react-native-picker/picker";

import styles from "./AddEstimatedSetStyle";
import ExerciseDropdown from "../../../../../../Components/ExerciseDropdown/ExerciseDropdown";

export default function AddEstimatedSet({ visible, onClose, onSubmit }) {

    const [estimated_weight, set_estimated_weight] = useState("");
    const [selectedExerciseName, set_selectedExerciseName] = useState("");

  const handleSubmit = () => {
    onSubmit({ selectedExerciseName, estimated_weight });
    set_selectedExerciseName("");
    set_estimated_weight(0);
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade" >

      <View style={styles.overlay}>
        <View style={styles.modalBox}>

          <Text style={styles.title}>Add new estimated 1 RM</Text>

          <ExerciseDropdown
            selectedExerciseName={selectedExerciseName}
            onChange={set_selectedExerciseName} />

          <TextInput
            placeholder="Estimated Weight"
            
            keyboardType="numeric"
            style={styles.input}
            value={estimated_weight}
            onChangeText={set_estimated_weight}
          />

          <View style={styles.row}>
            <Button title="Cancel" color="red" onPress={onClose} />
            <Button title="Add" color="green" onPress={handleSubmit} />
          </View>

        </View>
      </View>
    </Modal>
  );
}
