import { StyleSheet } from 'react-native';

export default StyleSheet.create({
    
    container: {
        flex: 1,
    },

    header: {
        flex: 0.2,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#797979ff',
    },

    headerText: {
        fontSize: 30,
        fontWeight: "bold",
    },

    body: {
        flex: 0.9
    },

    title: {
        fontSize: 16,
        marginBottom: 10,
    },

    setRow: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 12,
        backgroundColor: "white",
        padding: 8,
        borderRadius: 8,
        elevation: 2,
    },

    setNumber: {
        width: 20,
        fontWeight: "bold",
    },

    input: {
        flex: 1,
        marginHorizontal: 4,
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 6,
        padding: 6,
        textAlign: "center",
    },

    checkbox: {
        marginRight: 8,
    },

    checkbox_container: {
        flexDirection: 'column',
        flex: 1,
        alignItems: "center",
    }

});