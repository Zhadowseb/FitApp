import { StyleSheet } from "react-native";

export default StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    marginBottom: 18,
  },
  loadingState: {
    minHeight: 140,
    alignItems: "center",
    justifyContent: "center",
  },
  loadingCopy: {
    marginTop: 10,
    textAlign: "center",
  },
  emptyState: {
    minHeight: 110,
    justifyContent: "center",
  },
  emptyCopy: {
    marginTop: 8,
    lineHeight: 20,
  },
  programSection: {
    marginBottom: 12,
  },
  programLabelGroup: {
    marginBottom: 8,
  },
  programLabelEyebrow: {
    fontWeight: "800",
    fontSize: 11,
    letterSpacing: 1,
    textTransform: "uppercase",
    marginBottom: 4,
  },
  programLabelTitle: {
    lineHeight: 24,
  },
});
