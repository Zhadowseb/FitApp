import { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  TouchableOpacity,
  View,
  useColorScheme,
} from "react-native";
import { useSQLiteContext } from "expo-sqlite";
import { useFocusEffect, useNavigation } from "@react-navigation/native";

import styles from "./ProgramListStyle";
import { programService } from "../../../../Services";
import { Colors } from "../../../../Resources/GlobalStyling/colors";
import {
  ThemedCard,
  ThemedText,
  ThemedTitle,
} from "../../../../Resources/ThemedComponents";
import {
  getAverageSessionsPerWeek,
  getProgramEndDate,
} from "../../../../Utils/programUtils";

const ProgramList = ({ refreshKey }) => {
  const navigation = useNavigation();
  const db = useSQLiteContext();
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme] ?? Colors.light;

  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(false);
  const hasHandledInitialFocusRef = useRef(false);

  const cardSurface = theme.cardBackground ?? theme.background;
  const panelSurface = theme.uiBackground ?? "rgba(127, 127, 127, 0.12)";
  const quietText = theme.quietText ?? theme.iconColor ?? theme.text;
  const titleColor = theme.title ?? theme.text;
  const footerText = theme.cardBackground ?? theme.textInverted ?? "#1b1918";
  const metricLabelColor = theme.primary ?? theme.ACTIVE ?? "#f7742e";
  const cardBorderFallback =
    theme.cardBorder ?? theme.border ?? theme.iconColor ?? theme.text;

  const loadPrograms = useCallback(async () => {
    try {
      setLoading(true);

      const rows = await programService.getProgramsOverview(db);

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
  }, [db]);

  useEffect(() => {
    loadPrograms();
  }, [loadPrograms, refreshKey]);

  useFocusEffect(
    useCallback(() => {
      if (!hasHandledInitialFocusRef.current) {
        hasHandledInitialFocusRef.current = true;
        return undefined;
      }

      loadPrograms();
      return undefined;
    }, [loadPrograms])
  );

  const getStatusPresentation = (status) => {
    switch (status) {
      case "ACTIVE":
        return {
          label: "Active",
          color: theme.ACTIVE ?? theme.primary ?? "#f7742e",
          backgroundColor: theme.primaryLight ?? "rgba(247, 116, 46, 0.16)",
          summary: "Currently in progress",
        };
      case "COMPLETE":
        return {
          label: "Completed",
          color: theme.COMPLETE ?? theme.secondary ?? "#60daac",
          backgroundColor: theme.secondaryLight ?? "rgba(96, 218, 172, 0.16)",
          summary: "Finished and ready to review",
        };
      case "NOT_STARTED":
      default:
        return {
          label: "Not started",
          color: theme.NOT_STARTED ?? theme.iconColor ?? "#9E9E9E",
          backgroundColor: theme.uiBackground ?? "rgba(127, 127, 127, 0.16)",
          summary: null,
        };
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.listContainer}>
      {programs.map((item) => {
        const statusPresentation = getStatusPresentation(item.status);
        const cardBorder = cardBorderFallback ?? statusPresentation.color;
        const programSummary = `${item.mesocycle_count} ${
          item.mesocycle_count === 1 ? "block" : "blocks"
        } - ${item.workout_count} ${
          item.workout_count === 1 ? "workout" : "workouts"
        }`;

        return (
          <ThemedCard
            key={item.program_id}
            style={[
              styles.card,
              {
                backgroundColor: cardSurface,
                borderColor: cardBorder,
              },
            ]}
          >
            <View
              pointerEvents="none"
              style={[
                styles.cardAccent,
                { backgroundColor: statusPresentation.color },
              ]}
            />

            <TouchableOpacity
              activeOpacity={0.92}
              style={styles.touchable}
              onPress={() =>
                navigation.navigate("ProgramOverviewPage", {
                  program_id: item.program_id,
                  start_date: item.start_date,
                })
              }
            >
              <ThemedText
                style={styles.eyebrow}
                setColor={statusPresentation.color}
              >
                Program
              </ThemedText>

              <View
                style={[
                  styles.heroPanel,
                  {
                    backgroundColor: statusPresentation.backgroundColor,
                    borderColor: statusPresentation.color,
                  },
                ]}
              >
                <View style={styles.heroHeader}>
                  <View style={styles.titleSection}>
                    <ThemedTitle type="h3" style={styles.title}>
                      {item.program_name || "Untitled program"}
                    </ThemedTitle>

                    <ThemedText style={styles.subtitle} setColor={quietText}>
                      {programSummary}
                    </ThemedText>
                  </View>

                  <View style={styles.statusSection}>
                    <View
                      style={[
                        styles.statusBadge,
                        { backgroundColor: cardSurface },
                      ]}
                    >
                      <ThemedText
                        style={styles.statusText}
                        setColor={statusPresentation.color}
                      >
                        {statusPresentation.label}
                      </ThemedText>
                    </View>
                  </View>
                </View>

                {statusPresentation.summary ? (
                  <ThemedText style={styles.heroSummary} setColor={titleColor}>
                    {statusPresentation.summary}
                  </ThemedText>
                ) : null}

                <View style={styles.heroTimelineRow}>
                  <View
                    style={[
                      styles.timelineCard,
                      {
                        backgroundColor: cardSurface,
                        borderColor: cardBorder,
                      },
                    ]}
                  >
                    <ThemedText style={styles.dateLabel} setColor={quietText}>
                      Start date
                    </ThemedText>
                    <ThemedText
                      style={styles.dateValue}
                      setColor={titleColor}
                      numberOfLines={1}
                    >
                      {item.start_date}
                    </ThemedText>
                  </View>

                  <View
                    style={[
                      styles.timelineCard,
                      {
                        backgroundColor: cardSurface,
                        borderColor: cardBorder,
                      },
                    ]}
                  >
                    <ThemedText style={styles.dateLabel} setColor={quietText}>
                      End date
                    </ThemedText>
                    <ThemedText
                      style={styles.dateValue}
                      setColor={titleColor}
                      numberOfLines={1}
                    >
                      {item.end_date}
                    </ThemedText>
                  </View>
                </View>
              </View>

              <View style={styles.metaGrid}>
                <View
                  style={[
                    styles.metaCard,
                    {
                      backgroundColor: panelSurface,
                      borderColor: cardBorder,
                    },
                  ]}
                >
                  <ThemedText style={styles.label} setColor={metricLabelColor}>
                    Blocks
                  </ThemedText>
                  <ThemedText style={styles.value} setColor={titleColor}>
                    {item.mesocycle_count}
                  </ThemedText>
                </View>

                <View
                  style={[
                    styles.metaCard,
                    {
                      backgroundColor: panelSurface,
                      borderColor: cardBorder,
                    },
                  ]}
                >
                  <ThemedText style={styles.label} setColor={metricLabelColor}>
                    Weeks
                  </ThemedText>
                  <ThemedText style={styles.value} setColor={titleColor}>
                    {item.week_count}
                  </ThemedText>
                </View>

                <View
                  style={[
                    styles.metaCard,
                    {
                      backgroundColor: panelSurface,
                      borderColor: cardBorder,
                    },
                  ]}
                >
                  <ThemedText style={styles.label} setColor={metricLabelColor}>
                    Workouts
                  </ThemedText>
                  <ThemedText style={styles.value} setColor={titleColor}>
                    {item.workout_count}
                  </ThemedText>
                </View>
              </View>

              <View style={styles.footerRow}>
                <ThemedText style={styles.footerCopy} setColor={footerText}>
                  Open program overview
                </ThemedText>
              </View>
            </TouchableOpacity>
          </ThemedCard>
        );
      })}

      {programs.length === 0 && (
        <ThemedCard
          style={[
            styles.emptyCard,
            {
              backgroundColor: cardSurface,
              borderColor: cardBorderFallback ?? theme.primary,
            },
          ]}
        >
          <View
            pointerEvents="none"
            style={[
              styles.cardAccent,
              { backgroundColor: theme.primary ?? "#f7742e" },
            ]}
          />
          <ThemedText style={styles.emptyText} setColor={quietText}>
            No programs found.
          </ThemedText>
        </ThemedCard>
      )}
    </ScrollView>
  );
};

export default ProgramList;
