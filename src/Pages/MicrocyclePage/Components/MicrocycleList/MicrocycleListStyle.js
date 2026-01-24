import { StyleSheet } from "react-native";

export default StyleSheet.create({

  status_section: {
    alignItems: "center",
    flex: 0.5,
    paddingRight: 10,
    flexDirection: "row",
    
  },

  body: {
    flexDirection: "column",
    alignItems: "center",
    flex: 0.8,
  },

  focus: {
    justifyContent: "center",
    alignItems: "center"
  },

  done: {
    justifyContent: "center",
    alignItems: "center",
    margin: 15,
  },

  weeks: {
    flex: 1,
    marginTop: 6,
  },

  header_status: {
    alignItems: "center",
    flexDirection: "column",
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

  bottomsheet_title: {
    borderBottomWidth: 1,
    borderBottomColor: "#2e2e2eff",
    paddingBottom: 30,
  },
  bottomsheet_body: {
    justifyContent: "center",
    padding: 20,
    paddingLeft: 0,
  },

  option_text: {
    paddingLeft: 10,
    fontWeight: 600,
    fontSize: 16,
  },

  option: {
    flexDirection: "row",
    paddingTop: 20,
  },

  options: {
    flex: 0.2,
    alignItems: 'center',
    justifyContent: "center",
  },
});
