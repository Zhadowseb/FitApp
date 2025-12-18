import React, { useState } from "react";
import { View, Button, Text } from "react-native";
import { useSQLiteContext } from "expo-sqlite";

import styles from "./MesocyclePageStyle";
import AddMesocycleModal from "./Components/AddMesocycle/AddMesocycle";
import MesocycleList from "./Components/MesocycleList/MesocycleList";

const MesocyclePage = ( {route} ) => {
    const db = useSQLiteContext();

    const [modalVisible, setModalVisible] = useState(false);

    const program_id = route.params;

    const handleAdd = async (data) => {
        try {
            const result = await db.runAsync(
                `INSERT INTO Mesocycle (program_id, weeks, focus) VALUES (?, ?, ?);`,
                [program_id, data.weeks, data.focus]
            );
            
            const newMesocycle_id = result.lastInsertRowId;

            for (let week = 1; week <= data.weeks; week++){
                await db.runAsync(
                    `INSERT INTO Microcycle (mesocycle_id, week_number) VALUES (?, ?);`,
                    [newMesocycle_id, week]
                );
            }

        } catch (error) {
            console.error(error);
        }


        setModalVisible(false);
    };

    return (
        <View style={styles.wrapper}>
            <MesocycleList 
                program_id = {program_id}/>

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
