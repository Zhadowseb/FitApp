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
import {ThemedCard, ThemedText} from "../../../../Resources/ThemedComponents";
import { formatDate, parseCustomDate } from "../../../../Utils/dateUtils";

const getProgramEndDate = (startDate, dayCount) => {
  if (!startDate) {
    return "";
  }

  const endDate = parseCustomDate(startDate);
  endDate.setDate(endDate.getDate() + dayCount);
  return formatDate(endDate);
};

const getAverageSessionsPerWeek = (workoutCount, weekCount) => {
  if (!weekCount) {
    return "0.0";
  }

  return (workoutCount / weekCount).toFixed(1);
};

const ProgramList = ({ refreshKey }) => {
  const navigation = useNavigation();
  const db = useSQLiteContext();

  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadPrograms = async () => {
    try {
      setLoading(true);

      const rows = await db.getAllAsync(
        `SELECT
            p.program_id,
            p.program_name,
            p.start_date,
            p.status,
            COALESCE(mesocycles.mesocycle_count, 0) AS mesocycle_count,
            COALESCE(microcycles.week_count, 0) AS week_count,
            COALESCE(days.day_count, 0) AS day_count,
            COALESCE(workouts.workout_count, 0) AS workout_count
         FROM Program p
         LEFT JOIN (
            SELECT
              program_id,
              COUNT(*) AS mesocycle_count
            FROM Mesocycle
            GROUP BY program_id
         ) mesocycles
           ON mesocycles.program_id = p.program_id
         LEFT JOIN (
            SELECT
              program_id,
              COUNT(*) AS week_count
            FROM Microcycle
            GROUP BY program_id
         ) microcycles
           ON microcycles.program_id = p.program_id
         LEFT JOIN (
            SELECT
              program_id,
              COUNT(*) AS day_count
            FROM Day
            GROUP BY program_id
         ) days
           ON days.program_id = p.program_id
         LEFT JOIN (
            SELECT
              d.program_id,
              COUNT(w.workout_id) AS workout_count
            FROM Day d
            LEFT JOIN Workout w
              ON w.day_id = d.day_id
            GROUP BY d.program_id
         ) workouts
           ON workouts.program_id = p.program_id
         ORDER BY p.start_date DESC, p.program_id DESC;`
      );

      setPrograms(
        rows.map((program) => ({
          ...program,
          end_date: getProgramEndDate(program.start_date, program.day_count),
          avg_sessions_per_week: getAverageSessionsPerWeek(
            program.workout_count,
            program.week_count
          ),
        }))
      );
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
        <ThemedCard key={item.program_id} style={styles.card}>
          <TouchableOpacity
            style={styles.touchable}
            onPress={() =>
              navigation.navigate("ProgramOverviewPage", {
                program_id: item.program_id,
                start_date: item.start_date,
              })
            }
          >
            <View style={styles.header}>
              <View style={styles.titleSection}>
                <ThemedText style={styles.title}>
                  {item.program_name || "Untitled program"}
                </ThemedText>
                <ThemedText style={styles.subtitle}>Program overview</ThemedText>
              </View>

              <View style={styles.status_section}>
                <ThemedText style={styles.label}>Status</ThemedText>
                <View style={[styles.statusBadge, styles[item.status]]}>
                  <ThemedText style={styles.statusText}>{item.status}</ThemedText>
                </View>
              </View>
            </View>

            <View style={styles.metaGrid}>
              <View style={styles.metaCard}>
                <ThemedText style={styles.label}>Timeline</ThemedText>
                <ThemedText style={styles.dateLabel}>Start date</ThemedText>
                <ThemedText style={styles.dateValue} numberOfLines={1}>
                  {item.start_date}
                </ThemedText>
                <ThemedText style={styles.dateLabel}>End date</ThemedText>
                <ThemedText style={styles.dateValue} numberOfLines={1}>
                  {item.end_date}
                </ThemedText>
              </View>

              <View style={styles.metaCard}>
                <ThemedText style={styles.label}>Weeks</ThemedText>
                <ThemedText style={styles.value}>
                  {item.week_count} {item.week_count === 1 ? "week" : "weeks"}
                </ThemedText>
                <ThemedText style={styles.secondaryMeta}>
                  Avg sessions/week: {item.avg_sessions_per_week}
                </ThemedText>
              </View>

              <View style={styles.metaCard}>
                <ThemedText style={styles.label}>Blocks</ThemedText>
                <ThemedText style={styles.value}>
                  {item.mesocycle_count}
                </ThemedText>
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
