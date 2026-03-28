import { StyleSheet } from "react-native";

export default StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  pageHeaderTitleGroup: {
    alignItems: "center",
    justifyContent: "center",
  },
  pageHeaderTitleEyebrow: {
    fontWeight: "800",
    letterSpacing: 1,
    textTransform: "uppercase",
    marginBottom: 2,
  },
  pageHeaderTitleMain: {
    textAlign: "center",
    lineHeight: 26,
  },
  profileCard: {
    marginHorizontal: 0,
    marginVertical: 0,
    paddingHorizontal: 18,
    paddingVertical: 18,
    borderWidth: 1,
    borderRadius: 24,
  },
  cardEyebrow: {
    fontWeight: "800",
    letterSpacing: 0.8,
    textTransform: "uppercase",
    marginBottom: 8,
  },
  cardTitle: {
    marginBottom: 8,
  },
  accountValue: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 8,
  },
  cardBody: {
    lineHeight: 20,
  },
  actions: {
    marginTop: 24,
  },
  logoutButton: {
    marginTop: 0,
  },
  errorText: {
    marginTop: 12,
    textAlign: "center",
  },
});
