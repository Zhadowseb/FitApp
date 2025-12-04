import { StyleSheet } from "react-native";

export default StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 40,
  },

  card: {
    backgroundColor: "#fff",
    padding: 16,
    marginVertical: 10,
    marginHorizontal: 16,
    borderRadius: 10,
    elevation: 3, // Android shadow
    shadowColor: "#000", // iOS shadow
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { height: 2, width: 0 },
  },

  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 4,
  },

  label: {
    fontWeight: "bold",
    fontSize: 14,
    color: "#333",
  },

  value: {
    fontSize: 14,
    color: "#555",
  },

  statusRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 12,
    alignItems: "center",
  },

  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },

  statusText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 12,
  },

  // Status colors
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
