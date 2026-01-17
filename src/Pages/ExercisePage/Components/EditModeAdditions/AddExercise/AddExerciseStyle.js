// src/Components/AddExerciseStyle.js
import { StyleSheet } from "react-native";
import ExerciseDropdown from "../../../../../Resources/Components/ExerciseDropdown/ExerciseDropdown";

export default StyleSheet.create({
  
  // Dropdown
  exerciseDropdown: {
    flex: 1,
    paddingLeft: 10,
    paddingRight: 10,
    paddingTop: 10,
  },
  //input ved siden af hinanden
  row: {
    padding: 10,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },


  exercisedropdown: {
    flex: 3,
  },
  sets: {
    flex: 1,
    paddingRight: 5,
  },
  reps: {
    flex: 1,
  },
  weight: {
    flex: 1,
    paddingLeft: 5,
  },


});
