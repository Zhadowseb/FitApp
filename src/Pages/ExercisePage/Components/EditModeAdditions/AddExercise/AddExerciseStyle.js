// src/Components/AddExerciseStyle.js
import { StyleSheet } from "react-native";
import ExerciseDropdown from "../../../../../Resources/Components/ExerciseDropdown/ExerciseDropdown";

export default StyleSheet.create({
  wrapper: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },

  // Dropdown
  exerciseDropdown: {
    flex: 1,
  },
  //input ved siden af hinanden
  row: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },

  left: {
    flex: 1,
    marginRight: 8,
  },

  right: {
    flex: 1,
  },

  label: {
    marginBottom: 4,
  },

  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },

  // Knappen under rækken
  buttonContainer: {
    marginTop: 4,
    margin: 10,
  },

  exercisedropdown: {
    flex: 3,
  },
  sets: {
    flex: 1,
  },
  reps: {
    flex: 1,
  },
  weight: {
    flex: 1,
  },


});
