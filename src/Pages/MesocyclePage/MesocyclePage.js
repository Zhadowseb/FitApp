import React, { useState } from "react";
import { View, Button, Text } from "react-native";

import styles from "./MesocyclePageStyle";
import AddMesocycleStyle from "./Components/AddMesocycle/AddMesocycleStyle";
import AddMesocycleModal from "./Components/AddMesocycle/AddMesocycle";

const MesocyclePage = () => {
    const [modalVisible, setModalVisible] = useState(false);

    const handleAdd = (data) => {
        console.log("New mesocycle:", data);

        // TODO: Insert into database
        // await db.runAsync(...)

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
