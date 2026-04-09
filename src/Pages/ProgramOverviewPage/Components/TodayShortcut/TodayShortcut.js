import { useEffect, useState } from "react";
import { ScrollView, TouchableOpacity, View, useColorScheme } from "react-native";
import { useSQLiteContext } from "expo-sqlite";
import { useNavigation } from "@react-navigation/native";

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

  const getWorkoutType = (workout) =>
    workout?.workout_type ?? workout?.label ?? null;

  const openWorkout = (workout) => {
    if (!workout) {
      return;
    }

    navigation.navigate("WorkoutPage", {
      workout_id: workout.workout_id,
      workout_label: workout.label,
      workout_type: getWorkoutType(workout),
      day: day?.Weekday,
      date,
      program_id,
    });
  };

  const handleShortcutPress = () => {
    if (workoutCount === 1) {
      openWorkout(workouts[0]);
    }
  };

  const workoutCount = workouts.length;
  const completedWorkoutCount = workouts.filter((workout) => workout.done === 1).length;
  const hasWorkouts = workoutCount > 0;
  const isMultiWorkout = workoutCount > 1;
  const allWorkoutsDone = hasWorkouts && completedWorkoutCount === workoutCount;
  const isCompletedMultiWorkout = isMultiWorkout && allWorkoutsDone;
  const isCompletedSingleWorkout =
    workoutCount === 1 && Number(workouts[0]?.done) === 1;
  const isRestDay = Boolean(day) && !hasWorkouts;
  const sectionDateLabel = day?.Weekday ? `${day.Weekday} - ${date}` : date;
  const remainingWorkoutCount = Math.max(workoutCount - completedWorkoutCount, 0);

  let headline = "No session today";
  let description = "Nothing is mapped to today's date in this program.";
  let actionLabel = null;
  let footerCopy = null;

  if (hasWorkouts && allWorkoutsDone) {
    headline = isCompletedSingleWorkout ? "Workout complete" : "Today's training is done";
    description =
      workoutCount === 1
        ? null
        : "All planned workouts are complete. Tap to reopen one of them.";
    actionLabel = null;
  } else if (hasWorkouts && workoutCount === 1) {
    headline = null;
    description = null;
    actionLabel = null;
  } else if (hasWorkouts) {
    headline = `${remainingWorkoutCount || workoutCount} of ${workoutCount} workouts left`;
    description = "Tap to choose which workout you want to open.";
    actionLabel = null;
    footerCopy = "Tap anywhere on the card to choose a workout.";
  } else if (day) {
    headline = "Rest day";
    description = null;
    footerCopy = null;
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
  const dateBadgeBackground =
    theme.primaryLight ?? theme.primary ?? "rgba(247, 116, 46, 0.18)";
  const dateBadgeTextColor =
    theme.cardBackground ?? theme.textInverted ?? theme.title ?? "#201e2b";
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
    isMultiWorkout
      ? `${workoutCount} ${workoutCount === 1 ? "WORKOUT" : "WORKOUTS"} - ${
          totalExerciseCount > 0
            ? `${totalExerciseCount} ${
                totalExerciseCount === 1 ? "EXERCISE" : "EXERCISES"
              }`
            : "EXERCISES"
        }`
      : totalExerciseCount > 0
        ? `${totalExerciseCount} ${
            totalExerciseCount === 1 ? "EXERCISE" : "EXERCISES"
          } TODAY`
        : "EXERCISES TODAY";
  const singleWorkout = workoutCount === 1 ? workouts[0] : null;
  const workoutIconConfig = singleWorkout
    ? getWorkoutIconConfig(getWorkoutType(singleWorkout))
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
          isCompletedSingleWorkout && styles.shortcut_card_complete,
          isRestDay && styles.shortcut_card_empty,
          {
            backgroundColor: cardBackground,
            borderColor: cardBorder,
          },
        ]}
      > 
        <View
          style={[
            styles.touchable,
            isMultiWorkout && styles.touchable_multi,
            isCompletedSingleWorkout && styles.touchable_complete,
            isRestDay && styles.touchable_empty,
          ]}
        >
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

          {(headline || description) && !isMultiWorkout && (
            isCompletedSingleWorkout ? (
              <TouchableOpacity
                disabled={!hasWorkouts}
                activeOpacity={0.92}
                onPress={handleShortcutPress}
              >
                <View style={styles.complete_summary_row}>
                  <View
                    style={[
                      styles.summary_panel,
                      styles.summary_panel_complete,
                      {
                        backgroundColor: panelBackground,
                        borderColor: chipBackground,
                      },
                    ]}
                  >
                    {headline && (
                      <ThemedTitle
                        type="h3"
                        style={[
                          styles.hero_title,
                          styles.hero_title_complete,
                          { color: headlineColor },
                        ]}
                      >
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

                  <View
                    style={[
                      styles.hero_workout_badge,
                      styles.complete_workout_badge,
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
              </TouchableOpacity>
            ) : (
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
                    <ThemedTitle
                      type="h3"
                      style={[
                        styles.hero_title,
                        isRestDay && styles.hero_title_empty,
                        { color: headlineColor },
                      ]}
                    >
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
            )
          )}

          {hasWorkouts && !isCompletedSingleWorkout && (
            <View
              style={[
                styles.plan_section,
                useCompactSingleWorkoutHeader && styles.plan_section_compact,
              ]}
            >
              {isCompletedMultiWorkout && (
                <View
                  style={[
                    styles.plan_complete_banner,
                    {
                      backgroundColor: panelBackground,
                      borderColor: chipBackground,
                    },
                  ]}
                >
                  <ThemedTitle
                    type="h3"
                    style={[
                      styles.plan_complete_banner_title,
                      { color: headlineColor },
                    ]}
                  >
                    Workouts complete
                  </ThemedTitle>
                </View>
              )}

              {!isCompletedMultiWorkout && (!useCompactSingleWorkoutHeader || actionLabel) && (
                <View
                  style={[
                    styles.plan_header,
                    isMultiWorkout && !actionLabel && styles.plan_header_centered,
                  ]}
                >
                  {!useCompactSingleWorkoutHeader && (
                    <ThemedText
                      size={11}
                      style={[
                        styles.plan_section_label,
                        isMultiWorkout && !actionLabel && styles.plan_section_label_centered,
                      ]}
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

              {visibleWorkoutPreviews.map((workout) => {
                const workoutHeaderIconConfig = getWorkoutIconConfig(
                  getWorkoutType(workout)
                );
                const WorkoutHeaderIcon = workoutHeaderIconConfig?.Icon ?? null;

                return (
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
                      isCompletedMultiWorkout && styles.plan_card_compact,
                      singleWorkout && styles.plan_card_joined,
                      {
                        backgroundColor: panelBackground,
                        borderColor: chipBackground,
                      },
                    ]}
                  >
                  {workoutCount > 1 && (
                    <View
                      style={[
                        styles.plan_card_header,
                        isCompletedMultiWorkout && styles.plan_card_header_compact,
                      ]}
                    >
                      <View style={styles.plan_card_title_row}>
                        {WorkoutHeaderIcon && (
                          <View
                            style={[
                              styles.plan_card_title_icon_wrap,
                              { backgroundColor: cardBackground },
                            ]}
                          >
                            <WorkoutHeaderIcon
                              width={14}
                              height={14}
                              color={headlineColor}
                              fill={headlineColor}
                              primaryColor={headlineColor}
                              backgroundColor="transparent"
                            />
                          </View>
                        )}

                        <ThemedText
                          size={13}
                          style={styles.plan_card_title}
                          setColor={headlineColor}
                          numberOfLines={1}
                        >
                          {workout.label}
                        </ThemedText>
                      </View>

                      <TouchableOpacity
                        activeOpacity={0.92}
                        onPress={() => openWorkout(workout)}
                      >
                        <View
                          style={[
                            styles.plan_status_chip,
                            {
                              backgroundColor:
                                Number(workout.done) === 1
                                  ? theme.secondary ?? "#60daac"
                                  : theme.primary ?? "#f7742e",
                            },
                          ]}
                        >
                          <ThemedText
                            size={10}
                            style={styles.plan_status_text}
                            setColor={ctaTextColor}
                          >
                            {Number(workout.done) === 1 ? "Done (Open)" : "Open"}
                          </ThemedText>
                        </View>
                      </TouchableOpacity>
                    </View>
                  )}

                  {!isCompletedMultiWorkout && workout.previewItems.length > 0 ? (
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
                  ) : !isCompletedMultiWorkout ? (
                    <ThemedText
                      size={12}
                      style={styles.plan_empty_text}
                      setColor={supportiveColor}
                    >
                      No exercises added yet.
                    </ThemedText>
                  ) : null}
                </View>
                </View>
              )})}
            </View>
          )}

          {footerCopy && !isMultiWorkout && (
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
    </>
  );
};

export default TodayShortcut;
