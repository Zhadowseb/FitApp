import { StyleSheet } from "react-native";

export default StyleSheet.create({
  shortcut_card: {
    minHeight: 220,
    padding: 0,
    overflow: "hidden",
    borderWidth: 1.5,
    marginBottom: 12,
  },

  shortcut_card_complete: {
    minHeight: 0,
  },

  touchable: {
    paddingHorizontal: 10,
    paddingVertical: 0,
  },

  touchable_complete: {
    paddingTop: 10,
    paddingBottom: 10,
  },

  top_row: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
  },

  top_meta: {
    flex: 1,
    paddingRight: 12,
  },

  date_badge: {
    alignSelf: "center",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },

  date_badge_text: {
    fontWeight: "700",
    letterSpacing: 0.8,
  },

  top_meta_summary: {
    alignSelf: "center",
    fontWeight: "700",
    letterSpacing: 1,
    marginTop: 8,
  },

  hero_workout_badge: {
    width: 84,
    borderWidth: 0,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 10,
    paddingVertical: 10,
    flexShrink: 0,
  },

  hero_workout_badge_slot: {
    position: "relative",
    flexShrink: 0,
    zIndex: 3,
    elevation: 3,
    transform: [{ translateY: 1 }],
  },

  hero_workout_badge_underlay: {
    ...StyleSheet.absoluteFillObject,
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
  },

  hero_workout_badge_joined: {
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    borderBottomWidth: 0,
  },

  summary_panel: {
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 14,
    marginTop: 12,
  },

  complete_summary_row: {
    flexDirection: "row",
    alignItems: "stretch",
    marginTop: 12,
  },

  summary_panel_complete: {
    flex: 1,
    marginTop: 0,
    marginRight: 10,
    justifyContent: "center",
    alignItems: "center",
  },

  complete_workout_badge: {
    borderWidth: 0,
    borderRadius: 20,
  },

  hero_workout_label: {
    marginTop: 6,
    fontWeight: "700",
    textAlign: "center",
  },

  hero_title: {
    padding: 0,
    marginBottom: 8,
  },

  hero_title_complete: {
    width: "100%",
    marginBottom: 0,
    textAlign: "center",
  },

  hero_description: {
    lineHeight: 19,
  },

  plan_section: {
    marginTop: 14,
  },

  plan_section_compact: {
    marginTop: 10,
  },

  plan_header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },

  plan_section_label: {
    fontWeight: "700",
    letterSpacing: 1.2,
    flex: 1,
    paddingRight: 10,
  },

  plan_action_chip: {
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
    flexShrink: 0,
  },

  plan_action_text: {
    fontWeight: "700",
    letterSpacing: 0.8,
    textTransform: "uppercase",
  },

  plan_card: {
    borderWidth: 1,
    borderRadius: 22,
    padding: 14,
    marginBottom: 10,
  },

  plan_card_joined: {
    borderTopRightRadius: 0,
    position: "relative",
    zIndex: 1,
  },

  joined_badge_row: {
    alignItems: "flex-end",
    marginBottom: 0,
  },

  joined_header: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    position: "relative",
    zIndex: 2,
    elevation: 2,
  },

  joined_header_copy: {
    flex: 1,
    paddingRight: 12,
    paddingBottom: 8,
  },

  plan_card_header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },

  plan_card_title: {
    flex: 1,
    fontWeight: "700",
    paddingRight: 10,
  },

  plan_status_chip: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
    flexShrink: 0,
  },

  plan_status_text: {
    fontWeight: "700",
    letterSpacing: 0.7,
    textTransform: "uppercase",
  },

  plan_item_list: {
    marginTop: 2,
  },

  plan_item_list_scroll: {
    maxHeight: 185,
  },

  plan_item_list_content: {
    paddingBottom: 2,
  },

  plan_item_row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderRadius: 16,
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginBottom: 6,
  },

  plan_item_row_last: {
    marginBottom: 0,
  },

  plan_item_left: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    paddingRight: 10,
  },

  plan_item_dot: {
    width: 8,
    height: 8,
    borderRadius: 999,
    marginRight: 8,
  },

  plan_item_title: {
    flex: 1,
    fontWeight: "600",
  },

  plan_item_meta: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
    overflow: "hidden",
    fontWeight: "700",
  },

  plan_scroll_handle_row: {
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 8,
  },

  plan_scroll_handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
  },

  plan_empty_text: {
    lineHeight: 18,
  },

  footer_row: {
    marginTop: 4,
  },

  footer_copy: {
    lineHeight: 18,
  },
});
