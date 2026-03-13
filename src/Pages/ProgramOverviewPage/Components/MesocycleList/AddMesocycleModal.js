import React, { useState } from "react";
import { StyleSheet, View } from "react-native";

import {
  ThemedTextInput,
  ThemedButton,
  ThemedModal,
} from "../../../../Resources/ThemedComponents";

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 15,
  },
});

export default function AddMesocycleModal({ visible, onClose, onSubmit }) {
  const [focus, setFocus] = useState("");
  const [weeks, setWeeks] = useState("");

  const handleSubmit = () => {
    onSubmit({ focus, weeks: Number(weeks) });
    setFocus("");
    setWeeks("");
  };

  return (
    <ThemedModal visible={visible} title="Add Mesocycle">
      <ThemedTextInput
        placeholder="Focus (e.g. Hypertrophy)"
        value={focus}
        onChangeText={setFocus}
      />

      <ThemedTextInput
        placeholder="Weeks"
        keyboardType="numeric"
        value={weeks}
        onChangeText={setWeeks}
      />

      <View style={styles.row}>
        <ThemedButton title="Cancel" variant="danger" onPress={onClose} />
        <ThemedButton title="Add" variant="primary" onPress={handleSubmit} />
      </View>
    </ThemedModal>
  );
}
