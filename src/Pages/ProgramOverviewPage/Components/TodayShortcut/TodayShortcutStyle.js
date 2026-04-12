import { StyleSheet } from "react-native";

export default StyleSheet.create({
  shortcut_card: {
    minHeight: 220,
    padding: 0,
    overflow: "hidden",
    borderWidth: 1,
    borderRadius: 26,
    marginBottom: 12,
  },

  card_accent: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 4,
  },

  shortcut_card_complete: {
    minHeight: 0,
  },

  shortcut_card_empty: {
    minHeight: 0,
  },

  touchable: {
    paddingHorizontal: 18,
    paddingTop: 20,
    paddingBottom: 16,
  },

  touchable_multi: {
    paddingTop: 20,
  },

  touchable_complete: {
    paddingTop: 20,
    paddingBottom: 16,
  },

  touchable_empty: {
    paddingTop: 20,
    paddingBottom: 16,
  },

  card_header: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 12,
    marginBottom: 2,
  },

  card_header_copy: {
    flex: 1,
  },

  card_eyebrow: {
    fontWeight: "800",
    fontSize: 10,
    letterSpacing: 1,
    textTransform: "uppercase",
    marginBottom: 4,
  },

  card_title: {
    lineHeight: 28,
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
    marginTop: 14,
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

  hero_title_empty: {
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

  plan_complete_banner: {
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },

  plan_complete_banner_title: {
    width: "100%",
    padding: 0,
    marginBottom: 0,
    textAlign: "center",
  },

  plan_header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },

  plan_header_centered: {
    justifyContent: "center",
  },

  plan_section_label: {
    fontWeight: "700",
    letterSpacing: 1.2,
    flex: 1,
    paddingRight: 10,
  },

  plan_section_label_centered: {
    flex: 0,
    paddingRight: 0,
    textAlign: "center",
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

  plan_card_compact: {
    paddingVertical: 12,
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

  plan_card_header_compact: {
    marginBottom: 0,
  },

  plan_card_title: {
    fontWeight: "700",
    flexShrink: 1,
  },

  plan_card_title_row: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    paddingRight: 10,
  },

  plan_card_title_icon_wrap: {
    width: 26,
    height: 26,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
    flexShrink: 0,
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
