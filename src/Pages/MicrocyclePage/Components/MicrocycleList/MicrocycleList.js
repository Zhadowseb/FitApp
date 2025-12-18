import { useState, useEffect } from "react";
import { View, Text, FlatList, ActivityIndicator, TouchableOpacity } from "react-native";
import { useSQLiteContext } from "expo-sqlite";
import { useNavigation } from "@react-navigation/native";
import Checkbox from "expo-checkbox";

import styles from "./MicrocycleListStyle";


const MicrocycleList = ( {mesocycle_id} ) => {
  const db = useSQLiteContext();
  const navigation = useNavigation();

  const [microcycles, setMicrocycles] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadMicrocycles = async () => {
    try {
      setLoading(true);

      const cycles = await db.getAllAsync(
        "SELECT microcycle_id, microcycle_number, program_id, focus, done FROM Microcycle WHERE mesocycle_id = ?;",
        [mesocycle_id]
      );

      setMicrocycles(cycles);

    } catch (error) {
      console.error("Error loading programs", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMicrocycles();
  }, []);

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => {
        navigation.navigate("WeekPage", {
            microcycle_id: item.microcycle_id,
            program_id: item.program_id})
      }}>

        <View style={styles.status_section}>
            <View style={styles.header_status}>
                <Text style={styles.label}>Week</Text>
                <Text> {item.microcycle_number} </Text>
            </View>
        </View>

        <View style={styles.body}>
            <Text>
                focus: {item.focus}
            </Text>
        </View>

        <View style={styles.done}>
            <Checkbox
              value={item.done === 1}
              disabled={true}
              color={item.done === 1 ? "#4CAF50" : "#ccc"}
              style={{ marginRight: 8 }} />
        </View>

    </TouchableOpacity>
  );

  return (
    <FlatList
      data={microcycles}
      renderItem={renderItem}
    />
  );
};

export default MicrocycleList;