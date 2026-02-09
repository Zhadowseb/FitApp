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

  const [mode, setMode] = useState("left");

  const handleSubmit = () => {
    onSubmit({  });
  };

  return (
    <ThemedModal
      visible={visible}
      onClose={onClose}
      title="Add Set" >

      {/* toggle is pause */}
      <ThemedSegmentedToggle
        value={mode}
        leftLabel="Warmup"
        rightLabel="Working"
        onChange={setMode}
      />


        {/* set distance if any */}
        {/* set pace if any */}
        {/* set time if any */}
        {/* set heartrate, fx zone */}

    </ThemedModal>
  );
}
