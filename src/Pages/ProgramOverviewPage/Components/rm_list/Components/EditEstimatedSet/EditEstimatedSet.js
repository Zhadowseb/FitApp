import React, { useEffect, useState } from "react";
import { Modal, View, Text, TextInput, Button } from "react-native";

import styles from "./EditEstimatedSetStyle";

export default function AddEstimatedSet({ 
    visible, 
    onClose, 
    onSubmit, 
    onDelete, 
    estimatedSet }) {

    const [estimated_weight, set_estimated_weight] = useState("");

    useEffect(() => {
        if(visible){
            set_estimated_weight(String(estimatedSet.estimated_weight));
        }

    }, [visible]);

  const handleSubmit = () => {
    onSubmit({ 
        id: estimatedSet.estimated_set_id, 
        estimated_weight: estimated_weight });
    onClose();
  };

  const handleDelete = () => {
    onDelete({
        id: estimatedSet.estimated_set_id});
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade" >

      <View style={styles.overlay}>
        <View style={styles.modalBox}>

          <Text style={styles.title}>
                {estimatedSet?.exercise_name ?? ""}
          </Text>

          <TextInput
            keyboardType="numeric"
            style={styles.input}
            value={estimated_weight}
            onChangeText={set_estimated_weight}
          />

          <View style={styles.row}>
            <Button title="Cancel" color="red" onPress={onClose} />
            <Button title="Delete" color="gray" onPress={handleDelete} />
            <Button title="Save" color="green" onPress={handleSubmit} />
          </View>

        </View>
      </View>
    </Modal>
  );
}
