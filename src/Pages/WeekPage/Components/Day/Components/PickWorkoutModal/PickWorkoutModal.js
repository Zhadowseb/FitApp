// src/Components/ExerciseList/PickWorkoutModal.js
import { ScrollView, TouchableOpacity } from "react-native";
import styles from "./PickWorkoutModalStyle";

import {
  ThemedText,
  ThemedModal,
} from "../../../../../../Resources/Components";

const PickWorkoutModal = ({
  workouts = [],
  visible,
  onClose,
  onSubmit, // 👈 callback til parent
}) => {
  return (
    <ThemedModal
      visible={visible}
      title="Pick a workout"
      onClose={onClose}
    >
      <ScrollView style={styles.wrapper}>
        {workouts.map((item) => (
          <TouchableOpacity
            key={item.workout_id}
            style={styles.row}
            onPress={() => {
              onSubmit?.(item);   // 👈 returnér workout
              onClose();
            }}
          >
            <ThemedText
              style={[
                styles.left,
                item.done === 1 && { color: "green" },
              ]}
            >
              Workout #{item.workout_id}
            </ThemedText>

            <ThemedText>{item.label}</ThemedText>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </ThemedModal>
  );
};

export default PickWorkoutModal;
