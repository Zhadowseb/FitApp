import { StyleSheet } from "react-native";

export default StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
    padding: 20,
    borderRadius: 10,
  },
  modalBox: {
    backgroundColor: "white",
    justifyContent: "center",
    alignItems: "center",
    padding: 30,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#717171ff",
  },

  icon: {
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#d7d7d7ff",
    padding: 5,
    justifyContent: "center",
    alignItems: "center",
  },

  button_container: {
    paddingTop: 20,
  },

});
