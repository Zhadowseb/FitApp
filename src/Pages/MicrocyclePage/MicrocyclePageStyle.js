import { StyleSheet } from "react-native";

export default StyleSheet.create({

    container:{
        flex: 1,
    },

    section_container: {
        paddingHorizontal: 10,
    },

    progression_card: {
        marginTop: 0,
        marginBottom: 14,
        paddingHorizontal: 16,
        paddingVertical: 14,
    },

    progression_summary: {
        fontWeight: "600",
    },

    weeks_title: {
        marginBottom: 6,
    },

    card: {
        backgroundColor: "#fff",
        marginVertical: 10,
        marginHorizontal: 10,
        borderRadius: 10,
        elevation: 3,
        shadowColor: "#000",
        shadowOpacity: 0.1,
        shadowRadius: 4,
        shadowOffset: { height: 2, width: 0 },
    },

    delete_button_container: {
        minHeight: 50,
        marginBottom: 12,
        backgroundColor: "#fff",
        paddingHorizontal: 20,
        padding: 16,
    },

    bottomsheet_title: {
        flexDirection: "row",
        borderBottomWidth: 1,
        borderBottomColor: "#2e2e2eff",
        paddingBottom: 30,
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
    focus: {
        flex: 8,
        justifyContent: "center",
        alignItems: "center",
    },
});
