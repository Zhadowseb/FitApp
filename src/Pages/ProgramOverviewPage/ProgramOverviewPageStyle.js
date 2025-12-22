import { StyleSheet } from 'react-native';

export default StyleSheet.create({

    //Card display.
    card: {
        backgroundColor: "#fff",
        padding: 16,
        marginVertical: 10,
        marginHorizontal: 16,
        borderRadius: 10,
        elevation: 3,
        shadowColor: "#000",
        shadowOpacity: 0.1,
        shadowRadius: 4,
        shadowOffset: { height: 2, width: 0 },
    },

    //Main containers flex
    container: {
        flex: 1,
    },
    day_container: {
        flex: 0.4,
    },
    rm_container: {
        flex: 1,
    },
    delete_button_container: {
        flex: 0.2,
        backgroundColor: "#fff",
        paddingHorizontal: 20,
    },

    //RM containers
    rm_body: {
        flex: 90,
    },

    rm_footer: {
        flex: 15,
    },

    //PR containers
    pr_container: {
        flex: 1,
    },


});