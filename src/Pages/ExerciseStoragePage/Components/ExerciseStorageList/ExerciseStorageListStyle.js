import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  container: {
    flex: 1,
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

  header: {
    marginVertical: 20,
    paddingBottom: 20,
    justifyContent: "center",
    alignItems: "center",
    borderBottomWidth: 1,
  },

  body: {
    
  },

});