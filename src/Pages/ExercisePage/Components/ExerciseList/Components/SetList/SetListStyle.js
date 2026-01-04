// src/Components/ExerciseList/ExerciseListStyle.js
import { StyleSheet } from "react-native";

export default StyleSheet.create({

    container: {
        flexDirection: "row",
        flex: 1,
        width: "100%",
    },

    pause: {
        width: "20%",
    },
    set: {
        width: "10%",
        borderLeftColor: "#d3d3d3ff",
        borderLeftWidth: 1,
    },
    x: {
        width: "5%",
        borderLeftColor: "#d3d3d3ff",
        borderLeftWidth: 1,
    },
    reps: {
        width: "15%",
        borderLeftColor: "#d3d3d3ff",
        borderLeftWidth: 1,
    },
    weight: {
        width: "20%",
        borderLeftColor: "#d3d3d3ff",
        borderLeftWidth: 1,
    },
    rpe: {
        width: "15%",
        borderLeftColor: "#d3d3d3ff",
        borderLeftWidth: 1,
    },
    done: {
        width: "15%",
        borderLeftColor: "#d3d3d3ff",
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
        fontWeight: "bold",
        paddingBottom: 5,
        paddingTop: 8,
    },

    editableInput: {
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 4,
        paddingHorizontal: 6,
        paddingVertical: 2,
        backgroundColor: "#f9f9f9",
        minWidth: 40,
        textAlign: "center",
    },


});
