import { useState, useEffect } from "react";
import {
  View,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  StyleSheet,
  useColorScheme,
} from "react-native";
import { useSQLiteContext } from "expo-sqlite";
import { useNavigation } from "@react-navigation/native";
import { Colors } from "../../../../Resources/GlobalStyling/colors";

import { programService } from "../../../../Services";
import AddMesocycleModal from "./AddMesocycleModal";
import {
  ThemedTitle,
  ThemedCard,
  ThemedText,
} from "../../../../Resources/ThemedComponents";
import Plus from "../../../../Resources/Icons/UI-icons/Plus";
import { parseCustomDate, formatDate } from "../../../../Utils/dateUtils";

const CARD_WIDTH = 228;
const CARD_HEIGHT = 290;

const styles = StyleSheet.create({
  loadingContainer: {
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 40,
  },
  listContent: {
    paddingHorizontal: 4,
    paddingVertical: 6,
  },
  cardTouchable: {
    marginRight: 10,
  },
  card: {
    width: CARD_WIDTH,
    minHeight: CARD_HEIGHT,
    padding: 0,
    overflow: "hidden",
    borderWidth: 1.5,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingHorizontal: 18,
    paddingVertical: 16,
  },
  cycleMeta: {
    flex: 1,
    paddingRight: 12,
  },
  cycleEyebrow: {
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  cycleNumber: {
    marginTop: 4,
  },
  statusPill: {
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
    alignSelf: "flex-start",
  },
  statusText: {
    fontWeight: "700",
  },
  cardBody: {
    flex: 1,
    paddingHorizontal: 18,
    paddingVertical: 18,
  },
  focusLabel: {
    letterSpacing: 1,
    textTransform: "uppercase",
    marginBottom: 6,
  },
  focusText: {
    fontWeight: "700",
    lineHeight: 24,
    minHeight: 48,
  },
  periodBadge: {
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginTop: 16,
    marginBottom: 16,
    alignItems: "center",
  },
  periodText: {
    lineHeight: 18,
    textAlign: "center",
  },
  statsRow: {
    flexDirection: "row",
    marginBottom: 10,
  },
  statTile: {
    flex: 1,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 14,
    alignItems: "center",
  },
  statTileLeft: {
    marginRight: 10,
  },
  statLabel: {
    letterSpacing: 0.8,
    textTransform: "uppercase",
    marginBottom: 6,
    textAlign: "center",
  },
  statValue: {
    fontWeight: "700",
    textAlign: "center",
  },
  averageTile: {
    marginTop: "auto",
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 14,
    alignItems: "center",
  },
  averageValueRow: {
    flexDirection: "row",
    alignItems: "baseline",
    justifyContent: "center",
    marginTop: 6,
  },
  averageValue: {
    fontWeight: "700",
  },
  averageSuffix: {
    marginLeft: 6,
  },
  addCard: {
    width: CARD_WIDTH,
    minHeight: CARD_HEIGHT,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1.5,
    borderStyle: "dashed",
    paddingHorizontal: 22,
    backgroundColor: "transparent",
  },
  addIconBadge: {
    width: 64,
    height: 64,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1.5,
    marginBottom: 18,
  },
  addTitle: {
    fontWeight: "700",
    marginBottom: 6,
  },
  addSubtitle: {
    textAlign: "center",
    lineHeight: 18,
  },
});

const MesocycleList = ({ program_id, start_date, refreshKey, refresh }) => {
  const db = useSQLiteContext();
  const navigation = useNavigation();

  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme] ?? Colors.light;

  const [mesocycles, setMesocycles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);

  const accentColor = theme.primary ?? "#f7742e";
  const accentSoft = theme.primaryLight ?? "rgba(247, 116, 46, 0.18)";
  const successColor = theme.secondary ?? "#60daac";
  const successSoft = theme.secondaryLight ?? "rgba(96, 218, 172, 0.18)";
  const cardBackground = theme.cardBackground ?? theme.uiBackground ?? "#1b1918";
  const cardBorder = theme.cardBorder ?? theme.iconColor ?? "#383838";
  const quietText = theme.quietText ?? theme.iconColor ?? "#9591a5";
  const invertedText = theme.textInverted ?? "#201e2b";
  const textColor = theme.text ?? "#d4d4d4";

  const loadMesocycles = async () => {
    try {
      setLoading(true);
      const cycles = await programService.getMesocyclesByProgram(db, program_id);
      const workoutCounts =
        await programService.getMesocycleWorkoutCountsByProgram(db, program_id);

      const workoutCountMap = workoutCounts.reduce((acc, row) => {
        acc[row.mesocycle_id] = row.workout_count ?? 0;
        return acc;
      }, {});

      const enriched = enrichMesocycles(cycles, workoutCountMap);
      setMesocycles(enriched);
    } catch (error) {
      console.error("Error loading programs", error);
    } finally {
      setLoading(false);
    }
  };

  const enrichMesocycles = (cycles, workoutCountMap) => {
    let weekOffset = 0;

    return cycles.map((cycle) => {
      const start = parseCustomDate(start_date);
      start.setDate(start.getDate() + weekOffset * 7);

      const end = new Date(start);
      end.setDate(end.getDate() + cycle.weeks * 7 - 1);

      weekOffset += cycle.weeks;

      const workoutCount = workoutCountMap[cycle.mesocycle_id] ?? 0;
      const averageWeeklyWorkouts = cycle.weeks > 0 ? workoutCount / cycle.weeks : 0;

      return {
        ...cycle,
        period_start: formatDate(start),
        period_end: formatDate(end),
        workout_count: workoutCount,
        average_weekly_workouts: averageWeeklyWorkouts,
      };
    });
  };

  const handleAdd = async (data) => {
    try {
      await programService.createMesocycle(db, {
        programId: program_id,
        startDate: start_date,
        weeks: data.weeks,
        focus: data.focus,
      });

      if (refresh) {
        refresh();
      } else {
        await loadMesocycles();
      }
    } catch (error) {
      console.error(error);
    }

    setModalVisible(false);
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
    <>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
      >
        {mesocycles.map((item) => (
          <TouchableOpacity
            key={item.mesocycle_id}
            style={styles.cardTouchable}
            activeOpacity={0.9}
            onPress={() => {
              navigation.navigate("MicrocyclePage", {
                mesocycle_id: item.mesocycle_id,
                mesocycle_number: item.mesocycle_number,
                mesocycle_focus: item.focus,
                program_id,
                period_start: item.period_start,
                period_end: item.period_end,
              });
            }}
          >
            <ThemedCard
              style={[
                styles.card,
                {
                  backgroundColor: cardBackground,
                  borderColor: item.done ? successColor : cardBorder,
                },
              ]}
            >
              <View
                style={[
                  styles.cardHeader,
                  {
                    backgroundColor: item.done ? successSoft : accentSoft,
                  },
                ]}
              >
                <View style={styles.cycleMeta}>
                  <ThemedText
                    size={10}
                    style={styles.cycleEyebrow}
                    setColor={quietText}
                  >
                    Mesocycle
                  </ThemedText>
                  <ThemedTitle type="h3" style={styles.cycleNumber}>
                    #{item.mesocycle_number}
                  </ThemedTitle>
                </View>

                <View
                  style={[
                    styles.statusPill,
                    {
                      backgroundColor: item.done ? successColor : accentColor,
                    },
                  ]}
                >
                  <ThemedText
                    size={10}
                    style={styles.statusText}
                    setColor={invertedText}
                  >
                    {item.done ? "Complete" : "Open"}
                  </ThemedText>
                </View>
              </View>

              <View style={styles.cardBody}>
                <View>
                  <ThemedText
                    size={10}
                    style={styles.focusLabel}
                    setColor={quietText}
                  >
                    Focus
                  </ThemedText>
                  <ThemedText
                    size={20}
                    style={styles.focusText}
                    numberOfLines={2}
                    setColor={textColor}
                  >
                    {item.focus || "No focus"}
                  </ThemedText>
                </View>

                <View
                  style={[
                    styles.periodBadge,
                    {
                      borderColor: item.done ? successSoft : accentSoft,
                    },
                  ]}
                >
                  <ThemedText
                    size={11}
                    style={styles.periodText}
                    setColor={textColor}
                  >
                    {item.period_start} - {item.period_end}
                  </ThemedText>
                </View>

                <View style={styles.statsRow}>
                  <View
                    style={[
                      styles.statTile,
                      styles.statTileLeft,
                      { backgroundColor: accentSoft },
                    ]}
                  >
                    <ThemedText
                      size={9}
                      style={styles.statLabel}
                      setColor={quietText}
                    >
                      Weeks
                    </ThemedText>
                    <ThemedText
                      size={18}
                      style={styles.statValue}
                      setColor={cardBackground}
                    >
                      {item.weeks}
                    </ThemedText>
                  </View>

                  <View
                    style={[
                      styles.statTile,
                      { backgroundColor: successSoft },
                    ]}
                  >
                    <ThemedText
                      size={9}
                      style={styles.statLabel}
                      setColor={quietText}
                    >
                      Workouts
                    </ThemedText>
                    <ThemedText
                      size={18}
                      style={styles.statValue}
                      setColor={cardBackground}
                    >
                      {item.workout_count}
                    </ThemedText>
                  </View>
                </View>

                <View
                  style={[
                    styles.averageTile,
                    {
                      backgroundColor: item.done ? successSoft : accentSoft,
                    },
                  ]}
                >
                  <ThemedText
                    size={10}
                    style={styles.statLabel}
                    setColor={quietText}
                  >
                    Avg. weekly workouts
                  </ThemedText>

                  <View style={styles.averageValueRow}>
                    <ThemedText
                      size={22}
                      style={styles.averageValue}
                      setColor={cardBackground}
                    >
                      {item.average_weekly_workouts.toFixed(1)}
                    </ThemedText>
                    <ThemedText
                      size={12}
                      style={styles.averageSuffix}
                      setColor={quietText}
                    >
                      per week
                    </ThemedText>
                  </View>
                </View>
              </View>
            </ThemedCard>
          </TouchableOpacity>
        ))}

        <TouchableOpacity
          style={styles.cardTouchable}
          activeOpacity={0.9}
          onPress={() => {
            setModalVisible(true);
          }}
        >
          <ThemedCard
            style={[
              styles.addCard,
              {
                borderColor: cardBorder,
              },
            ]}
          >
            <View
              style={[
                styles.addIconBadge,
                {
                  backgroundColor: accentSoft,
                  borderColor: accentColor,
                },
              ]}
            >
              <Plus width={28} height={28} color={accentColor} />
            </View>
            <ThemedText size={18} style={styles.addTitle}>
              Add mesocycle
            </ThemedText>
            <ThemedText size={12} style={styles.addSubtitle} setColor={quietText}>
              Create the next training block with a focus and duration.
            </ThemedText>
          </ThemedCard>
        </TouchableOpacity>
      </ScrollView>

      <AddMesocycleModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSubmit={handleAdd}
      />
    </>
  );
};

export default MesocycleList;
