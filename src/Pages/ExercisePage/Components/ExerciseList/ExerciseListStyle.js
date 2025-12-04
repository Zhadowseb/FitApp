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

  row: {
    flexDirection: "row",      // 🔴 to kolonner side om side
    paddingVertical: 4,
    borderBottomWidth: 1,
    borderColor: "#eee",
  },

  left: {
    flex: 2,
  },

  right: {
    flex: 1,
    textAlign: "right",
  },

  headerText: {
    fontWeight: "bold",
  },
});
