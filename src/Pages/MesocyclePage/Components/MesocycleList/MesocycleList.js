import { useState, useEffect } from "react";
import { View, Text, FlatList, ActivityIndicator, TouchableOpacity } from "react-native";
import { useSQLiteContext } from "expo-sqlite";
import { useNavigation } from "@react-navigation/native";

import styles from "./MesocycleListStyle";


const MesocycleList = ( {program_id} ) => {
  const [mesocycles, setMesocycles] = useState([]);
  const [loading, setLoading] = useState(false);
  
  const db = useSQLiteContext();
  const navigation = useNavigation();

  const loadMesocycles = async () => {
    try {
      setLoading(true);

      const cycles = await db.getAllAsync(
        "SELECT mesocycle_id, weeks, focus FROM Mesocycle WHERE program_id = ?;",
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
  }, []);

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => {
        navigation.navigate("MicrocyclePage", {
            mesocycle_id: item.mesocycle_id,
            program_id: item.program_id})
      }}>

        <View style={styles.status_section}>

            <View style={styles.header_status}>
                
                <Text style={styles.label}>Status</Text>
                <Text>
                    (to do status bar here)
                </Text>
            </View>
        </View>

        <View style={styles.body}>

            <View style={styles.focus}>
                <Text>
                    Mesocycle focus: {item.focus}
                </Text>
            </View>
            

            <View style={styles.weeks}>
                <Text>
                    Weeks: {item.weeks}
                </Text>
            </View>

        </View>

    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <FlatList
      data={mesocycles}
      renderItem={renderItem}
    />
  );
};

export default MesocycleList;
