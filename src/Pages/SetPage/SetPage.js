import { StatusBar } from 'expo-status-bar';
import { View, Text } from 'react-native';
import { useSQLiteContext } from "expo-sqlite";
import { useNavigation } from "@react-navigation/native";
import { useState, useEffect } from "react";

import styles from './SetPageStyle';


const SetPage = ( {route} ) =>  {

    const {exercise_id} = route.params;
    const db = useSQLiteContext();
    const navigation = useNavigation();

    const [exerciseInfo, setExerciseInfo] = useState([]);
    const [loading, setLoading] = useState(false);

    const loadSetInfo = async () => {
        try {
            setLoading(true);

            const row = await db.getFirstAsync(
            "SELECT exercise_name, sets FROM Exercise WHERE exercise_id = ?;",
                [exercise_id]
            );

            setExerciseInfo(row);
            console.log(row)
        } catch (error) {
            console.error("Error loading programs", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadSetInfo();
    }, []);

    return (
        <View style={styles.container}>

            <Text> Exercise: {exerciseInfo.exercise_name}, sets: {exerciseInfo.sets} </Text>

            <StatusBar style="auto" />

        </View>
    );
}

export default SetPage;
