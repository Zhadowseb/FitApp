import React, { useState } from "react";
import { Modal, View, Text, TextInput, Button } from "react-native";
import { Picker } from "@react-native-picker/picker";

import styles from "./AddEstimatedSetStyle";
import ExerciseDropdown from "../../../../../../Resources/Components/ExerciseDropdown/ExerciseDropdown";
import { ThemedButton, ThemedModal, ThemedTextInput } from "../../../../../../Resources/Components";

export default function AddEstimatedSet({ visible, onClose, onSubmit }) {

    const [estimated_weight, set_estimated_weight] = useState("");
    const [selectedExerciseName, set_selectedExerciseName] = useState("");

  const handleSubmit = () => {
    onSubmit({ selectedExerciseName, estimated_weight });
    set_selectedExerciseName("");
    set_estimated_weight(0);
  };

  return (
    <ThemedModal
      visible={visible}
      onClose={onClose}
      title="Add new estimated 1 RM" >

          <ExerciseDropdown
            selectedExerciseName={selectedExerciseName}
            onChange={set_selectedExerciseName} />

          <ThemedTextInput
            placeholder="Estimated Weight"
            keyboardType="numeric"
            value={estimated_weight}
            onChangeText={set_estimated_weight}
          />

          <View style={styles.row}>
            <ThemedButton variant="danger" title="Close" onPress={onClose} />
            <ThemedButton variant="primary" title="Add" onPress={handleSubmit} />
          </View>
    </ThemedModal>
  );
}
