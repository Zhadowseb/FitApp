import { StatusBar } from 'expo-status-bar';
import { View, Text, TextInput, ScrollView } from 'react-native';
import { useSQLiteContext } from "expo-sqlite";
import { useNavigation } from "@react-navigation/native";
import { useState, useEffect } from "react";

import Checkbox from 'expo-checkbox';

import styles from './SetPageStyle';


const SetPage = ( {route} ) =>  {

    const {exercise_id} = route.params;
    const db = useSQLiteContext();
    const navigation = useNavigation();

    const [exerciseInfo, setExerciseInfo] = useState([]);
    const [inputs, setInputs] = useState([]);
    const [loading, setLoading] = useState(false);

    const loadSetInfo = async () => {
        try {
            setLoading(true);

            const row = await db.getFirstAsync(
            "SELECT exercise_name, sets FROM Exercise WHERE exercise_id = ?;",
                [exercise_id]
            );

            setExerciseInfo(row);
            
            const initial = Array.from({ length: row.sets }).map(() => ({
                pause: "",
                rpe: "",
                weight: "",
                reps: "",
                done: false,
                failed: false,
                note: ""
            }));

            setInputs(initial);

        } catch (error) {
            console.error("Error loading sets", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadSetInfo();
    }, []);

    const updateSet = (index, key, value) => {
        const updated = [...inputs];
        updated[index][key] = value;
        setInputs(updated);
    };

    return (
        <View style={styles.container}>

            <View style={styles.header}>
                <Text style={styles.headerText}>
                    {exerciseInfo.exercise_name}
                </Text>
            </View>

            <ScrollView style={styles.body}>
                {inputs.map((set, index) => (
                    <View key={index} style={styles.setRow}>
                        <Text style={styles.setNumber}>{index + 1}</Text>

                        <TextInput
                            style={styles.input}
                            placeholder="note"
                            value={set.note}
                            onChangeText={(text) => updateSet(index, "note", text)}
                        />

                        <TextInput
                            style={styles.input}
                            placeholder="Pause"
                            keyboardType="numeric"
                            value={set.pause}
                            onChangeText={(text) => updateSet(index, "pause", text)}
                        />

                        <TextInput
                            style={styles.input}
                            placeholder="RPE"
                            keyboardType="numeric"
                            value={set.rpe}
                            onChangeText={(text) => updateSet(index, "rpe", text)}
                        />

                        <TextInput
                            style={styles.input}
                            placeholder="Reps"
                            keyboardType="numeric"
                            value={set.reps}
                            onChangeText={(text) => updateSet(index, "reps", text)}
                        />

                        <TextInput
                            style={styles.input}
                            placeholder="Weight"
                            keyboardType="numeric"
                            value={set.weight}
                            onChangeText={(text) => updateSet(index, "weight", text)}
                        />

                        <View style={styles.checkbox_container}>

                            <Text> done: </Text>

                            <Checkbox
                                value={set.done}
                                color={set.done ? "#4CAF50" : "#ccc"}
                                onValueChange={(checked) => updateSet(index, "done", checked)}
                                style={styles.checkbox}
                            />

                        </View>

                        <View style={styles.checkbox_container}>

                            <Text> fail: </Text>

                            <Checkbox
                                value={set.failed}
                                color={set.failed ? "#ff0000ff" : "#ccc"}
                                onValueChange={(checked) => updateSet(index, "failed", checked)}
                                style={styles.checkbox}
                            />

                        </View>


                    </View>
                ))}
            </ScrollView>

            <StatusBar style="auto" />
        </View>
    );
}

export default SetPage;
