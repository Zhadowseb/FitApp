import { StyleSheet } from 'react-native';

export default StyleSheet.create({

    //Card display.
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

    //Main containers flex
    container: {
        padding: 16,
    },
    day_container: {
        minHeight: 120,
        marginBottom: 12,
        padding: 16,
    },
    rm_container: {
        minHeight: 400,
        marginBottom: 12,
        padding: 16,
    },
    mesocycle_container: {
        minHeight: 400,
        marginBottom: 12,
    },
    pr_container: {
        minHeight: 400,
        marginBottom: 12,
        padding: 16,
    },
    delete_button_container: {
        minHeight: 50,
        marginBottom: 12,
        backgroundColor: "#fff",
        paddingHorizontal: 20,
        padding: 16,
    },

    //RM containers
    rm_body: {
        flex: 300,
    },

    rm_footer: {
        flex: 1,
    },

    //Mesocycle containers

    mesocycle_container_header:{
        backgroundColor: "#d7d7d7ff",
        alignContent: "center",
        justifyContent: "center",
    },

    //PR containers


});