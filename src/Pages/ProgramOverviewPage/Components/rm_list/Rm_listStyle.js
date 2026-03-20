import { StyleSheet } from "react-native";

export default StyleSheet.create({
  container: {
    flex: 1,
  },

  wrapper: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 8,
  },

  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 14,
  },

  metaHint: {
    textAlign: "right",
  },

  list: {
    paddingBottom: 8,
  },

  estimateTile: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 22,
    paddingHorizontal: 14,
    paddingVertical: 14,
    marginBottom: 10,
  },

  estimateContent: {
    flex: 1,
    paddingRight: 12,
  },

  estimateEyebrow: {
    letterSpacing: 0.8,
    textTransform: "uppercase",
    marginBottom: 6,
  },

  estimateExerciseName: {
    fontWeight: "700",
    marginBottom: 6,
  },

  estimateHint: {
    lineHeight: 16,
  },

  weightBadge: {
    minWidth: 82,
    borderRadius: 18,
    paddingHorizontal: 12,
    paddingVertical: 10,
    alignItems: "center",
    justifyContent: "center",
  },

  weightValue: {
    fontWeight: "700",
    textAlign: "center",
  },

  weightLabel: {
    marginTop: 2,
    textAlign: "center",
  },

  emptyState: {
    borderRadius: 22,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 18,
    alignItems: "center",
  },

  emptyText: {
    textAlign: "center",
    marginBottom: 6,
  },

  emptyHint: {
    textAlign: "center",
    lineHeight: 18,
  },

  loadingContainer: {
    paddingTop: 32,
    paddingBottom: 24,
    alignItems: "center",
    justifyContent: "center",
  },
});
