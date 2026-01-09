import { useState, useEffect } from "react";
import { View, Text, ScrollView, ActivityIndicator, TouchableOpacity } from "react-native";
import { useSQLiteContext } from "expo-sqlite";
import { useNavigation } from "@react-navigation/native";
import Checkbox from 'expo-checkbox';

import styles from "./MesocycleListStyle";

const MesocycleList = ({ program_id }) => {
  const [mesocycles, setMesocycles] = useState([]);
  const [loading, setLoading] = useState(false);

  const db = useSQLiteContext();
  const navigation = useNavigation();

  const loadMesocycles = async () => {
    try {
      setLoading(true);
      const cycles = await db.getAllAsync(
        "SELECT mesocycle_id, weeks, focus, done FROM Mesocycle WHERE program_id = ?;",
        [program_id]
      );
      setMesocycles(cycles);
    } catch (error) {
      console.error("Error loading programs", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMesocycles();
  }, [program_id]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <ScrollView>
      {mesocycles.map(item => (
        <TouchableOpacity
          key={item.mesocycle_id}
          style={styles.card}
          onPress={() => {
            navigation.navigate("MicrocyclePage", {
              mesocycle_id: item.mesocycle_id,
              program_id: program_id,
            });
          }}
        >
          <View style={styles.status_section}>
            <View style={styles.header_status}>

              <View style={styles.checkbox_header}>
                <Text style={styles.label}>Status</Text>
              </View>

              <View style={styles.checkbox_container}>
                <Checkbox
                  value={item.done === 1}
                  color={item.done ? "#4CAF50" : "#ccc"}
                />
              </View>
            
            </View>
          </View>

          <View style={styles.body}>
            <View style={styles.focus}>
              <Text>Mesocycle focus: {item.focus}</Text>
            </View>

            <View style={styles.weeks}>
              <Text>Weeks: {item.weeks}</Text>
            </View>
          </View>
        </TouchableOpacity>
      ))}

      {mesocycles.length === 0 && (
        <Text style={{ textAlign: "center", marginTop: 20 }}>
          No mesocycles found.
        </Text>
      )}
    </ScrollView>
  );
};


export default MesocycleList;
