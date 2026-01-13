// src/Components/ExerciseList/WorkoutList.js
import { useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, Button, Modal } from "react-native";
import { useSQLiteContext } from "expo-sqlite";
import { useNavigation } from "@react-navigation/native";

import styles from "./PickWorkoutModalStyle";

const PickWorkoutModal = ({ workouts, visible, onClose, onSubmit }) => {
  if(!visible) return null;

  const navigation = useNavigation();
  const db = useSQLiteContext();

  return (

    <Modal
      visible={visible}
      transparent
      animationType="fade">

      <View style={styles.overlay}>
        <View style={styles.modalBox}>

          <ScrollView style={styles.wrapper}>

            {/* Header */}
            {workouts.length > 0 && (
              <View style={styles.headerRow}>
                <Text style={[styles.left, styles.headerText]}>
                  Workouts
                </Text>
              </View>
            )}

            {/* Items */}
            {workouts.map((item) => (
              <TouchableOpacity
                key={item.workout_id}
                style={styles.row}
                onPress={() => {
                    navigation.navigate("ExercisePage", {
                      workout_id: item.workout_id,
                      date: item.date,
                    })
                    onClose();
                  }
                }
              >
                <Text
                  style={[
                    styles.left,
                    item.done === 1 && { color: "green" },
                  ]}
                >
                  Workout #{item.workout_id}
                </Text>
                
              </TouchableOpacity>
            ))}
          </ScrollView>

          <Button
            title="Close"
            color="gray"
            onPress={() => {
              onClose();
            }}   />        

        </View>
      </View>
    </Modal>

  );
};

export default PickWorkoutModal;
