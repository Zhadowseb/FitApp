import { StyleSheet } from "react-native";

export default StyleSheet.create({
  listContainer: {
    paddingHorizontal: 6,
    paddingBottom: 18,
  },

  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 40,
  },

  card: {
    padding: 0,
    overflow: "hidden",
  },

  touchable: {
    paddingHorizontal: 18,
    paddingVertical: 16,
    gap: 16,
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 12,
  },

  titleSection: {
    flex: 1,
    gap: 4,
  },

  title: {
    fontSize: 22,
    fontWeight: "700",
  },

  subtitle: {
    fontSize: 12,
    opacity: 0.65,
  },

  status_section: {
    alignItems: "flex-end",
    gap: 6,
  },

  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },

  statusText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 12,
  },

  metaGrid: {
    flexDirection: "row",
    gap: 10,
  },

  metaCard: {
    flex: 1,
    minHeight: 92,
    borderRadius: 18,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: "rgba(127, 127, 127, 0.12)",
    justifyContent: "space-between",
  },

  label: {
    fontSize: 12,
    opacity: 0.65,
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },

  value: {
    fontSize: 16,
    fontWeight: "700",
  },

  secondaryMeta: {
    fontSize: 11,
    opacity: 0.72,
    marginTop: 4,
  },

  dateLabel: {
    fontSize: 11,
    opacity: 0.65,
    marginTop: 2,
  },

  dateValue: {
    fontSize: 13,
    fontWeight: "600",
  },

  emptyText: {
    textAlign: "center",
    paddingTop: 30,
    opacity: 0.7,
  },

  ACTIVE: {
    backgroundColor: "#ff8800ff",
  },

  NOT_STARTED: {
    backgroundColor: "#9E9E9E",
  },

  COMPLETE: {
    backgroundColor: "#4CAF50",
  },
});
