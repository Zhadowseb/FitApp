import { StyleSheet } from "react-native";

export default StyleSheet.create({
  container: {
    flex: 1,
  },

  section_container: {
    paddingHorizontal: 10,
  },

  progression_section: {
    marginBottom: 14,
  },

  progression_summary_card: {
    borderWidth: 1,
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 10,
  },

  progression_summary_label: {
    fontWeight: "700",
    letterSpacing: 0.6,
    textTransform: "uppercase",
    marginBottom: 4,
  },

  progression_summary_value: {
    fontWeight: "700",
  },

  progression_summary_caption: {
    marginTop: 4,
    lineHeight: 18,
  },

  progression_selector_scroll: {
    marginBottom: 10,
  },

  progression_selector_list: {
    paddingRight: 8,
  },

  progression_selector_chip: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginRight: 8,
  },

  progression_selector_chip_text: {
    fontWeight: "600",
  },

  progression_detail_box: {
    borderWidth: 1,
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },

  progression_empty: {
    paddingTop: 2,
  },

  progression_detail_row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 2,
  },

  progression_detail_label: {
    paddingRight: 12,
  },

  progression_detail_value: {
    fontWeight: "600",
  },

  progression_value: {
    fontWeight: "700",
  },

  weeks_title: {
    marginBottom: 6,
  },

  card: {
    backgroundColor: "#fff",
    marginVertical: 10,
    marginHorizontal: 10,
    borderRadius: 10,
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { height: 2, width: 0 },
  },

  delete_button_container: {
    minHeight: 50,
    marginBottom: 12,
    backgroundColor: "#fff",
    paddingHorizontal: 20,
    padding: 16,
  },

  bottomsheet_title: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#2e2e2eff",
    paddingBottom: 30,
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
    fontWeight: 600,
    fontSize: 16,
  },

  focus: {
    flex: 8,
    justifyContent: "center",
    alignItems: "center",
  },

  progression_modal: {
    maxHeight: 420,
  },

  progression_modal_card: {
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 18,
    marginBottom: 12,
  },

  progression_modal_label: {
    fontWeight: "700",
    letterSpacing: 0.7,
    textTransform: "uppercase",
    marginBottom: 6,
  },

  progression_modal_value: {
    fontWeight: "700",
    marginBottom: 8,
  },

  progression_pill: {
    flexDirection: "row",
    borderRadius: 999,
    overflow: "hidden",
  },

  progression_pill_button: {
    flex: 1,
    minHeight: 52,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 12,
  },

  progression_pill_button_left: {
    borderTopLeftRadius: 999,
    borderBottomLeftRadius: 999,
  },

  progression_pill_button_right: {
    borderTopRightRadius: 999,
    borderBottomRightRadius: 999,
  },

  progression_pill_button_text: {
    fontWeight: "700",
  },
});
