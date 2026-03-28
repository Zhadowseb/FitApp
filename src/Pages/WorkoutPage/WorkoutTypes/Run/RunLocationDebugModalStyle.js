import { StyleSheet } from "react-native";

export default StyleSheet.create({
  modal: {
    width: "94%",
    maxHeight: 640,
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
  summaryGrid: {
    flexDirection: "row",
    gap: 8,
  },
  summaryCard: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 18,
    paddingHorizontal: 10,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  summaryLabel: {
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 0.7,
    textTransform: "uppercase",
    textAlign: "center",
  },
  summaryValue: {
    marginTop: 6,
    fontSize: 24,
    lineHeight: 28,
    fontWeight: "800",
    textAlign: "center",
    fontVariant: ["tabular-nums"],
  },
  breakdownRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  breakdownBadge: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  breakdownText: {
    fontSize: 11,
    fontWeight: "700",
  },
  list: {
    minHeight: 220,
  },
  listContent: {
    paddingTop: 4,
    paddingBottom: 4,
  },
  logRow: {
    borderWidth: 1,
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 10,
  },
  logRowTop: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  logRowCopy: {
    flex: 1,
    paddingRight: 10,
  },
  logTime: {
    fontSize: 15,
    fontWeight: "800",
    marginBottom: 4,
    fontVariant: ["tabular-nums"],
  },
  logMeta: {
    fontSize: 12,
    lineHeight: 18,
  },
  statusBadge: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  statusText: {
    fontSize: 11,
    fontWeight: "800",
  },
  metricRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 10,
    marginBottom: 8,
  },
  metricBadge: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  metricText: {
    fontSize: 11,
    fontWeight: "700",
  },
  coordinateText: {
    fontSize: 11,
    lineHeight: 16,
    fontVariant: ["tabular-nums"],
  },
  emptyState: {
    minHeight: 220,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 12,
  },
  emptyTitle: {
    textAlign: "center",
    marginBottom: 8,
  },
  emptyText: {
    textAlign: "center",
    lineHeight: 20,
  },
  buttonRow: {
    marginTop: 4,
    alignItems: "center",
  },
});
