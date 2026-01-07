import { StyleSheet } from 'react-native';

export default StyleSheet.create({

  card: {
    flexDirection: "row",
    backgroundColor: "#fff",
    marginVertical: 3,
    marginHorizontal: 10,
    borderRadius: 15,
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { height: 2, width: 0 },
  },

  day: {
    flex: 1,
    borderTopLeftRadius: 15,
    borderBottomLeftRadius: 15,
    backgroundColor: '#929292ff',
    alignItems: 'center',
    fontColor: '#ca1010ff',
    justifyContent: 'center',
    borderColor: '#000000',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderLeftWidth: 1,
  },

  workouts: {
    flex: 1,
    alignItems: 'center',
    borderTopWidth: 1,
    borderBottomWidth: 1,
  },

  focus: {
    flex: 1,
    alignItems: 'center',
    borderTopRightRadius: 15,
    borderBottomRightRadius: 15,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderRightWidth: 1,
  },

  svg: {
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#000000',
  },


  container_row: {
    flex: 0.9,
    flexDirection: 'row',
  },

  touchable: {
    flex: 1,
  },


});