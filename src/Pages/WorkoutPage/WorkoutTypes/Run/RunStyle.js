import { StyleSheet } from 'react-native';

export default StyleSheet.create({

    grid:{
        width: "100%",
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
    },
    sharedGrid: {
        borderColor: "#4b4b4bff",
        borderBottomWidth: 0.2,
    },
    lastGrid: {
        borderBottomWidth: 0,
    },
    title: {
        borderRightWidth: 0,
        alignItems: "center",
        justifyContent: "center",
    },

    
    set: {
        width: "20%",
        borderRightWidth: 0.2,
    },

    distance: {
        width: "20%",
        borderRightWidth: 0.2,
        justifyContent: "center",
        alignItems: "center",
    },
    
    pace: {
        width: "20%",
        borderRightWidth: 0.2,
        justifyContent: "center",
        alignItems: "center",
    },
    
    time: { 
        width: "20%",
        borderRightWidth: 0.2,
        justifyContent: "center",
        alignItems: "center",
    },

    zone: {
        width: "20%",
        justifyContent: "center",
        alignItems: "center",
    },

    bottomsheet_title: {
        flexDirection: "row",
        borderBottomWidth: 1,
        borderBottomColor: "#2e2e2eff",
        paddingBottom: 30,
    },
    togglepauseorworking: {
        borderWidth: 2,
        borderRadius: 15,
        padding: 5,
        justifyContent: "center",
        alignItems: "center",
        width: 120,
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
});