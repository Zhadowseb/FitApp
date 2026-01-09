import { StyleSheet } from "react-native";

export default StyleSheet.create({
  card: {
    flexDirection: "row",
    backgroundColor: "#fff",
    padding: 16,
    marginVertical: 10,
    marginHorizontal: 16,
    borderRadius: 10,
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { height: 2, width: 0 },
  },

  status_section: {
    alignItems: "center",
    flex: 0.2,
    borderRightWidth: 1,
    borderColor: "#b9b9b9ff",
    paddingRight: 10,
  },

  body: {
    flexDirection: "column",
    alignItems: "center",
    flex: 0.8,
  },

  focus: {
    flex: 1,
    marginBottom: 6,
    borderBottomWidth: 1,
    borderColor: "#b9b9b9ff",
    paddingBottom: 10,
    marginBottom: 10,
  },

  weeks: {
    flex: 1,
    marginTop: 6,
  },

  header_status: {
    alignItems: "center",
  },

  label: {
    fontSize: 14,
    fontWeight: "bold",
  },



  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 40,
  },

  checkbox_header: {
    flex: 1,
  },

  checkbox_container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
