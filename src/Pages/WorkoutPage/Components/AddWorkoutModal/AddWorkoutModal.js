import React, { useState } from "react";
import { Modal, View } from "react-native";

import { ThemedModal } from "../../../../Resources/Components";

export default function AddProgram({ visible, onClose, onSubmit }) {;


  const handleSubmit = () => {
    onSubmit(0);
  };

  return (
    <ThemedModal
      visible={visible}
      transparent
      title="Create new workout:" >

    </ThemedModal>
  );
}
