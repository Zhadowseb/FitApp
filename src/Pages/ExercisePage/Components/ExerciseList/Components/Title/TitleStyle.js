// src/Components/ExerciseList/ExerciseListStyle.js
import { StyleSheet } from "react-native";

export default StyleSheet.create({
  
  wrapper: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },

  headerRow: {
    flexDirection: "row",
    paddingVertical: 4,
    borderBottomWidth: 1,
    borderColor: "#ccc",
    marginBottom: 4,
  },


  exercise_name: {
    flex: 50,
  },
  exercise_sets: {
    flex: 20,
  },
  exercise_x: {
    flex: 10,
  },
  exercise_reps: {
    flex: 20,
  },
  exercise_weight: {
    flex: 30,
  },
  exercise_done: {
    flex: 10,
  },

  headerText: {
    fontWeight: "bold",
    alignContent: "center",
  },

});
