import { StyleSheet } from 'react-native';

export default StyleSheet.create({

    //Card display.
    card: {
        backgroundColor: "#fff",
        padding: 16,
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
    },
    rm_container: {
        minHeight: 400,
        marginBottom: 12,
    },
    mesocycle_container: {
        minHeight: 400,
        marginBottom: 12,
    },
    pr_container: {
        minHeight: 400,
        marginBottom: 12,
    },
    delete_button_container: {
        minHeight: 50,
        marginBottom: 12,
        backgroundColor: "#fff",
        paddingHorizontal: 20,
    },

    //RM containers
    rm_body: {
        flex: 300,
    },

    rm_footer: {
        flex: 1,
    },

    //PR containers


});