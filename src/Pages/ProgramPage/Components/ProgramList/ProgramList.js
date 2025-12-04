import { useState, useEffect } from "react";
import { View, Text, FlatList, ActivityIndicator, TouchableOpacity } from "react-native";
import { useSQLiteContext } from "expo-sqlite";
import { useNavigation } from "@react-navigation/native";


import styles from "./ProgramListStyle";


const ProgramList = () => {
  const navigation = useNavigation();
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(false);
  const db = useSQLiteContext();

  const loadPrograms = async () => {
    try {
      setLoading(true);
      console.log("Loading programs from DB...");

      const programs = await db.getAllAsync(
        "SELECT program_id, program_name, start_date, end_date, status FROM Program;"
      );

      setPrograms(programs);
    } catch (error) {
      console.error("Error loading programs", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPrograms();
  }, []);

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => {
        navigation.navigate("ExercisePage", {program_id: item.program_id})
      }}>

        <View style={styles.status_section}>
            <View style={styles.header_status}>
                <Text style={styles.label}>Status</Text>
                <View style={[styles.statusBadge, styles[item.status]]}>
                <Text style={styles.statusText}>{item.status}</Text>
                </View>
            </View>
        </View>

        <View style={styles.body}>

            <View style={styles.header}>

                <View style={styles.program_name}>
                    <Text style={styles.label}>Navn:</Text>
                    <Text style={styles.value}>{item.program_name}</Text>
                </View>

            </View>

            <View style={styles.dates_section}>

                <View style={styles.start_date}>
                    <Text style={styles.label}>Start:</Text>
                    <Text style={styles.value}>{item.start_date || "-"}</Text>
                </View>

                <View style={styles.end_date}>
                    <Text style={styles.label}>Slut:</Text>
                    <Text style={styles.value}>{item.end_date || "-"}</Text>
                </View>

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
      data={programs}
      keyExtractor={(item) => item.program_id.toString()}
      renderItem={renderItem}
    />
  );
};

export default ProgramList;
