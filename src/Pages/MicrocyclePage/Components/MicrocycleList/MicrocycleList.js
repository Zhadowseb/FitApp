import { useState, useEffect } from "react";
import { View, Text, FlatList, ActivityIndicator, TouchableOpacity } from "react-native";
import { useSQLiteContext } from "expo-sqlite";
import { useNavigation } from "@react-navigation/native";
import Checkbox from "expo-checkbox";

import styles from "./MicrocycleListStyle";

import { ThemedCard, ThemedText } from "../../../../Resources/Components";

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
      onPress={() => {
        navigation.navigate("WeekPage", {
            microcycle_id: item.microcycle_id,
            microcycle_number: item.microcycle_number,
            program_id: item.program_id})
      }}>
        <ThemedCard style={{flexDirection: "row"}}>
          <View style={styles.status_section}>
              <View style={styles.header_status}>
                  <ThemedText style={styles.label}>Week</ThemedText>
                  <ThemedText> {item.microcycle_number} </ThemedText>
              </View>
          </View>

          <View style={styles.body}>
              <ThemedText>
                  focus: {item.focus}
              </ThemedText>
          </View>

          <View style={styles.done}>

              <ThemedText>
                  Status
              </ThemedText>
              <Checkbox
                value={item.done === 1}
                color={item.done ? "#4CAF50" : "#ccc"} />
          </View>
        </ThemedCard>

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