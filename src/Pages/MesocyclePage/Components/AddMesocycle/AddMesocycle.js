import React, { useState } from "react";
import { Modal, View, Text, TextInput, Button } from "react-native";
import styles from "./AddMesocycleStyle";
import { Picker } from "@react-native-picker/picker";

export default function AddMesocycleModal({ visible, onClose, onSubmit }) {

  const [focus, setFocus] = useState("");
  const [weeks, setWeeks] = useState("");

  const handleSubmit = () => {
    onSubmit({ focus, weeks: Number(weeks) });
    setFocus("");
    setWeeks("");
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade">

      <View style={styles.overlay}>
        <View style={styles.modalBox}>

          <Text style={styles.title}>Add Mesocycle</Text>

          <TextInput
            placeholder="Focus (e.g. Hypertrophy)"
            style={styles.input}
            value={focus}
            onChangeText={setFocus}
          />

          <TextInput
            placeholder="Weeks"
            keyboardType="numeric"
            style={styles.input}
            value={weeks}
            onChangeText={setWeeks}
          />

          <Picker>

          </Picker>

          <View style={styles.row}>
            <Button title="Cancel" color="red" onPress={onClose} />
            <Button title="Add" color="green" onPress={handleSubmit} />
          </View>

        </View>
      </View>
    </Modal>
  );
}
