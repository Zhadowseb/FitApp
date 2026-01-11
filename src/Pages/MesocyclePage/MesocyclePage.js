import React, { useState } from "react";
import { View, Button, Text } from "react-native";
import { useSQLiteContext } from "expo-sqlite";

import styles from "./MesocyclePageStyle";
import AddMesocycleModal from "./Components/AddMesocycle/AddMesocycleModal";
import MesocycleList from "./Components/MesocycleList/MesocycleList";
import { parseCustomDate, formatDate } from "../../Utils/dateUtils";

const MesocyclePage = ( {route} ) => {
    const db = useSQLiteContext();

    const [modalVisible, setModalVisible] = useState(false);
    const [refreshKey, set_refreshKey] = useState(0);

    const program_id = route.params.program_id;
    const start_date = route.params.start_date;

    const refresh = () => {
        set_refreshKey(prev => prev + 1);
    }

    const weekDays = [
        'Monday', 
        'Tuesday', 
        'Wednesday', 
        'Thursday', 
        'Friday', 
        'Saturday', 
        'Sunday'];

    const handleAdd = async (data) => {
        try {

            //Checking what mesocycle number this is
            const row = await db.getFirstAsync(
                `SELECT COUNT(*) AS count FROM Mesocycle WHERE program_id = ?;`,
                [program_id]
            );
            const mesocycleCount = row?.count ?? 0;

            //Insert new mesocycle
            const result = await db.runAsync(
                `INSERT INTO Mesocycle (program_id, mesocycle_number, weeks, focus) VALUES (?, ?, ?, ?);`,
                [program_id, (mesocycleCount + 1), data.weeks, data.focus]
            );

            const weeksBefore = await db.getAllAsync(
                `SELECT COUNT(*) AS count FROM Microcycle WHERE program_id = ?;`,
                [program_id]
            )
            const weekCount = weeksBefore?.count ?? null;

            //Add in weeks to database
            const newMesocycle_id = result.lastInsertRowId;
            for (let week = 1; week <= data.weeks; week++){
                const microcycle_result = await db.runAsync(
                    `INSERT INTO Microcycle (mesocycle_id, program_id, microcycle_number) VALUES (?, ?, ?);`,
                    [newMesocycle_id, program_id, week]
                );
                
                const microcycle_id = microcycle_result.lastInsertRowId;
                for(let day = 1; day <= 7; day++){


                    const current_day = (weekCount * 7) + (week * 7 - 7) + (day - 1)

                    const date = parseCustomDate(start_date);
                    date.setDate(date.getDate() + current_day);

                    await db.runAsync(
                        `INSERT INTO Day (microcycle_id, program_id, Weekday, date) VALUES (?,?,?,?);`,
                        [microcycle_id, program_id, weekDays[day-1], formatDate(date)]
                    )
                }
            }

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
