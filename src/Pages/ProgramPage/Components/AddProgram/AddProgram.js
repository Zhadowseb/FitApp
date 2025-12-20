import React, { useState } from "react";
import { Modal, View, Text, TextInput, Button } from "react-native";
import { Picker } from "@react-native-picker/picker";

import styles from "./AddProgramStyle";

export default function AddProgram({ visible, onClose, onSubmit }) {
    
    const [program_name, set_Program_name] = useState("");
    const [start_date, set_Start_date] = useState("");
    const [end_date, set_End_date] = useState("");
    const [status, set_Status] = useState("NOT_STARTED");

  const handleSubmit = () => {
    onSubmit({ program_name, start_date, end_date, status });
    set_Program_name("");
    set_Start_date("");
    set_End_date("");
    set_Status("");
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade">

      <View style={styles.overlay}>
        <View style={styles.modalBox}>

          <Text style={styles.title}>Create a new program</Text>

          <TextInput
            placeholder="Program Name"
            style={styles.input}
            value={program_name}
            onChangeText={set_Program_name}
          />

          <TextInput
            placeholder="Program Start Date"
            keyboardType="numeric"
            style={styles.input}
            value={start_date}
            onChangeText={set_Start_date}
          />

          <TextInput
            placeholder="Program End Date"
            keyboardType="numeric"
            style={styles.input}
            value={end_date}
            onChangeText={set_End_date}
          />

            <Picker
            selectedValue={status}
            onValueChange={(value) => set_Status(value)}
            >
                <Picker.Item label="Not started" value="NOT_STARTED" />
                <Picker.Item label="Active" value="ACTIVE" />
                <Picker.Item label="Complete" value="COMPLETE" />
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
