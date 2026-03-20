import { StyleSheet } from 'react-native';

export default StyleSheet.create({

    //Main type styling.

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
        marginBottom: 12,
    },
    pr_scroll: {
        marginBottom: 12,
    },
    pr_body: {
        paddingTop: 8,
        paddingRight: 16,
        flexGrow: 1,
    },
    pr_row: {
        flexDirection: "row",
        alignItems: "flex-start",
    },
    pr_column: {
        width: 136,
        marginRight: 10,
    },
    pr_exercise_tile: {
        width: "100%",
        minHeight: 106,
        borderRadius: 18,
        paddingHorizontal: 10,
        paddingVertical: 10,
        marginBottom: 10,
        justifyContent: "space-between",
    },
    pr_exercise_tile_name: {
        fontWeight: "700",
        textAlign: "center",
        marginBottom: 4,
    },
    pr_exercise_tile_set: {
        textAlign: "center",
        lineHeight: 16,
    },
    pr_exercise_tile_empty: {
        textAlign: "center",
        lineHeight: 16,
    },
    pr_exercise_tile_rm_label: {
        textAlign: "center",
        marginTop: 4,
    },
    pr_exercise_tile_rm_value: {
        textAlign: "center",
        fontWeight: "700",
    },
    pr_header: {
        alignItems: "flex-end",
        borderBottomWidth: 1,
        borderBottomColor: "#2e2e2eff",
        paddingBottom: 8,
        marginBottom: 4,
    },
    pr_header_value: {
        textAlign: "right",
    },
    delete_button_container: {
        minHeight: 50,
        marginBottom: 12,
        backgroundColor: "#fff",
        paddingHorizontal: 20,
        padding: 16,
    },

    //Day containers
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
    section_header: {
        flexDirection: "row",
        alignItems: "center",
    },
    section_header_icon: {
        marginLeft: "auto",
        marginRight: 8,
    },


    //BottomSheet Styling:

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
    filter_option: {
        justifyContent: "space-between",
        alignItems: "center",
    },
    filter_option_divider: {
        borderBottomWidth: 1,
        paddingBottom: 14,
        marginBottom: 4,
    },
    filter_option_unselected: {
        opacity: 0.8,
    },
    filter_option_text: {
        fontWeight: 600,
        fontSize: 16,
    },
    filter_option_text_selected: {
        fontWeight: "700",
    },
    filter_option_text_unselected: {
        fontWeight: "400",
    },

});
