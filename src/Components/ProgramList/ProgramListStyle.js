import { StyleSheet } from "react-native";

export default StyleSheet.create({


    status_section:{
        alignItems: "center",
        flex: 0.2,
    },

    body: {
        flexDirection: "column",
        alignItems: "center",
        flex: 0.8,
    },

    dates_section:{
        flexDirection: "row",
    },

    start_date:{
        flex: 0.5,
        alignItems: "center",
    },

    end_date:{
        flex: 0.5,
        alignItems: "center",
    },

    program_name:{
        alignItems: "center",
    },

    value:{
        fontSize: 16,
        fontWeight: "bold",
    },

  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 40,
  },

  header: {
    flexDirection: "row",
  },

  card: {
    flexDirection: "row",
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
