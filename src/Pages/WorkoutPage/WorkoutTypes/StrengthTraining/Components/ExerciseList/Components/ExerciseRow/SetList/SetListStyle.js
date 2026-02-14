// src/Components/ExerciseList/ExerciseListStyle.js
import { StyleSheet } from "react-native";

export default StyleSheet.create({

    container: {
        flexDirection: "row",
        flex: 1,
        width: "100%",
    },

    pause: {
        width: "15%",
        borderLeftWidth: 0,
        paddingBottom: 5,
        paddingTop: 8,
    },
    set: {
        width: "10%",
        paddingBottom: 5,
        paddingTop: 8,
    },
    x: {
        width: "5%",
        paddingBottom: 5,
        paddingTop: 8,
    },
    reps: {
        width: "17%",
        paddingBottom: 5,
        paddingTop: 8,
    },
    weight: {
        width: "20%",
        paddingBottom: 5,
        paddingTop: 8,
    },
    rpe: {
        width: "17%",
        paddingBottom: 5,
        paddingTop: 8,
    },
    done: {
        width: "15%",
        paddingBottom: 5,
        paddingTop: 8,
    },  

    override: {
        borderLeftColor: "#ffffffff",
        borderLeftWidth: 0,
        borderBottomColor: "#d3d3d3ff",
        borderBottomWidth: 1,
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
