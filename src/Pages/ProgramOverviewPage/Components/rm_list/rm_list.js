import { use, useState } from "react";
import { View, Text, FlatList, TouchableOpacity } from "react-native";
import { SQLiteDatabase, useSQLiteContext } from "expo-sqlite";
import { useNavigation } from "@react-navigation/native";

import styles from "./Rm_ListStyling"
import EditEstimatedSet from "./Components/EditEstimatedSet/EditEstimatedSet";

const rm_list = ( {program_id} ) => {
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

        } catch (error) {
            console.error(error);
        } finally { setLoading(false); }
    }

  const renderItem = ({ item }) => (
    <TouchableOpacity
        style={styles.container}
        onPress={() => {
            setSelectedSet(item);
            set_editEstimatedSet_visible(true);
        }}>

        <View style={styles.item_container}>
            <View style={styles.exercise_name}>
                <Text> {item.exercise_name} </Text>
            </View>

            <View style={styles.estimated_weight}>
                <Text> {item.estimated_weight} </Text>
            </View>
        </View>

    </TouchableOpacity>
  );

  return (
    <View>
        <FlatList
            style={styles.wrapper}
            data={estimated_sets}
            refreshing={loading}
            onRefresh={loadEstimated_Sets}

            ListHeaderComponent={
                estimated_sets.length > 0 ? (
                <View style={styles.headerRow}>
                    <Text style={[styles.exerciseHeader, styles.headerText]}>Exercise</Text>
                    <Text style={[styles.rmHeader, styles.headerText]}> 1 RM</Text>
                </View>
                ) : null
            }
            ListEmptyComponent={
                !loading ? <Text> No 1 RM have been set. </Text> : null
            }
            renderItem={renderItem}
        />

        <EditEstimatedSet
                visible = {editEstimatedSet_visible}
                estimatedSet = {selectedSet}
                onClose = {() => set_editEstimatedSet_visible(false)} 
                onSubmit = {handleSubmit}
                onDelete = {handleDelete} /> 
    </View>
  );
};

export default rm_list;
