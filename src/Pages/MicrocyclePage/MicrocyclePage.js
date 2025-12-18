import React, { useState } from "react";
import { View, Button, Text } from "react-native";
import { useSQLiteContext } from "expo-sqlite";

import styles from "./MicrocyclePageStyle";
import MicrocycleList from "./Components/MicrocycleList/MicrocycleList";

const MicrocyclePage = ( {route} ) => {
    const db = useSQLiteContext();

    const {mesocycle_id} = route.params;

    return (
        <View style={styles.container}>

            <MicrocycleList
                mesocycle_id={mesocycle_id} />

        </View>
    );
};

export default MicrocyclePage;
