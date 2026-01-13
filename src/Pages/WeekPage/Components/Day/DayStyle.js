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
    position: "relative",
    borderWidth: 1.5,
    borderColor: "#000000ff"
  },

  day: {
    flex: 1,
    borderTopLeftRadius: 12,
    borderBottomLeftRadius: 12,
    backgroundColor: '#929292ff',
    alignItems: 'center',
    fontColor: '#ca1010ff',
    justifyContent: 'center',
    overflow: "show",
  },

  workouts: {
    flex: 0.8,
    alignItems: 'center',
    justifyContent: "center",
  },

  focus: {
    flex: 1,
    alignItems: 'center',
    justifyContent: "center",
    borderTopRightRadius: 15,
    borderBottomRightRadius: 15,
  },

  options: {
    flex: 0.2,
    alignItems: 'center',
    justifyContent: "center",
    marginRight: 5,
  },

  text: {
    zIndex: 2,
  },

  svg: {
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#000000',
  },

  slantedDivider: {
    position: 'absolute',
    left: 50,          // justér så den sidder korrekt
    top: 0,
    bottom: 0,
    zIndex: 1,
  },

  container_row: {
    flex: 0.9,
    flexDirection: 'row',
  },

  touchable: {
    flex: 1,
  },


});