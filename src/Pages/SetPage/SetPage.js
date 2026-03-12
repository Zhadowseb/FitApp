import { StatusBar } from 'expo-status-bar';
import { View, Text, TextInput, ScrollView } from 'react-native';
import { useSQLiteContext } from "expo-sqlite";
import { useNavigation } from "@react-navigation/native";
import { useState, useEffect, useRef } from "react";

import Checkbox from 'expo-checkbox';

import styles from './SetPageStyle';
import { weightliftingService as weightliftingRepository } from "../../Services";

const SetPage = ( {route} ) =>  {

    const {exercise_id, exercise_name, sets} = route.params;
    const db = useSQLiteContext();
    const navigation = useNavigation();

    const [inputs, setInputs] = useState([]);
    const [allDone, setAllDone] = useState(false);
    const inputsRef = useRef(inputs); 

    const loadSetInfo = async () => {
        try {
            const rows = await weightliftingRepository.getExerciseSets(db, exercise_id);

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
        
        const count_row = await weightliftingRepository.getExerciseSetCount(db, exercise_id);

        const existingCount = count_row?.count ?? 0;

        if (existingCount > 0){
            return true;
        } else{
            return false;
        }
    }

    const insertSetInfo = async (data) => {
        try {
            await weightliftingRepository.saveExerciseSets(db, {
                exerciseId: exercise_id,
                sets: data,
            });
            
        } catch (error) {
            console.error("Error saving sets", error);
        }
    };

    useEffect(() => {
        const load = async () => {
            const exists = await checkInitialized();

            if(!exists){
                await weightliftingRepository.initializeExerciseSets(db, {
                    exerciseId: exercise_id,
                    count: sets,
                });
            }

            await loadSetInfo();
        }

        load();
    }, []);

    useEffect(() => {
        inputsRef.current = inputs;

        const everythingDone = inputs.length > 0 && inputs.every(s => s.done === true);
        setAllDone(everythingDone);

    }, [inputs]);

    useEffect(() => {
        const updateExerciseDone = async () => {
            try {
                await weightliftingRepository.updateExerciseDone(db, {
                    exerciseId: exercise_id,
                    done: allDone,
                });
            } catch (error) {
                console.error("Failed to update Exercise.done", error);
            }
        };

        updateExerciseDone();

    }, [allDone]);

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
                <Text style={[styles.headerText, allDone && { color: "green" }]}>
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
