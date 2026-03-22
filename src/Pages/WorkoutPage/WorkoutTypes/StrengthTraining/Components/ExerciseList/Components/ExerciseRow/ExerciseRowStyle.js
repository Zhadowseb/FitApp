import { StyleSheet } from "react-native";

export default StyleSheet.create({
  exerciseCard: {
    borderWidth: 1,
    borderRadius: 24,
    marginBottom: 8,
    marginHorizontal: 6,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },

  headerRow: {
    flexDirection: "row",
    alignItems: "flex-start",
  },

  headerMain: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    paddingRight: 10,
  },

  checkboxShell: {
    width: 38,
    height: 38,
    borderRadius: 14,
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },

  checkbox: {
    marginLeft: 2,
  },

  titleBlock: {
    flex: 1,
    justifyContent: "center",
    paddingRight: 8,
  },

  exerciseTitle: {
    marginBottom: 2,
  },

  exerciseMeta: {
    lineHeight: 16,
  },

  actionsRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  actionButton: {
    width: 34,
    height: 34,
    borderRadius: 12,
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 6,
  },

  summaryRow: {
    marginTop: 12,
    borderWidth: 1,
    borderRadius: 18,
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: "row",
    alignItems: "center",
  },

  summaryTextBlock: {
    flex: 1,
    paddingRight: 8,
  },

  summaryValue: {
    fontWeight: "600",
    lineHeight: 18,
  },

  summaryIcon: {
    marginLeft: "auto",
    justifyContent: "center",
    alignItems: "center",
  },

  expandedSection: {
    marginTop: 10,
    marginHorizontal: -6,
    marginBottom: -6
  },
});
