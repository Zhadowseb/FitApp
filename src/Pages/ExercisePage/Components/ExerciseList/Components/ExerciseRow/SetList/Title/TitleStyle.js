// src/Components/ExerciseList/ExerciseListStyle.js
import { StyleSheet } from "react-native";

export default StyleSheet.create({

    container: {
        flexDirection: "row",
        flex: 1,
        width: "100%",
        marginTop: 20,
    },

    pause:  {width: "15%"},
    set:    {width: "10%"},
    x:      {width: "5%"},
    reps:   {width: "17%"},
    weight: {width: "20%"},
    rpe:    {width: "17%"},
    done:   {width: "15%"},  

    override: {
        borderLeftWidth: 0,
        borderBottomColor: "#555555ff",
        borderBottomWidth: 1,
        justifyContent: "center",
        alignItems: "center",
    },

    text: {
        fontWeight: "bold",
        fontSize: 10,
    },


});
