// src/Components/ExerciseList/ExerciseListStyle.js
import { StyleSheet } from "react-native";

export default StyleSheet.create({

    container: {
        flexDirection: "row",
        flex: 1,
    },

    padding: {
        paddingBottom: 5,
        paddingTop: 5,
    },
    note: {
        flex: 2,
        minWidth: 28,
    },
    pause: {
        flex: 15,
    },
    set:    {
        flex: 10,            
        paddingTop: 0,
        paddingBottom: 0
    },
    reps:   {flex: 20},
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

    bottomsheet_title: {
        borderBottomWidth: 1,
        borderBottomColor: "#2e2e2eff",
        paddingBottom: 20,
    },
    bottomsheet_body: {
        justifyContent: "center",
        padding: 20,
        paddingLeft: 0,
    },
    option: {
        flexDirection: "row",
        paddingTop: 20,
    },
    option_text: {
        paddingLeft: 10,
        fontWeight: 600,
        fontSize: 16,
    },
    note_button: {
        justifyContent: "center",
        alignItems: "center",
    },
    note_input: {
        minHeight: 100,
        textAlignVertical: "top",
    },
    note_section: {
        paddingBottom: 12,
    },


});
