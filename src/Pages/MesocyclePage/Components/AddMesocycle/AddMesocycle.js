import React, { useState } from "react";
import { Modal, View, Text, TextInput, Button } from "react-native";
import styles from "./AddMesocycleStyle";

export default function AddMesocycleModal({ visible, onClose, onSubmit }) {
    
  const [name, setName] = useState("");
  const [focus, setFocus] = useState("");
  const [weeks, setWeeks] = useState("");

  const handleSubmit = () => {
    onSubmit({ name, focus, weeks: Number(weeks) });
    setName("");
    setFocus("");
    setWeeks("");
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
    >
      <View style={styles.overlay}>
        <View style={styles.modalBox}>

          <Text style={styles.title}>Add Mesocycle</Text>

          <TextInput
            placeholder="Mesocycle name"
            style={styles.input}
            value={name}
            onChangeText={setName}
          />

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

          <View style={styles.row}>
            <Button title="Cancel" color="grey" onPress={onClose} />
            <Button title="Add" onPress={handleSubmit} />
          </View>

        </View>
      </View>
    </Modal>
  );
}
