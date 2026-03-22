import { StyleSheet } from "react-native";

export default StyleSheet.create({

  listHeader: {
    paddingTop: 0,
  },

  card: {
    flexDirection: "column",
    paddingTop: 14,
    paddingBottom: 12,
  },

  cardHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
  },

  cardHeaderContent: {
    flex: 1,
    paddingRight: 12,
  },

  cardHeaderEyebrow: {
    fontWeight: "700",
    letterSpacing: 0.9,
    textTransform: "uppercase",
    marginBottom: 2,
  },

  cardHeaderTitle: {
    marginBottom: 4,
  },

  cardHeaderSummary: {
    lineHeight: 16,
  },

  cardHeaderSide: {
    alignItems: "flex-end",
  },

  statusPill: {
    minHeight: 30,
    paddingHorizontal: 12,
    borderRadius: 999,
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },

  statusPillText: {
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },

  optionsButton: {
    width: 38,
    height: 38,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  progressTrack: {
    height: 8,
    borderRadius: 999,
    overflow: "hidden",
    marginTop: 12,
    marginBottom: 12,
  },

  progressFill: {
    height: "100%",
    borderRadius: 999,
  },

  weekdaysShell: {
    paddingTop: 2,
  },

  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 40,
  },

  bottomsheet_title: {
    flexDirection: "row",
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

  weekdaysRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingTop: 2,
    paddingBottom: 2,
  },

  weekdayTouchable: {
    flex: 1,
    alignItems: "center",
  },

  focus: {
    flex: 8,
    justifyContent: "center",
    alignItems: "center",
  },
});
