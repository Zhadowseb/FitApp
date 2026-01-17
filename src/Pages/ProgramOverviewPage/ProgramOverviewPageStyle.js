import { StyleSheet } from 'react-native';

export default StyleSheet.create({

    //Main type styling.
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

    container_header:{
        borderTopLeftRadius: 10,
        borderTopRightRadius: 10,
        minHeight: 50,
        padding: 16,
        backgroundColor: "#d7d7d7ff",
        borderColor: "#000000ff",
        borderWidth: 1,
        borderBottomWidth: 1,
        justifyContent: "center",
        alignItems: "center",
    },

    //Main containers flex
    container: {
        padding: 16,
        paddingBottom: 100,
    },
    day_container: {
        padding: 0,
        minHeight: 120,
        marginBottom: 12,
    },
    rm_container: {
        padding: 0,
        minHeight: 400,
        marginBottom: 12,
    },
    mesocycle_container: {
        padding: 0,
        minHeight: 50,
        marginBottom: 12,
    },
    pr_container: {
        padding: 0,
        minHeight: 400,
        marginBottom: 12,
    },
    delete_button_container: {
        minHeight: 50,
        marginBottom: 12,
        backgroundColor: "#fff",
        paddingHorizontal: 20,
        padding: 16,
    },

    //Day containers
    day_body: {
        flex: 1,
        padding: 16,
    },
    day_touchable: {
        borderColor: "#000000ff",
        borderWidth: 1,
    },

    //RM containers
    rm_body: {
        flex: 300,
    },

    rm_footer: {
        padding: 16,
        alignItems: 'center',
        flex: 1,
    },

    //Mesocycle containers


    //PR containers


});