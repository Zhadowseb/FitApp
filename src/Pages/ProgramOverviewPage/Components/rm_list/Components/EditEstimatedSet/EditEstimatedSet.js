import React, { useEffect, useState } from "react";

import styles from "./EditEstimatedSetStyle";
import {
  ThemedButton,
  ThemedModal,
  ThemedText,
  ThemedTextInput,
} from "../../../../../../Resources/ThemedComponents";

export default function EditEstimatedSet({
  visible,
  onClose,
  onSubmit,
  onDelete,
  estimatedSet,
}) {
  const [estimated_weight, set_estimated_weight] = useState("");

  useEffect(() => {
    if (visible) {
      set_estimated_weight(String(estimatedSet?.estimated_weight ?? ""));
    }
  }, [visible, estimatedSet]);

  const persistChanges = async () => {
    const nextEstimatedWeight = estimated_weight.trim();

    if (!estimatedSet || nextEstimatedWeight === "") {
      return;
    }

    if (nextEstimatedWeight === String(estimatedSet.estimated_weight ?? "")) {
      return;
    }

    await onSubmit({
      id: estimatedSet.estimated_set_id,
      estimated_weight: nextEstimatedWeight,
    });
  };

  const handleClose = async () => {
    await persistChanges();
    onClose();
  };

  const handleDelete = async () => {
    if (!estimatedSet) {
      onClose();
      return;
    }

    await onDelete({
      id: estimatedSet.estimated_set_id,
    });
    onClose();
  };

  return (
    <ThemedModal
      visible={visible}
      onClose={handleClose}
      title={estimatedSet?.exercise_name ?? "Edit estimated 1 RM"}
    >
      <ThemedText size={12} style={styles.helperText}>
        Close the modal to save changes.
      </ThemedText>

      <ThemedTextInput
        placeholder="Estimated Weight"
        keyboardType="numeric"
        value={estimated_weight}
        onChangeText={set_estimated_weight}
      />

      <ThemedButton
        variant="danger"
        title="Delete 1 RM"
        onPress={handleDelete}
      />
    </ThemedModal>
  );
}
