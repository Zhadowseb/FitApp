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

const ProgramList = ({ refreshKey }) => {
  const navigation = useNavigation();
  const db = useSQLiteContext();

  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadPrograms = async () => {
    try {
      setLoading(true);

      const rows = await db.getAllAsync(
        `SELECT program_id, program_name, start_date, end_date, status
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
        <TouchableOpacity
          key={item.program_id}
          style={styles.card}
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
              <Text style={styles.label}>Status</Text>
              <View style={[styles.statusBadge, styles[item.status]]}>
                <Text style={styles.statusText}>{item.status}</Text>
              </View>
            </View>
          </View>

          {/* Body */}
          <View style={styles.body}>
            <View style={styles.program_name}>
              <Text style={styles.label}>Navn:</Text>
              <Text style={styles.value}>{item.program_name}</Text>
            </View>

            <View style={styles.dates_section}>
              <View style={styles.start_date}>
                <Text style={styles.label}>Start:</Text>
                <Text style={styles.value}>{item.start_date}</Text>
              </View>

              <View style={styles.end_date}>
                <Text style={styles.label}>Slut:</Text>
                <Text style={styles.value}>{item.end_date}</Text>
              </View>
            </View>
          </View>
        </TouchableOpacity>
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
