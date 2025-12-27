// src/Components/ExerciseList/ExerciseListStyle.js
import { StyleSheet } from "react-native";

export default StyleSheet.create({
  wrapper: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },

  exercise_container: {
    flex: 1,
    flexDirection: "row",
  },

  headerRow: {
    flexDirection: "row",
    paddingVertical: 4,
    borderBottomWidth: 1,
    borderColor: "#ccc",
    marginBottom: 4,
  },

  //Columns pacing

  exercise_name: {
    flex: 35,
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

  headerText: {
    fontWeight: "bold",
    alignContent: "center",
  },
});
