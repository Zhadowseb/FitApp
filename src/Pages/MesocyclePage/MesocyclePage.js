import React, { useState } from "react";
import { View, Button, Text } from "react-native";
import { useSQLiteContext } from "expo-sqlite";

import styles from "./MesocyclePageStyle";
import AddMesocycleModal from "./Components/AddMesocycle/AddMesocycleModal";
import MesocycleList from "./Components/MesocycleList/MesocycleList";
import { programRepository } from "../../Database/repository";

const MesocyclePage = ( {route} ) => {
    const db = useSQLiteContext();

    const [modalVisible, setModalVisible] = useState(false);
    const [refreshKey, set_refreshKey] = useState(0);

    const program_id = route.params.program_id;
    const start_date = route.params.start_date;

    const refresh = () => {
        set_refreshKey(prev => prev + 1);
    }

    const handleAdd = async (data) => {
        try {
            await programRepository.createMesocycle(db, {
                programId: program_id,
                startDate: start_date,
                weeks: data.weeks,
                focus: data.focus,
            });

            refresh();

        } catch (error) {
            console.error(error);
        }

        setModalVisible(false);
    };

    return (
        <View style={styles.wrapper}>
            <MesocycleList 
                program_id = {program_id}
                start_date = {start_date}
                refreshKey = {refreshKey}/>

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
