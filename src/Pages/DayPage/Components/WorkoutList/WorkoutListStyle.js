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
    flexDirection: "row",
    paddingVertical: 30,
    borderBottomWidth: 1,
    borderColor: "#eee",
    padding: 5,
    marginVertical: 16,
    borderRadius: 10,
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { height: 3, width: 0 },
    backgroundColor: "#ff7b00ff",
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
