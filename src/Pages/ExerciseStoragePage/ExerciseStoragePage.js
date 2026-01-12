import { StatusBar } from 'expo-status-bar';
import { View, Button } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useState, useEffect } from "react";
import { useFocusEffect } from "@react-navigation/native";
import { useCallback } from "react";
import { useSQLiteContext } from "expo-sqlite";

import styles from './ExerciseStoragePageStyle';
import ExerciseStorageList from './Components/ExerciseStorageList/ExerciseStorageList';
import AddExerciseStorageModal from "./Components/AddExerciseStorage/AddExerciseStorageModal"

const ExerciseStoragePage = ( ) => {

    const db = useSQLiteContext();

    const [refreshKey, set_refreshKey] = useState(0);
    const [addExerciseStorage_visible, 
        set_AddExerciseStorage_visible] = useState(false);

    const refresh = () => {
        set_refreshKey(prev => prev + 1);
    }

    useFocusEffect(
        useCallback(() => {
            refresh();
        }, [])
    );

    const handleAdd = async (data) => {
        try {
            await db.runAsync(
                `INSERT INTO Exercise_storage (exercise_name) VALUES (?);`,
                [data.exercise_name]
            );
            refresh();
            set_AddExerciseStorage_visible(false);
        } catch (error) {
            console.error(error);
        }
    };

    

    return (

        <View style={styles.container}>
            <ExerciseStorageList
                refreshKey={refreshKey} />

            <Button 
                title="Add exercise" 
                onPress={() => set_AddExerciseStorage_visible(true)}/>

            <AddExerciseStorageModal 
                visible={addExerciseStorage_visible}
                onClose={() => set_AddExerciseStorage_visible(false)}
                onSubmit={handleAdd}/>


        </View>
    );
};

export default ExerciseStoragePage;
