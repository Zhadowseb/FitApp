import { StyleSheet } from "react-native";

export default StyleSheet.create({
  card: {
    marginHorizontal: 0,
    marginVertical: 0,
    paddingHorizontal: 18,
    paddingVertical: 18,
    borderWidth: 1,
    borderRadius: 24,
  },
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  headerCopy: {
    flex: 1,
    paddingRight: 12,
  },
  eyebrow: {
    fontWeight: "800",
    letterSpacing: 0.8,
    textTransform: "uppercase",
    marginBottom: 8,
  },
  title: {
    lineHeight: 26,
  },
  countBadge: {
    minWidth: 88,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  countBadgeText: {
    fontSize: 12,
    fontWeight: "800",
    textAlign: "center",
  },
  description: {
    lineHeight: 20,
  },
  divider: {
    height: 1,
    opacity: 0.55,
    marginTop: 16,
    marginBottom: 16,
  },
  list: {
    paddingBottom: 8,
  },
  exerciseRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 14,
    borderWidth: 1,
    borderRadius: 18,
    marginBottom: 10,
  },
  exerciseIndex: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  exerciseIndexText: {
    fontSize: 12,
    fontWeight: "800",
  },
  exerciseName: {
    flex: 1,
    fontSize: 16,
    fontWeight: "700",
  },
  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
    paddingHorizontal: 12,
  },
  emptyTitle: {
    textAlign: "center",
    marginBottom: 8,
  },
  emptyBody: {
    textAlign: "center",
    lineHeight: 20,
    maxWidth: 260,
  },
});
