// src/Components/ExerciseList/WorkoutList.js
import { useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, Button, Modal } from "react-native";
import { useSQLiteContext } from "expo-sqlite";
import { useNavigation } from "@react-navigation/native";

import styles from "./PickWorkoutModalStyle";

import {ThemedText, 
        ThemedModal } from "../../../../../Resources/Components";

const PickWorkoutModal = ({ workouts, visible, onClose, onSubmit }) => {
  if(!visible) return null;

  const navigation = useNavigation();
  const db = useSQLiteContext();

  return (

    <ThemedModal
      visible={visible}
      title="Pick a workout">

      <ScrollView style={styles.wrapper}>

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
            <ThemedText
              style={[
                styles.left,
                item.done === 1 && { color: "green" },
              ]}
            >
              Workout #{item.workout_id}
            </ThemedText>

            <ThemedText> {item.label} </ThemedText>
            
          </TouchableOpacity>
        ))}
      </ScrollView>   
    </ThemedModal>

  );
};

export default PickWorkoutModal;
