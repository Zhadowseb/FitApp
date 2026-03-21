import { useEffect, useState } from "react";
import { ScrollView, TouchableOpacity, View, useColorScheme } from "react-native";
import { useSQLiteContext } from "expo-sqlite";
import { useNavigation } from "@react-navigation/native";

import PickWorkoutModal from "../../../WeekPage/Components/Day/Components/PickWorkoutModal/PickWorkoutModal";
import { Colors } from "../../../../Resources/GlobalStyling/colors";
import { getWorkoutIconConfig } from "../../../../Resources/Icons/WorkoutLabels";
import { getTodaysDate } from "../../../../Utils/dateUtils";
import { programService } from "../../../../Services";
import styles from "./TodayShortcutStyle";
import {
  ThemedCard,
  ThemedText,
  ThemedTitle,
} from "../../../../Resources/ThemedComponents";

const TodayShortcut = ({ program_id }) => {
  const db = useSQLiteContext();
  const navigation = useNavigation();
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme] ?? Colors.light;

  const [day, set_day] = useState(null);
  const [workouts, set_workouts] = useState([]);
  const [pickWorkoutModal_visible, set_pickWorkoutModal_visible] = useState(false);

  const date = getTodaysDate();

  const getToday = async () => {
    try {
      const snapshot = await programService.getTodayProgramSnapshot(db, {
        programId: program_id,
        date,
      });

      if (!snapshot) {
        set_day(null);
        set_workouts([]);
        return;
      }

      set_day(snapshot.day);
      set_workouts(snapshot.workouts);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    getToday();
  }, [db, program_id, date]);

  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", () => {
      getToday();
    });
    return unsubscribe;
  }, [navigation, db, program_id, date]);

  const openWorkout = (workout) => {
    if (!workout) {
      return;
    }

    navigation.navigate("WorkoutPage", {
      workout_id: workout.workout_id,
      workout_label: workout.label,
      day: day?.Weekday,
      date,
      program_id,
    });
  };

  const handleShortcutPress = () => {
    if (workoutCount === 1) {
      openWorkout(workouts[0]);
    } else if (workoutCount > 1) {
      set_pickWorkoutModal_visible(true);
    }
  };

  const workoutCount = workouts.length;
  const completedWorkoutCount = workouts.filter((workout) => workout.done === 1).length;
  const hasWorkouts = workoutCount > 0;
  const allWorkoutsDone = hasWorkouts && completedWorkoutCount === workoutCount;
  const sectionDateLabel = day?.Weekday ? `${day.Weekday} - ${date}` : date;
  const remainingWorkoutCount = Math.max(workoutCount - completedWorkoutCount, 0);

  let headline = "No session today";
  let description = "Nothing is mapped to today's date in this program.";
  let actionLabel = null;
  let footerCopy = null;

  if (hasWorkouts && allWorkoutsDone) {
    headline = "Today's training is done";
    description =
      workoutCount === 1
        ? null
        : "All planned workouts are complete. Tap to reopen one of them.";
    actionLabel = workoutCount === 1 ? null : "Review workouts";
  } else if (hasWorkouts && workoutCount === 1) {
    headline = null;
    description = null;
    actionLabel = null;
  } else if (hasWorkouts) {
    headline = `${remainingWorkoutCount || workoutCount} of ${workoutCount} workouts left`;
    description = "Tap to choose which workout you want to open.";
    actionLabel = "Choose workout";
    footerCopy = "Tap anywhere on the card to choose a workout.";
  } else if (day) {
    headline = "Rest day";
    description = "There are no workouts scheduled for today.";
    footerCopy = "Nothing to open today.";
  }

  const cardBackground = !hasWorkouts
    ? theme.cardBackground ?? theme.navBackground ?? "rgba(255, 255, 255, 0.08)"
    : allWorkoutsDone
      ? theme.secondaryLight ?? "rgba(96, 218, 172, 0.18)"
      : theme.primaryLight ?? "rgba(247, 116, 46, 0.18)";
  const cardBorder = !hasWorkouts
    ? theme.cardBorder ?? "rgba(255, 255, 255, 0.08)"
    : allWorkoutsDone
      ? theme.secondary ?? "#60daac"
      : theme.primary ?? "#f7742e";
  const panelBackground =
    colorScheme === "dark"
      ? "rgba(14, 15, 18, 0.30)"
      : "rgba(255, 255, 255, 0.72)";
  const chipBackground =
    colorScheme === "dark"
      ? "rgba(255, 255, 255, 0.06)"
      : "rgba(255, 255, 255, 0.78)";
  const labelColor =
    theme.quietText ??
    (colorScheme === "dark"
      ? "rgba(212, 212, 212, 0.72)"
      : "rgba(32, 30, 43, 0.66)");
  const headlineColor = hasWorkouts
    ? theme.cardBackground ?? theme.textInverted ?? "#1b1918"
    : theme.title ?? "#fff";
  const supportiveColor = hasWorkouts
    ? "rgba(27, 25, 24, 0.72)"
    : labelColor;
  const ctaBackground = allWorkoutsDone
    ? theme.secondary ?? "#60daac"
    : theme.primary ?? "#f7742e";
  const ctaTextColor = theme.cardBackground ?? theme.textInverted ?? "#1b1918";
  const dateBadgeBackground = theme.cardBackground ?? "#1b1918";
  const dateBadgeTextColor =
    colorScheme === "dark"
      ? theme.text ?? "#d4d4d4"
      : "#f3f1f7";
  const previewScrollThreshold = 4;
  const visibleWorkoutPreviews = workouts.map((workout) => ({
    ...workout,
    previewItems: workout.previewItems ?? [],
    isPreviewScrollable:
      (workout.previewItems?.length ?? 0) > previewScrollThreshold,
  }));
  const totalExerciseCount = workouts.reduce(
    (total, workout) => total + (workout.previewItems?.length ?? 0),
    0
  );
  const planSummaryLabel =
    totalExerciseCount > 0
      ? `${totalExerciseCount} ${
          totalExerciseCount === 1 ? "EXERCISE" : "EXERCISES"
        } TODAY`
      : "EXERCISES TODAY";
  const singleWorkout = workoutCount === 1 ? workouts[0] : null;
  const workoutIconConfig = singleWorkout
    ? getWorkoutIconConfig(singleWorkout.label)
    : null;
  const HeroWorkoutIcon = workoutIconConfig?.Icon ?? null;
  const useCompactSingleWorkoutHeader =
    Boolean(singleWorkout) && !headline && !description;

  return (
    <>
      <ThemedTitle type="h2">Today</ThemedTitle>

      <ThemedCard
        style={[
          styles.shortcut_card,
          {
            backgroundColor: cardBackground,
            borderColor: cardBorder,
          },
        ]}
      >
        <View style={styles.touchable}>
          {!useCompactSingleWorkoutHeader && (
            <View style={styles.top_row}>
              <View style={styles.top_meta}>
                <View
                  style={[
                    styles.date_badge,
                    { backgroundColor: dateBadgeBackground },
                  ]}
                >
                  <ThemedText
                    size={10}
                    style={styles.date_badge_text}
                    setColor={dateBadgeTextColor}
                  >
                    {sectionDateLabel}
                  </ThemedText>
                </View>
              </View>
            </View>
          )}

          {(headline || description) && (
            <TouchableOpacity
              disabled={!hasWorkouts}
              activeOpacity={0.92}
              onPress={handleShortcutPress}
            >
              <View
                style={[
                  styles.summary_panel,
                  {
                    backgroundColor: panelBackground,
                    borderColor: chipBackground,
                  },
                ]}
              >
                {headline && (
                  <ThemedTitle type="h3" style={[styles.hero_title, { color: headlineColor }]}>
                    {headline}
                  </ThemedTitle>
                )}
                {description && (
                  <ThemedText
                    style={styles.hero_description}
                    setColor={supportiveColor}
                  >
                    {description}
                  </ThemedText>
                )}
              </View>
            </TouchableOpacity>
          )}

          {hasWorkouts && (
            <View
              style={[
                styles.plan_section,
                useCompactSingleWorkoutHeader && styles.plan_section_compact,
              ]}
            >
              {(!useCompactSingleWorkoutHeader || actionLabel) && (
                <View style={styles.plan_header}>
                  {!useCompactSingleWorkoutHeader && (
                    <ThemedText
                      size={11}
                      style={styles.plan_section_label}
                      setColor={supportiveColor}
                    >
                      {planSummaryLabel}
                    </ThemedText>
                  )}

                  {actionLabel && (
                    <TouchableOpacity
                      activeOpacity={0.92}
                      onPress={handleShortcutPress}
                    >
                      <View
                        style={[
                          styles.plan_action_chip,
                          { backgroundColor: ctaBackground },
                        ]}
                      >
                        <ThemedText size={11} setColor={ctaTextColor} style={styles.plan_action_text}>
                          {actionLabel}
                        </ThemedText>
                      </View>
                    </TouchableOpacity>
                  )}
                </View>
              )}

              {visibleWorkoutPreviews.map((workout) => (
                <View key={workout.workout_id}>
                  {singleWorkout && (
                    <TouchableOpacity
                      activeOpacity={0.92}
                      onPress={handleShortcutPress}
                    >
                      <View style={styles.joined_header}>
                      {useCompactSingleWorkoutHeader && (
                        <View style={styles.joined_header_copy}>
                          <View
                            style={[
                              styles.date_badge,
                              { backgroundColor: dateBadgeBackground },
                            ]}
                          >
                            <ThemedText
                              size={10}
                              style={styles.date_badge_text}
                              setColor={dateBadgeTextColor}
                            >
                              {sectionDateLabel}
                            </ThemedText>
                          </View>

                          <ThemedText
                            size={11}
                            style={styles.top_meta_summary}
                            setColor={supportiveColor}
                          >
                            {planSummaryLabel}
                          </ThemedText>
                        </View>
                      )}

                      <View style={styles.hero_workout_badge_slot}>
                        <View
                          style={[
                            styles.hero_workout_badge_underlay,
                            { backgroundColor: cardBackground },
                          ]}
                        />

                        <View
                          style={[
                            styles.hero_workout_badge,
                            styles.hero_workout_badge_joined,
                            {
                              backgroundColor: panelBackground,
                              borderColor: chipBackground,
                            },
                          ]}
                        >
                          {HeroWorkoutIcon && (
                            <HeroWorkoutIcon
                              width={24}
                              height={24}
                              color={headlineColor}
                              fill={headlineColor}
                              primaryColor={headlineColor}
                              backgroundColor="transparent"
                            />
                          )}

                          <ThemedText
                            size={10}
                            style={styles.hero_workout_label}
                            setColor={supportiveColor}
                            numberOfLines={1}
                          >
                            {singleWorkout.label}
                          </ThemedText>
                        </View>
                      </View>
                    </View>
                    </TouchableOpacity>
                  )}

                  <View
                    style={[
                      styles.plan_card,
                      singleWorkout && styles.plan_card_joined,
                      {
                        backgroundColor: panelBackground,
                        borderColor: chipBackground,
                      },
                    ]}
                  >
                  {workoutCount > 1 && (
                    <View style={styles.plan_card_header}>
                      <ThemedText
                        size={13}
                        style={styles.plan_card_title}
                        setColor={headlineColor}
                        numberOfLines={1}
                      >
                        {workout.label}
                      </ThemedText>

                      {workout.done === 1 && (
                        <View
                          style={[
                            styles.plan_status_chip,
                            {
                              backgroundColor: theme.secondary ?? "#60daac",
                            },
                          ]}
                        >
                          <ThemedText
                            size={10}
                            style={styles.plan_status_text}
                            setColor={ctaTextColor}
                          >
                            Done
                          </ThemedText>
                        </View>
                      )}
                    </View>
                  )}

                  {workout.previewItems.length > 0 ? (
                    <>
                      <ScrollView
                        style={[
                          styles.plan_item_list,
                          workout.isPreviewScrollable && styles.plan_item_list_scroll,
                        ]}
                        contentContainerStyle={styles.plan_item_list_content}
                        showsVerticalScrollIndicator={false}
                        nestedScrollEnabled
                        scrollEnabled={workout.isPreviewScrollable}
                      >
                        {workout.previewItems.map((item, index) => (
                        <View
                          key={`${workout.workout_id}-${item.label}-${index}`}
                          style={[
                            styles.plan_item_row,
                            index === workout.previewItems.length - 1 &&
                              styles.plan_item_row_last,
                            { backgroundColor: chipBackground },
                          ]}
                        >
                          <View style={styles.plan_item_left}>
                            <View
                              style={[
                                styles.plan_item_dot,
                                {
                                  backgroundColor:
                                    (item.done ?? Number(workout.done) === 1)
                                      ? theme.secondary ?? "#60daac"
                                      : cardBorder,
                                },
                              ]}
                            />

                            <ThemedText
                              size={12}
                              style={styles.plan_item_title}
                              setColor={headlineColor}
                              numberOfLines={1}
                            >
                              {item.label}
                            </ThemedText>
                          </View>

                          {item.detail ? (
                            <ThemedText
                              size={10}
                              style={[
                                styles.plan_item_meta,
                                { backgroundColor: dateBadgeBackground },
                              ]}
                              setColor={dateBadgeTextColor}
                            >
                              {item.detail}
                            </ThemedText>
                          ) : null}
                        </View>
                        ))}
                      </ScrollView>

                      {workout.isPreviewScrollable && (
                        <View style={styles.plan_scroll_handle_row}>
                          <View
                            style={[
                              styles.plan_scroll_handle,
                              { backgroundColor: "#888" },
                            ]}
                          />
                        </View>
                      )}
                    </>
                  ) : (
                    <ThemedText
                      size={12}
                      style={styles.plan_empty_text}
                      setColor={supportiveColor}
                    >
                      No exercises added yet.
                    </ThemedText>
                  )}
                </View>
                </View>
              ))}
            </View>
          )}

          {footerCopy && (
            <View
              style={[
                styles.footer_row,
              ]}
            >
              <ThemedText size={12} setColor={labelColor} style={styles.footer_copy}>
                {footerCopy}
              </ThemedText>
            </View>
          )}
        </View>
      </ThemedCard>

      <PickWorkoutModal
        workouts={workouts}
        visible={pickWorkoutModal_visible}
        onClose={() => set_pickWorkoutModal_visible(false)}
        onSubmit={(workout) => {
          openWorkout(workout);
        }}
      />
    </>
  );
};

export default TodayShortcut;
