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
    width: 180,
    height: 180,
    borderRadius: 90,
    top: -84,
    right: -44,
    opacity: 0.16,
  },

  heroAccentSecondary: {
    position: "absolute",
    width: 126,
    height: 126,
    borderRadius: 63,
    bottom: -54,
    left: -28,
    opacity: 0.08,
  },

  heroContentRow: {
    flexDirection: "row",
    alignItems: "flex-start",
  },

  heroInfoColumn: {
    flex: 1,
    paddingRight: 12,
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
  },

  heroTimerValue: {
    fontSize: 36,
    lineHeight: 40,
    fontWeight: "800",
    letterSpacing: 0.5,
    fontVariant: ["tabular-nums"],
  },

  heroTimerHint: {
    marginTop: 4,
    fontSize: 12,
    lineHeight: 17,
  },

  heroMetaRow: {
    flexDirection: "row",
    marginTop: 14,
  },

  heroMetaCard: {
    flex: 1,
    borderRadius: 18,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },

  heroMetaLabel: {
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 0.8,
    textTransform: "uppercase",
    marginBottom: 6,
  },

  heroMetaValue: {
    fontSize: 12,
    lineHeight: 17,
    fontWeight: "700",
  },

  heroProgressColumn: {
    width: 152,
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 4,
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

  toolbar: {
    alignSelf: "center",
    width: "95%",
    marginBottom: 6,
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
  },

  toolbarButton: {
    width: 40,
    height: 40,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 8,
  },

  workingSets: {
    width: "100%",
    paddingBottom: 24,
  },
});
