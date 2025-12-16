import React, { useState } from "react";
import { View, Button, Text } from "react-native";
import { useSQLiteContext } from "expo-sqlite";

import styles from "./MesocyclePageStyle";
import AddMesocycleModal from "./Components/AddMesocycle/AddMesocycle";

const MesocyclePage = ( {route} ) => {
    const db = useSQLiteContext();

    const [modalVisible, setModalVisible] = useState(false);

    const program_id = route.params;

    const handleAdd = async (data) => {
        try {
            await db.runAsync(
                `INSERT INTO Mesocycle (program_id, weeks, focus) VALUES (?, ?, ?);`,
                [program_id, data.weeks, data.focus]
            );

        } catch (error) {
            console.error(error);
        }

        setModalVisible(false);
    };

    return (
        <View style={styles.wrapper}>

        <Button title="Add Mesocycle" onPress={() => setModalVisible(true)} />

        <AddMesocycleModal
            visible={modalVisible}
            onClose={() => setModalVisible(false)}
            onSubmit={handleAdd}
        />

        </View>
    );
};

export default MesocyclePage;
