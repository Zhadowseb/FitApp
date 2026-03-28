import { StyleSheet } from "react-native";

export default StyleSheet.create({
  modal: {
    width: "92%",
    maxHeight: 560,
    borderRadius: 24,
  },
  content: {
    minHeight: 0,
  },
  subtitle: {
    fontSize: 13,
    lineHeight: 20,
    textAlign: "center",
  },
  list: {
    minHeight: 180,
  },
  listContent: {
    paddingTop: 6,
    paddingBottom: 4,
  },
  muscleRow: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 10,
  },
  muscleCopy: {
    flex: 1,
    paddingRight: 12,
  },
  muscleNickname: {
    fontSize: 16,
    fontWeight: "800",
    marginBottom: 4,
  },
  muscleName: {
    fontSize: 12,
    lineHeight: 18,
  },
  percentBadge: {
    minWidth: 72,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  percentText: {
    fontSize: 14,
    fontWeight: "800",
  },
  feedbackState: {
    minHeight: 180,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 12,
  },
  feedbackTitle: {
    textAlign: "center",
    marginBottom: 8,
  },
  feedbackText: {
    textAlign: "center",
    lineHeight: 20,
  },
  buttonRow: {
    marginTop: 4,
    alignItems: "center",
  },
});
