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
    }
});