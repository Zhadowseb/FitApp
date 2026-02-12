import { use, useState, useEffect } from "react";
import { View, Text, FlatList, TouchableOpacity, ScrollView, RefreshControl } from "react-native";
import { SQLiteDatabase, useSQLiteContext } from "expo-sqlite";
import { useNavigation } from "@react-navigation/native";

import styles from "./Rm_listStyle"
import EditEstimatedSet from "./Components/EditEstimatedSet/EditEstimatedSet";

import { ThemedTitle, ThemedCard, ThemedView, ThemedText } 
  from "../../../../Resources/ThemedComponents";

const rm_list = ( {program_id, refreshKey, refresh} ) => {
    const db = useSQLiteContext();
    const navigation = useNavigation();

    const [loading, setLoading] = useState(false);
    const [editEstimatedSet_visible, set_editEstimatedSet_visible] = useState(false);

    const [estimated_sets, setEstimated_sets] = useState([]);
    const [selectedSet, setSelectedSet] = useState(null);

    const loadEstimated_Sets = async () => {
        try{
            setLoading(true);
            const estimated_sets = await db.getAllAsync(
                `SELECT estimated_set_id, estimated_weight, exercise_name FROM Estimated_Set WHERE program_id = ?;`,
                [program_id]
            );
            setEstimated_sets(estimated_sets);
        } catch(error) {
            console.error("Error loading estimated sets", error);
        } finally {
            setLoading(false);
        }
    }

    const handleSubmit = async (data) => {
        try{
            await db.runAsync(
                `UPDATE Estimated_set SET estimated_weight = ? WHERE estimated_set_id = ?;`,
                [data.estimated_weight, data.id]
            );
            refresh();
        } catch (error) {
            console.error(error);
        } finally { setLoading(false); }
    }

    const handleDelete = async (data) => {
        try{
            await db.runAsync(
                `DELETE FROM Estimated_set WHERE estimated_set_id = ?;`,
                [data.id]
            );
            refresh();
        } catch (error) {
            console.error(error);
        } finally { setLoading(false); }
    }

    useEffect(() => {
         loadEstimated_Sets();
    }, [program_id, refreshKey]);

    return (
    <View>
        <ScrollView
            nestedScrollEnabled 
            style={styles.wrapper} >
        
        {/* Header */}
        {estimated_sets.length > 0 && (
            <View style={styles.headerRow}>
                <ThemedText style={[styles.exerciseHeader, styles.headerText]}>
                    Exercise
                </ThemedText>
                
                <ThemedText style={[styles.rmHeader, styles.headerText]}>
                    1 Rep Max (in kg)
                </ThemedText>
            </View>
        )}

        {/* Empty state */}
        {!loading && estimated_sets.length === 0 && (
            <ThemedText>No 1 RM have been set.</ThemedText>
        )}

        {/* List items */}
        {estimated_sets.map(item => (
            <TouchableOpacity
                key={item.estimated_set_id}
                style={styles.container}
                onPress={() => {
                    setSelectedSet(item);
                    set_editEstimatedSet_visible(true);
                }}>
                <View style={styles.item_container}>
                    <View style={styles.exercise_name}>
                        <ThemedText>{item.exercise_name}</ThemedText>
                    </View>

                    <View style={styles.estimated_weight}>
                        <ThemedText>{item.estimated_weight} kg</ThemedText>
                    </View>
                </View>
            </TouchableOpacity>
        ))}
        </ScrollView>

        <EditEstimatedSet
            visible={editEstimatedSet_visible}
            estimatedSet={selectedSet}
            onClose={() => set_editEstimatedSet_visible(false)}
            onSubmit={handleSubmit}
            onDelete={handleDelete}
            refreshKey={refreshKey}
        />
    </View>
    );

};

export default rm_list;
