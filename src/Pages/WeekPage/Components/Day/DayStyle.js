import { StyleSheet } from 'react-native';

export default StyleSheet.create({

  day: {
    flex: 1,
    borderTopLeftRadius: 12,
    borderBottomLeftRadius: 12,
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

  bottomsheet_title: {
    borderBottomWidth: 1,
    borderBottomColor: "#2e2e2eff",
    paddingBottom: 30,
  },
  bottomsheet_body: {
    justifyContent: "center",
    padding: 20,
    paddingLeft: 0,
  },

  option_text: {
    paddingLeft: 10,
    fontWeight: 600,
    fontSize: 16,
  },

  option: {
    flexDirection: "row",
    paddingTop: 20,
  },


});