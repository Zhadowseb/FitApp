import { useState, useEffect } from "react";
import { View, Text, ScrollView, ActivityIndicator, TouchableOpacity } from "react-native";
import { useSQLiteContext } from "expo-sqlite";
import { useNavigation } from "@react-navigation/native";
import Checkbox from 'expo-checkbox';

import styles from "./MesocycleListStyle";
import { ThemedTitle, ThemedCard, ThemedView, ThemedText, ThemedButton } 
  from "../../../../Resources/Components";

const MesocycleList = ({ program_id, refreshKey }) => {
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
  }, [refreshKey]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <ScrollView horizontal>
      {mesocycles.map(item => (
        <TouchableOpacity
          key={item.mesocycle_id}
          onPress={() => {
            navigation.navigate("MicrocyclePage", {
              mesocycle_id: item.mesocycle_id,
              program_id: program_id,
            });
          }}
        >
          <ThemedCard
            style={{
              width: 200,
              height: 250,
              flexDirection: "row",
            }}>
            <View style={styles.status_section}>
              <View style={styles.header_status}>

                <View style={styles.checkbox_header}>
                  <ThemedText style={styles.label}>Status</ThemedText>
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
                <ThemedText>Mesocycle focus: {item.focus}</ThemedText>
              </View>

              <View style={styles.weeks}>
                <ThemedText>Weeks: {item.weeks}</ThemedText>
              </View>
            </View>
          </ThemedCard>

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
