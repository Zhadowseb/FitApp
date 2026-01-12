import { StatusBar } from 'expo-status-bar';
import { View, Button } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useState, useEffect } from "react";
import { useFocusEffect } from "@react-navigation/native";
import { useCallback } from "react";

import styles from './ExerciseStoragePageStyle';
import ExerciseStorageList from './Components/ExerciseStorageList/ExerciseStorageList';

const ExerciseStoragePage = ( ) => {

    const [refreshKey, set_refreshKey] = useState(0);

    const refresh = () => {
        set_refreshKey(prev => prev + 1);
    }

    useFocusEffect(
        useCallback(() => {
            refresh();
        }, [])
    );

    

    return (

        <View style={styles.container}>
            <ExerciseStorageList
                refreshKey={refreshKey} />

        </View>
    );
};

export default ExerciseStoragePage;
