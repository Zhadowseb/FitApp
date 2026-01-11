import React, { useState } from "react";
import { Modal, View, Text, TextInput, Button, TouchableOpacity } from "react-native";
import { Picker } from "@react-native-picker/picker";
import DateTimePicker from '@react-native-community/datetimepicker';

import styles from "./AddProgramStyle";
import Calender from "../../../../Resources/Icons/UI-icons/Calender"

export default function AddProgram({ visible, onClose, onSubmit }) {
    
  const [program_name, set_Program_name] = useState("");
  const [start_date, set_Start_date] = useState(new Date());
  const [status, set_Status] = useState("NOT_STARTED");
  const [datePicker_visible, set_datePicker_visible] = useState(false);


  const handleSubmit = () => {
    onSubmit({ program_name, start_date, status });
    set_Program_name("");
    set_Start_date(new Date());
    set_Status("NOT_STARTED");
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

          <TouchableOpacity
            style={styles.card}
            onPress={() => set_datePicker_visible(true)}>

            <Text>
              Selected: {start_date instanceof Date
              ? start_date.toLocaleDateString()
              : ""}

            </Text>
            <View style={styles.calender_icon}>
              <Calender 
                width={24} 
                height={24} />
            </View>
          </TouchableOpacity>

          {datePicker_visible && (
            <DateTimePicker
              value={start_date}
              mode="date"
              display="default"
              onChange={(event, date) => {
                set_datePicker_visible(false);
                if (date) set_Start_date(date);
              }}
            />
          )}



            

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
