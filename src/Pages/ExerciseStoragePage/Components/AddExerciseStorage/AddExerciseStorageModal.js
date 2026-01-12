import React, { useState } from "react";
import { Modal, View, Text, TextInput, Button, TouchableOpacity } from "react-native";
import { Picker } from "@react-native-picker/picker";
import DateTimePicker from '@react-native-community/datetimepicker';

import styles from "./AddExerciseStorageModalStyle";
import Calender from "../../../../Resources/Icons/UI-icons/Calender"

export default function AddExerciseStorageModal({ visible, onClose, onSubmit }) {
    
  const [exercise_name, set_exercise_name] = useState("");


  const handleSubmit = () => {
    onSubmit({ exercise_name });
    set_exercise_name("");
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade">

      <View style={styles.overlay}>
        <View style={styles.modalBox}>

          <Text style={styles.title}>Add exercise to the library of exercises </Text>

          <TextInput
            placeholder="Exercise Name"
            style={styles.input}
            value={exercise_name}
            onChangeText={set_exercise_name}
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
