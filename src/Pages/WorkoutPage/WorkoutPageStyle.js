import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  bottomsheetTitle: {
    borderBottomWidth: 1,
    borderBottomColor: "#2e2e2eff",
    paddingBottom: 20,
    alignItems: "center"
  },
  bottomsheetBody: {
    justifyContent: "center",
    padding: 20,
    paddingLeft: 0,
  },
  option: {
    flexDirection: "row",
    paddingTop: 20,
  },
  optionText: {
    paddingLeft: 10,
    fontWeight: 600,
    fontSize: 16,
  },
  filterOption: {
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 0,
  },
  filterOptionText: {
    fontWeight: 600,
    fontSize: 16,
  },
});
