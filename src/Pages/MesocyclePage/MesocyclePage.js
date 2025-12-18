import React, { useState } from "react";
import { View, Button, Text } from "react-native";
import { useSQLiteContext } from "expo-sqlite";

import styles from "./MesocyclePageStyle";
import AddMesocycleModal from "./Components/AddMesocycle/AddMesocycle";
import MesocycleList from "./Components/MesocycleList/MesocycleList";

const MesocyclePage = ( {route} ) => {
    const db = useSQLiteContext();

    const [modalVisible, setModalVisible] = useState(false);

    const program_id = route.params.program_id;

    const handleAdd = async (data) => {
        try {

            const row = await db.getFirstAsync(
                `SELECT COUNT(*) AS count FROM Mesocycle WHERE program_id = ?;`,
                [program_id]
            );
            const mesocycleCount = row?.count ?? 0;

            console.log(mesocycleCount + 1);

            const result = await db.runAsync(
                `INSERT INTO Mesocycle (program_id, mesocycle_number, weeks, focus) VALUES (?, ?, ?, ?);`,
                [program_id, (mesocycleCount + 1), data.weeks, data.focus]
            );
            
            const newMesocycle_id = result.lastInsertRowId;

            for (let week = 1; week <= data.weeks; week++){
                await db.runAsync(
                    `INSERT INTO Microcycle (mesocycle_id, program_id, microcycle_number) VALUES (?, ?, ?);`,
                    [newMesocycle_id, program_id, week]
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
