// src/Components/ExerciseList/ExerciseList.js
import { use, useState } from "react";
import { View, Text, FlatList, TouchableOpacity, Button } from "react-native";
import { SQLiteDatabase, useSQLiteContext } from "expo-sqlite";
import { useEffect } from "react";
import { useNavigation } from "@react-navigation/native";

import styles from "./Rm_ListStyling"

const rm_list = ( {program_id} ) => {
  const db = useSQLiteContext();
  const navigation = useNavigation();

  const [loading, setLoading] = useState(false);
  const [estimated_sets, setEstimated_sets] = useState([]);

    const loadEstimated_Sets = async () => {
        try{
            setLoading(true);
            const estimated_sets = await db.getAllAsync(
                `SELECT * FROM Estimated_Set WHERE program_id = ?;`,
                [program_id]
            );

            setEstimated_sets(estimated_sets);
        } catch(error) {
            console.error("Error loading estimated sets", error);
        } finally {
            setLoading(false);
        }
    }

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.container}
      onPress={() => {
        navigation.navigate("HomePage")}}>

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
    </View>
  );
};

export default rm_list;
