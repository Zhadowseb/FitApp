import { StyleSheet } from "react-native";

export default StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "row",
  },

  container_left: {
    flex: 1,
  },

  container_right: {
    flex: 1.5,
    alignItems: "center",
    justifyContent: "center",
  },

  today: {
    alignItems: "center",
  },

  today_date: {
    flex: 1,
  },

  icons: {
    alignContent: "center",
  },

  day_container: {
      padding: 0,
      minHeight: 120,
      marginBottom: 12,
  },

});
