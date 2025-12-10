import { StatusBar } from 'expo-status-bar';
import { View, Text, TextInput, ScrollView } from 'react-native';
import { useSQLiteContext } from "expo-sqlite";
import { useNavigation } from "@react-navigation/native";
import { useState, useEffect, useRef } from "react";

import Checkbox from 'expo-checkbox';

import styles from './SetPageStyle';


const SetPage = ( {route} ) =>  {

    const {exercise_id} = route.params;
    const db = useSQLiteContext();
    const navigation = useNavigation();

    const [exerciseInfo, setExerciseInfo] = useState([]);
    const [inputs, setInputs] = useState([]);
    const inputsRef = useRef(inputs); 

    const loadSetInfo = async () => {
        try {

            const row = await db.getFirstAsync(
                "SELECT exercise_name, sets FROM Exercise WHERE exercise_id = ?;",
                [exercise_id]
            );

            setExerciseInfo(row);

            const count_row = await db.getFirstAsync(
                "SELECT COUNT(*) AS count FROM Sets WHERE exercise_id = ?;",
                [exercise_id]
            );

            const existingCount = count_row?.count ?? 0;

            if (existingCount > 0){

                const savedSets = await db.getAllAsync(
                    `SELECT set_number, pause, rpe, weight, reps, done, failed, note
                        FROM Sets WHERE exercise_id = ? ORDER BY set_number ASC;`,
                        [exercise_id]
                );

                console.log("");
                console.log(savedSets);

                const corrected = savedSets.map(s => ({
                    ...s,
                    done: s.done === 1,
                    failed: s.failed === 1,
                }));

                setInputs(corrected);
                //console.log(corrected);
                return;
            }
            
            const initial = Array.from({ length: row.sets }).map((_, index) => ({
                set_number: index + 1,
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
        } 
    };

    const insertSetInfo = async () => {
        try {
            for (const set of inputs){
                await db.runAsync(
                    `INSERT INTO Sets 
                        (set_number, exercise_id, pause, rpe, weight, reps, done, failed, note) 
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);`,
                        [
                            set.set_number,
                            exercise_id,
                            set.pause,
                            set.rpe,
                            set.weight,
                            set.reps,
                            set.done ? 1 : 0,
                            set.failed ? 1 : 0,
                            set.note
                        ]
                );
            }

            console.log("Alle sets er nu gemt!");

        } catch (error) {
            console.error("Error loading sets", error);
        } 
    }

    useEffect(() => {
        loadSetInfo();
    }, []);

    useEffect(() => {
        inputsRef.current = inputs;
    }, [inputs]);

    useEffect(() => {
        const unsub = navigation.addListener("beforeRemove", async () => {
         
            await insertSetInfo();
        });

        return unsub;
    }, [navigation]);


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
