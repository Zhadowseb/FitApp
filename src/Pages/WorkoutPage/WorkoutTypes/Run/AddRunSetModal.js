import React, { useState } from "react";
import { Modal, View, Text, TextInput, Button } from "react-native";

import { ThemedTextInput, ThemedCard, ThemedView, ThemedText, ThemedButton, ThemedModal } 
  from "../../../../Resources/Components";

export default function AddRunSetModal({ visible, onClose, onSubmit }) {

  const handleSubmit = () => {
    onSubmit({  });
  };

  return (
    <ThemedModal
      visible={visible}
      title="Add Set" >

        {/* toggle is pause */}
        {/* set distance if any */}
        {/* set pace if any */}
        {/* set time if any */}
        {/* set heartrate, fx zone */}

    </ThemedModal>
  );
}
