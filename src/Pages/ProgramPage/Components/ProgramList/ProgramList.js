import { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import { useSQLiteContext } from "expo-sqlite";
import { useNavigation } from "@react-navigation/native";

import styles from "./ProgramListStyle";
import ThemedCard from "../../../../Resources/Components/ThemedCard";
import ThemedText from "../../../../Resources/Components/ThemedText";

const ProgramList = ({ refreshKey }) => {
  const navigation = useNavigation();
  const db = useSQLiteContext();

  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadPrograms = async () => {
    try {
      setLoading(true);

      const rows = await db.getAllAsync(
        `SELECT program_id, program_name, start_date, status
         FROM Program;`
      );

      setPrograms(rows);
    } catch (error) {
      console.error("Error loading programs", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPrograms();
  }, [refreshKey]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.listContainer}>
      {programs.map((item) => (
        <ThemedCard>
          <TouchableOpacity
            key={item.program_id}
            onPress={() =>
              navigation.navigate("ProgramOverviewPage", {
                program_id: item.program_id,
                start_date: item.start_date,
              })
            }
          >
            {/* Status */}
            <View style={styles.status_section}>
              <View style={styles.header_status}>
                <ThemedText style={styles.label}>Status</ThemedText>
                <View style={[styles.statusBadge, styles[item.status]]}>
                  <ThemedText style={styles.statusText}>{item.status}</ThemedText>
                </View>
              </View>
            </View>

            {/* Body */}
            <View style={styles.body}>
              <View style={styles.program_name}>
                <ThemedText style={styles.label}>Navn:</ThemedText>
                <ThemedText style={styles.value}>{item.program_name}</ThemedText>
              </View>

              <View style={styles.dates_section}>
                  <ThemedText style={styles.label}>Start:</ThemedText>
                  <ThemedText style={styles.value}>{item.start_date}</ThemedText>
              </View>
            </View>
          </TouchableOpacity>
        </ThemedCard>
      ))}

      {programs.length === 0 && (
        <Text style={styles.emptyText}>
          No programs found.
        </Text>
      )}
    </ScrollView>
  );
};

export default ProgramList;
