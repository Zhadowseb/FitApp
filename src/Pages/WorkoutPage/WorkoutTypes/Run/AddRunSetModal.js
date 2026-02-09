import React, { useState } from "react";
import { Modal, View, Text, TextInput, Button } from "react-native";

import { ThemedTextInput, 
  ThemedCard, 
  ThemedView, 
  ThemedText, 
  ThemedButton, 
  ThemedModal,
  ThemedSegmentedToggle } 
  from "../../../../Resources/Components";

export default function AddRunSetModal({ visible, onClose, onSubmit }) {

  const [pauseOrWorking, set_pauseOrWorking] = useState("left");
  const [distance, set_distance] = useState(0);
  const [pace, set_pace] = useState(0);
  const [time, set_time] = useState(0);
  const [heartrate, set_heartrate] = useState(0);

  const handleSubmit = () => {
    onSubmit({ pauseOrWorking, distance, pace, time, heartrate });
  };

  return (
    <ThemedModal
      style={{maxHeight: 450}}
      visible={visible}
      onClose={onClose}
      title="Add Set" >

        {/* set distance if any */}
        <ThemedSegmentedToggle
          value={pauseOrWorking}
          leftLabel="Pause"
          rightLabel="Working set"
          onChange={set_pauseOrWorking} />

        {/* set distance if any */}
        <ThemedTextInput
            placeholder="Distance"
            value={distance}
            onChangeText={set_distance} />

        {/* set pace if any */}
        <ThemedTextInput
            placeholder="Pace"
            value={pace}
            onChangeText={set_pace} />

        {/* set time if any */}
        <ThemedTextInput
            placeholder="Time"
            value={time}
            onChangeText={set_time} />

        {/* set heartrate, fx zone */}
        <ThemedTextInput
            placeholder="Heartrate"
            value={heartrate}
            onChangeText={set_heartrate} />

        <ThemedButton
          title="Add"
          onPress={handleSubmit()}
          variant="secondary"
          />

    </ThemedModal>
  );
}
