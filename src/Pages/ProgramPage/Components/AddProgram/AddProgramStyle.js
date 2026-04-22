import { StyleSheet } from "react-native";

export default StyleSheet.create({
  modal: {
    width: "94%",
    maxHeight: 640,
    borderRadius: 28,
    padding: 18,
  },
  content: {
    gap: 16,
    minHeight: 0,
  },
  hero: {
    gap: 6,
  },
  eyebrow: {
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  title: {
    fontSize: 24,
    lineHeight: 29,
  },
  description: {
    fontSize: 13,
    lineHeight: 19,
  },
  fieldGroup: {
    gap: 8,
  },
  label: {
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 0.8,
    textTransform: "uppercase",
  },
  input: {
    borderRadius: 18,
  },
  weekCard: {
    minHeight: 78,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderRadius: 20,
    padding: 14,
  },
  dateContent: {
    gap: 4,
  },
  dateLabel: {
    fontSize: 11,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },
  dateValue: {
    fontSize: 17,
    fontWeight: "800",
  },
  weekRange: {
    fontSize: 12,
    fontWeight: "700",
  },
  calendarBadge: {
    width: 42,
    height: 42,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  row: {
    flexDirection: "row",
    gap: 10,
    marginTop: 2,
  },
  actionButton: {
    flex: 1,
    borderRadius: 18,
  },
  cancelButton: {
    height: 48,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: "700",
  },
  weekPickerModal: {
    width: "94%",
    maxHeight: 620,
    borderRadius: 28,
  },
  weekPickerContent: {
    gap: 14,
    minHeight: 0,
  },
  weekPickerHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  yearButton: {
    flex: 1,
    minHeight: 42,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 10,
  },
  yearButtonText: {
    fontSize: 11,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 0.6,
    textAlign: "center",
  },
  yearTitle: {
    minWidth: 62,
    textAlign: "center",
  },
  weekOptionList: {
    maxHeight: 360,
  },
  weekOption: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 8,
  },
  weekOptionTextContent: {
    gap: 3,
  },
  weekOptionTitle: {
    fontSize: 15,
    fontWeight: "800",
  },
  weekOptionRange: {
    fontSize: 12,
    fontWeight: "700",
  },
  statusDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
  },
  fullWidthButton: {
    borderRadius: 18,
  },
});
