import { StatusBar } from 'expo-status-bar';
import { View, Text, TextInput, ScrollView } from 'react-native';
import { useSQLiteContext } from "expo-sqlite";
import { useNavigation } from "@react-navigation/native";
import { useState, useEffect, useRef } from "react";

import Checkbox from 'expo-checkbox';

import styles from './SetPageStyle';

const SetPage = ( {route} ) =>  {

    const test = 5;
    const {exercise_id, exercise_name, sets} = route.params;
    const db = useSQLiteContext();
    const navigation = useNavigation();

    const [inputs, setInputs] = useState([]);
    const inputsRef = useRef(inputs); 

    const loadSetInfo = async () => {
        try {
            const rows = await db.getAllAsync(
                `SELECT set_number, pause, rpe, weight, reps, done, failed, note FROM Sets 
                    WHERE exercise_id=?;`,
                    [exercise_id]
            );

            const formatted = rows.map(r => ({
                ...r,
                pause: r.pause ?? "",
                rpe: r.rpe ?? "",
                weight: r.weight ?? "",
                reps: r.reps ?? "",
                note: r.note ?? "",
                done: r.done === 1,
                failed: r.failed === 1,
            }));

            setInputs(formatted);

        } catch (error) {
            console.error("Error loading sets", error);
        } 
    };

    const checkInitialized = async () => {
        
        const count_row = await db.getFirstAsync(
            "SELECT COUNT(*) AS count FROM Sets WHERE exercise_id = ?;",
            [exercise_id]
        );

        const existingCount = count_row?.count ?? 0;

        if (existingCount > 0){
            return true;
        } else{
            return false;
        }
    }

    const insertSetInfo = async (data) => {
        try {
            for (const set of data) {

                await db.runAsync(
                    `UPDATE Sets 
                        SET pause=?, rpe=?, weight=?, reps=?, done=?, failed=?, note=?
                        WHERE exercise_id=? AND set_number=?;`,
                    [
                        set.pause,
                        set.rpe,
                        set.weight,
                        set.reps,
                        set.done ? 1 : 0,
                        set.failed ? 1 : 0,
                        set.note,
                        exercise_id,
                        set.set_number
                    ]
                );
            }

            console.log("Sets opdateret!");
            
        } catch (error) {
            console.error("Error saving sets", error);
        }
    };

    useEffect(() => {
        const load = async () => {
            const exists = await checkInitialized();

            if(!exists){

                console.log("does not exist");

                for (let i = 1; i <= sets; i++) {
                    await db.runAsync(
                        `INSERT INTO Sets (set_number, exercise_id) VALUES (?, ?);`,
                        [i, exercise_id]
                    );
                }
            }

            await loadSetInfo();
        }

        load();
    }, []);

    useEffect(() => {
        inputsRef.current = inputs;
        console.log("input update: ");
        console.log(inputs);
        console.log(" ");
    }, [inputs]);

    useEffect(() => {
        const unsub = navigation.addListener("beforeRemove", async () => {

            await insertSetInfo(inputsRef.current);
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
                    {exercise_name}
                </Text>
            </View>

            <ScrollView style={styles.body}>
                {inputs.map((set, index) => (
                    <View key={index} style={styles.setRow}>
                        <Text style={styles.setNumber}>{index + 1}</Text>

                        <TextInput
                            style={styles.input}
                            placeholder="note"
                            value={String(set.note)}
                            onChangeText={(text) => updateSet(index, "note", text)}
                        />

                        <TextInput
                            style={styles.input}
                            placeholder="Pause"
                            keyboardType="numeric"
                            value={String(set.pause)}
                            onChangeText={(text) => updateSet(index, "pause", text)}
                        />

                        <TextInput
                            style={styles.input}
                            placeholder="RPE"
                            keyboardType="numeric"
                            value={String(set.rpe)}
                            onChangeText={(text) => updateSet(index, "rpe", text)}
                        />

                        <TextInput
                            style={styles.input}
                            placeholder="Reps"
                            keyboardType="numeric"
                            value={String(set.reps)}
                            onChangeText={(text) => updateSet(index, "reps", text)}
                        />

                        <TextInput
                            style={styles.input}
                            placeholder="Weight"
                            keyboardType="numeric"
                            value={String(set.weight)}
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
