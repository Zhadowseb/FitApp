import { StyleSheet } from "react-native";

export default StyleSheet.create({
  heroShell: {
    width: "95%",
    alignSelf: "center",
    marginBottom: 12,
  },

  heroCard: {
    width: "100%",
    marginHorizontal: 0,
    marginVertical: 0,
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderRadius: 30,
    borderWidth: 1,
    overflow: "hidden",
  },

  heroAccentPrimary: {
    position: "absolute",
    width: 188,
    height: 188,
    borderRadius: 94,
    top: -88,
    right: -50,
    opacity: 0.16,
  },

  heroAccentSecondary: {
    position: "absolute",
    width: 132,
    height: 132,
    borderRadius: 66,
    bottom: -56,
    left: -26,
    opacity: 0.08,
  },

  heroContentRow: {
    flexDirection: "row",
    alignItems: "flex-start",
  },

  heroInfoColumn: {
    flex: 1,
    paddingRight: 14,
  },

  heroTimerBlock: {
    alignItems: "center",
    justifyContent: "center",
    minHeight: 78,
  },

  heroStatusRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },

  heroStatusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
  },

  heroStatusBadgeText: {
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 0.8,
    textTransform: "uppercase",
  },

  heroTimerLabel: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.9,
    textTransform: "uppercase",
    marginBottom: 4,
    textAlign: "center",
  },

  heroTimerValue: {
    fontSize: 40,
    lineHeight: 44,
    fontWeight: "800",
    letterSpacing: 0.5,
    fontVariant: ["tabular-nums"],
    textAlign: "center",
  },

  heroMetaCard: {
    marginTop: 11,
    borderRadius: 18,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 12,
    minHeight: 78,
    alignItems: "center",
    justifyContent: "center",
  },

  heroMetaLabel: {
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 0.8,
    textTransform: "uppercase",
    marginBottom: 6,
    textAlign: "center",
  },

  heroMetaValue: {
    fontSize: 12,
    lineHeight: 17,
    fontWeight: "700",
    textAlign: "center",
  },

  heroLiveColumn: {
    width: 150,
    alignItems: "stretch",
    justifyContent: "center",
  },

  heroLiveCard: {
    borderRadius: 24,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 14,
    minHeight: 78,
    alignItems: "center",
    justifyContent: "center",
  },

  heroLiveSubCard: {
    marginTop: 8,
    borderRadius: 20,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 12,
    minHeight: 78,
    alignItems: "center",
    justifyContent: "center",
  },

  heroLiveLabel: {
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 0.8,
    textTransform: "uppercase",
  },

  heroLiveTitle: {
    marginTop: 4,
    fontSize: 18,
    lineHeight: 22,
    fontWeight: "800",
    textAlign: "center",
  },

  heroLiveValue: {
    marginTop: 8,
    fontSize: 24,
    lineHeight: 28,
    fontWeight: "800",
    textAlign: "center",
    fontVariant: ["tabular-nums"],
  },

  heroLiveMeta: {
    marginTop: 6,
    fontSize: 11,
    lineHeight: 15,
    fontWeight: "600",
    textAlign: "center",
  },

  heroLiveSubValue: {
    marginTop: 6,
    fontSize: 20,
    lineHeight: 24,
    fontWeight: "800",
    textAlign: "center",
    fontVariant: ["tabular-nums"],
  },

  heroActionsRow: {
    flexDirection: "row",
    marginTop: 16,
  },

  heroActionSlot: {
    flex: 1,
  },

  heroActionSlotSpaced: {
    marginRight: 8,
  },

  heroActionButton: {
    width: "100%",
    height: 46,
    borderRadius: 18,
  },

  sectionShell: {
    width: "95%",
    alignSelf: "center",
    marginBottom: 12,
  },

  sectionCard: {
    width: "100%",
    marginHorizontal: 0,
    marginVertical: 0,
    paddingHorizontal: 8,
    paddingVertical: 12,
    borderRadius: 26,
    borderWidth: 1,
  },

  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },

  sectionTitleBlock: {
    flex: 1,
  },

  sectionBadge: {
    alignSelf: "flex-start",
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginBottom: 8,
  },

  sectionBadgeText: {
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 0.8,
    textTransform: "uppercase",
  },

  sectionTitle: {
    fontSize: 24,
    lineHeight: 28,
    fontWeight: "800",
  },

  sectionAddButton: {
    width: 42,
    height: 42,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 12,
  },

  tableShell: {
    borderRadius: 20,
    borderWidth: 1,
    paddingHorizontal: 2,
    paddingTop: 6,
    paddingBottom: 2,
    overflow: "visible",
  },

  emptyState: {
    borderRadius: 18,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
  },

  emptyStateText: {
    fontSize: 12,
    fontWeight: "700",
  },

  headerRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    paddingBottom: 10,
    marginBottom: 4,
  },

  grid: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },

  sharedGrid: {
    borderColor: "#4b4b4bff",
    borderBottomWidth: 0.2,
  },

  lastGrid: {
    borderBottomWidth: 0,
  },

  title: {
    borderRightWidth: 0,
    alignItems: "center",
    justifyContent: "center",
  },

  set: {
    width: "20%",
    borderRightWidth: 0.2,
  },

  distance: {
    width: "20%",
    borderRightWidth: 0.2,
    justifyContent: "center",
    alignItems: "center",
  },

  pace: {
    width: "20%",
    borderRightWidth: 0.2,
    justifyContent: "center",
    alignItems: "center",
  },

  time: {
    width: "20%",
    borderRightWidth: 0.2,
    justifyContent: "center",
    alignItems: "center",
  },

  zone: {
    width: "20%",
    justifyContent: "center",
    alignItems: "center",
  },

  headerCellLabel: {
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 0.5,
    textTransform: "uppercase",
    textAlign: "center",
  },

  headerCellUnit: {
    marginTop: 1,
    fontSize: 9,
    fontWeight: "600",
    textAlign: "center",
  },

  timeRunning: {
    borderWidth: 0.6,
    borderColor: "#f0ff21",
    borderRadius: 5,
  },

  set_number_button: {
    justifyContent: "center",
    alignItems: "center",
    width: 24,
    height: 24,
    borderTopWidth: 2,
    borderLeftWidth: 2,
    borderBottomWidth: 3,
    borderRightWidth: 3,
    backgroundColor: "rgb(32, 30, 29)",
    borderTopColor: "rgb(106, 100, 98)",
    borderLeftColor: "rgb(106, 100, 98)",
    borderBottomColor: "rgb(8, 7, 7)",
    borderRightColor: "rgb(8, 7, 7)",
  },

  set_number_button_text: {
    fontWeight: "700",
    letterSpacing: 0.2,
  },

  setCellButton: {
    flex: 1,
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 6,
  },

  setNumberBadge: {
    minWidth: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 8,
  },

  setNumberText: {
    fontWeight: "800",
  },

  pausePill: {
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },

  pauseText: {
    fontSize: 11,
    fontWeight: "700",
  },

  activeTimePill: {
    minWidth: 74,
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 7,
    alignItems: "center",
    justifyContent: "center",
  },

  activeTimeText: {
    fontWeight: "800",
    fontVariant: ["tabular-nums"],
  },

  zoneButton: {
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 6,
  },

  zonePill: {
    minWidth: 34,
    height: 28,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 8,
  },

  zoneText: {
    fontWeight: "800",
  },

  bottomsheet_title: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#2e2e2eff",
    paddingBottom: 30,
  },

  togglepauseorworking: {
    borderWidth: 2,
    borderRadius: 15,
    padding: 5,
    justifyContent: "center",
    alignItems: "center",
    width: 120,
  },

  bottomsheet_body: {
    justifyContent: "center",
    padding: 20,
    paddingLeft: 0,
  },

  option: {
    flexDirection: "row",
    paddingTop: 20,
  },

  option_text: {
    paddingLeft: 10,
    fontWeight: "600",
    fontSize: 16,
  },

  zone_dropdown_container: {
    position: "absolute",
    left: 0,
    right: 0,
    borderWidth: 1,
    borderRadius: 8,
    elevation: 6,
    zIndex: 10,
  },

  zone_dropdown_container_down: {
    top: 28,
  },

  zone_dropdown_container_up: {
    bottom: 28,
  },
});
