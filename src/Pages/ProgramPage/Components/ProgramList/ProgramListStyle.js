import { StyleSheet } from "react-native";

export default StyleSheet.create({
  listContainer: {
    paddingHorizontal: 18,
    paddingBottom: 28,
  },

  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 40,
  },

  card: {
    marginHorizontal: 0,
    marginVertical: 0,
    marginBottom: 14,
    padding: 0,
    borderWidth: 1,
    borderRadius: 28,
    overflow: "hidden",
  },

  cardAccent: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 4,
  },

  touchable: {
    paddingHorizontal: 18,
    paddingTop: 20,
    paddingBottom: 0,
    gap: 16,
  },

  titleSection: {
    flex: 1,
  },

  eyebrow: {
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1,
    textTransform: "uppercase",
    marginBottom: 4,
  },

  title: {
    lineHeight: 28,
    marginBottom: 6,
  },

  subtitle: {
    fontSize: 13,
    lineHeight: 19,
  },

  heroPanel: {
    borderWidth: 1,
    borderRadius: 22,
    paddingHorizontal: 14,
    paddingVertical: 14,
    gap: 14,
  },

  heroHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 12,
  },

  statusSection: {
    alignItems: "flex-end",
    paddingTop: 2,
  },

  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 999,
  },

  statusText: {
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 0.4,
    textTransform: "uppercase",
  },

  heroSummary: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "700",
  },

  heroTimelineRow: {
    flexDirection: "row",
    gap: 10,
  },

  timelineCard: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 4,
  },

  metaGrid: {
    flexDirection: "row",
    gap: 10,
  },

  metaCard: {
    flex: 1,
    minHeight: 104,
    borderWidth: 1,
    borderRadius: 18,
    paddingHorizontal: 12,
    paddingVertical: 12,
    justifyContent: "center",
    alignItems: "center",
  },

  label: {
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 0.8,
    textTransform: "uppercase",
    marginBottom: 8,
    textAlign: "center",
  },

  value: {
    fontSize: 24,
    fontWeight: "800",
    lineHeight: 30,
    textAlign: "center",
  },

  dateGroup: {
    gap: 2,
  },

  dateLabel: {
    fontSize: 11,
    fontWeight: "700",
    lineHeight: 14,
  },

  dateValue: {
    fontSize: 13,
    fontWeight: "700",
    lineHeight: 17,
  },

  footerRow: {
    marginTop: -8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
  },

  footerCopy: {
    fontSize: 13,
    fontWeight: "700",
    letterSpacing: 0.3,
  },

  emptyCard: {
    marginHorizontal: 0,
    marginVertical: 0,
    paddingHorizontal: 18,
    paddingTop: 30,
    paddingBottom: 26,
    borderWidth: 1,
    borderRadius: 26,
    overflow: "hidden",
  },

  emptyText: {
    textAlign: "center",
    fontSize: 15,
    lineHeight: 21,
  },
});
