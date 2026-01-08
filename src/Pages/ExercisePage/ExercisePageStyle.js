import { StyleSheet } from 'react-native';

export default StyleSheet.create({

  header: {
    flex: 1,
    flexDirection: "row",
  },

  editmode: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  label: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  info: {
    flex: 2,
  },

  container: {
    borderWidth: 1,
    borderRadius: 8,
    borderColor: "#ccc",
    marginBottom: 16,
    paddingTop: 30,
  },
  loaderContainer: {
    paddingVertical: 10,
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
});