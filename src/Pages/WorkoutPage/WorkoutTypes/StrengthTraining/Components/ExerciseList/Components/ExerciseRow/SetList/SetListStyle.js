// src/Components/ExerciseList/ExerciseListStyle.js
import { StyleSheet } from "react-native";

export default StyleSheet.create({

    container: {
        flexDirection: "row",
        flex: 1,
    },

    padding: {
        paddingBottom: 5,
        paddingTop: 8,
    },
    pause: {
        flex: 15,
        borderLeftWidth: 0,
    },
    set:    {flex: 10},
    x:      {flex: 5, maxWidth: 15},
    reps:   {flex: 17},
    weight: {flex: 20},
    rpe:    {flex: 17},
    done:   {flex: 15, maxWidth: 40},  

    override: {
        borderLeftWidth: 0,
        borderBottomColor: "#555555ff",
        borderBottomWidth: 1,
        justifyContent: "center",
        alignItems: "center",
    },

    titleText: {
        fontWeight: "bold",
        fontSize: 10,
    },


    editableInput: {
        borderWidth: 1,
        paddingVertical: 1,
        textAlign: "center",
        fontSize: 14,
    },

    input: {
        alignItems: "center",
        justifyContent: "center",
        marginTop: 7,
    },
    widthPause: {
        minWidth: 35,
    },
    widthReps: {
        minWidth: 35,
    },
    widthRPE: {
        minWidth: 35,
    },
    widthWeight: {
        minWidth: 45,
    },

    editable_cell: {
        borderLeftWidth: 0.2,
        justifyContent: "center",
        alignItems: "center",
        borderColor: "#4b4b4bff",
        borderBottomWidth: 0.2,
    },
    lastGrid: {
        borderBottomWidth: 0,
    },


});
