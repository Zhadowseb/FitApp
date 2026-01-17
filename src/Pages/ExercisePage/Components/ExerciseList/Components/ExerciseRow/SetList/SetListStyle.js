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
    },
    set: {
        width: "10%",
        borderLeftColor: "#555555ff",
        borderLeftWidth: 1,
        alignContent: "center",
        alignItems: "center",
    },
    x: {
        width: "5%",
        borderLeftColor: "#555555ff",
        borderLeftWidth: 1,
        alignContent: "center",
        alignItems: "center",
    },
    reps: {
        width: "17%",
        borderLeftColor: "#555555ff",
        borderLeftWidth: 1,
        alignContent: "center",
        alignItems: "center",
    },
    weight: {
        width: "20%",
        borderLeftColor: "#555555ff",
        borderLeftWidth: 1,
        alignContent: "center",
        alignItems: "center",
    },
    rpe: {
        width: "17%",
        borderLeftColor: "#555555ff",
        borderLeftWidth: 1,
        alignContent: "center",
        alignItems: "center",
    },
    done: {
        width: "15%",
        borderLeftColor: "#555555ff",
        borderLeftWidth: 1,
    },  

    override: {
        borderLeftColor: "#ffffffff",
        borderLeftWidth: 0,
        borderBottomColor: "#d3d3d3ff",
        borderBottomWidth: 1,
    },

    text: {
        alignContent: "center",
        alignItems: "center",
        paddingBottom: 5,
        paddingTop: 8,
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

});
