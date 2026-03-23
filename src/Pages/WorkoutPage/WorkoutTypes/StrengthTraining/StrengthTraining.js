import {
  AppState,
  TouchableOpacity,
  View,
  Vibration,
} from "react-native";
import { useState, useCallback, useEffect, useRef } from "react";
import { useSQLiteContext } from "expo-sqlite";
import { useFocusEffect } from "@react-navigation/native";

import ExerciseList from "./Components/ExerciseList/ExerciseList";
import CircularProgression from "../../../../Resources/Components/CircularProgression";
import { useColorScheme } from "react-native";
import { Colors } from "../../../../Resources/GlobalStyling/colors";

import pageStyles from "../../WorkoutPageStyle";
import styles from "./StrengthTrainingStyle";
import {
  ThemedCard,
  ThemedBottomSheet,
  ThemedKeyboardProtection,
  ThemedView,
  ThemedText,
  ThemedButton,
} from "../../../../Resources/ThemedComponents";
import { formatTime, formatWorkoutStart } from "../../../../Utils/timeUtils";
import { weightliftingService, workoutService } from "../../../../Services";

//Icons:
import Filter from "../../../../Resources/Icons/UI-icons/Filter";
import Checkmark from "../../../../Resources/Icons/UI-icons/Checkmark";
import ArrowDoubleDown from "../../../../Resources/Icons/UI-icons/ArrowDoubleDown";
import ArrowDoubleUp from "../../../../Resources/Icons/UI-icons/ArrowDoubleUp";

const StrengthTraining = ({workout_id, date}) =>  {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme] ?? Colors.light;

  const db = useSQLiteContext();

  const [refreshing, set_refreshing] = useState(0);
  const [filterBottomsheetVisible, setFilterBottomsheetVisible] = useState(false);
  const [showCompletedExercises, setShowCompletedExercises] = useState(true);
  const [expansionAction, setExpansionAction] = useState(null);

  const [totalSets, set_totalSets] = useState(0);
  const [doneSets, set_doneSets] = useState(0);

  //Workout timer state:
  const [original_start_time, set_original_start_time] = useState(null);
  const [timer_start, set_timer_start] = useState(null);
  const [elapsed_time, set_elapsed_time] = useState(0);
  const [isDone, set_isDone] = useState(false);
  const [isRunning, set_isRunning] = useState(false);
  const timerStartRef = useRef(null);
  const elapsedTimeRef = useRef(0);

  const refresh = () => {
    set_refreshing(prev => prev + 1);
  }

  useEffect(() => {
    timerStartRef.current = timer_start;
  }, [timer_start]);

  useEffect(() => {
    elapsedTimeRef.current = elapsed_time;
  }, [elapsed_time]);

  const persistCurrentTimerState = useCallback(async () => {
    await workoutService.persistWorkoutTimerState(db, {
      workoutId: workout_id,
      timerStart: timerStartRef.current,
      elapsedTime: elapsedTimeRef.current,
    });
  }, [db, workout_id]);

  const loadTotalSets = async () => {
    try {
      const result =
        await weightliftingService.getStrengthWorkoutSummary(db, workout_id);
      set_totalSets(result.totalSets);
    } catch (err) {
      console.error("Failed to load the amount of sets to do for this workout:", err);
    }
  };

  const loadCompletedSets = async () => {
    try {
      const result =
        await weightliftingService.getStrengthWorkoutSummary(db, workout_id);
      set_doneSets(result.doneSets);
    } catch (err) {
      console.error("Failed to load the done sets for this workout:", err);
    }
  };

  //Focus coming back to the page
  useFocusEffect(
    useCallback(() => {
      
      loadTotalSets();
      loadCompletedSets();

      const reload = async () => {
          const row = await workoutService.getWorkoutTimerState(db, workout_id);
          const nextIsDone = Number(row.done) === 1;

          set_isRunning(row.timer_start !== null && !nextIsDone);
          set_isDone(nextIsDone);
          set_original_start_time(row.original_start_time);
          set_timer_start(row.timer_start);
          set_elapsed_time(row.elapsed_time);
      }
      reload();

    }, [workout_id])
  );  

  useEffect(() => {
    const subscription = AppState.addEventListener("change", (nextAppState) => {
      if (nextAppState === "inactive" || nextAppState === "background") {
        persistCurrentTimerState();
      }
    });

    return () => {
      subscription.remove();
    };
  }, [persistCurrentTimerState]);

  useEffect(() => {
    return () => {
      persistCurrentTimerState();
    };
  }, [persistCurrentTimerState]);

  useEffect(() => {
    loadCompletedSets();
    loadTotalSets();
  }, [refreshing]);

  //Time loop
  useEffect(() => {
    if(!isRunning) return;

    const interval = setInterval(() => {
      refresh()
    }, 1000);

    return () => clearInterval(interval);
  }, [isRunning, isRunning, timer_start]);

  const computeCurrentElapsed = () => {
      if (!timer_start) return 0;

      return Math.floor(
          (Date.now() - timer_start) / 1000
      );
  };

  const updateElapsed = async () => {
      const newElapsed = Math.floor(
          elapsed_time + computeCurrentElapsed()
      );
      
      await workoutService.persistWorkoutTimerState(db, {
          workoutId: workout_id,
          timerStart: null,
          elapsedTime: newElapsed,
      });

      elapsedTimeRef.current = newElapsed;
      timerStartRef.current = null;
      set_elapsed_time(newElapsed);
      return newElapsed;
  };

  const startWorkout = async () => {
    const row = await workoutService.getWorkoutOriginalStartTime(db, workout_id);

    //Miliseconds since 1. januar 1970 at 00:00:00 UTC
    const start_time = Date.now();

    if(row.original_start_time === null){
        set_original_start_time(start_time);
        await workoutService.setWorkoutOriginalStartTime(db, {
            workoutId: workout_id,
            startTime: start_time,
        });
    } 

    await workoutService.persistWorkoutTimerState(db, {
      workoutId: workout_id,
      timerStart: start_time,
      elapsedTime: elapsed_time,
    });

    timerStartRef.current = start_time;
    set_isRunning(true);
    set_timer_start(start_time);
    Vibration.vibrate(500);
  };

  const pauseWorkout = async () => {
      const newElapsed = await updateElapsed();
      set_isRunning(false);
      set_timer_start(null);
      set_elapsed_time(newElapsed);
      Vibration.vibrate([0, 100, 100, 100]);
  };

  const endWorkout = async () => {
    const finalElapsed = timer_start ? await updateElapsed() : elapsed_time;

    set_isRunning(false);
    set_isDone(true);
    set_timer_start(null);
    set_elapsed_time(finalElapsed);
    
    await workoutService.setWorkoutDone(db, {
      workoutId: workout_id,
      done: true,
    });
  };

  const restartWorkout = async () => {
    await workoutService.resetWorkoutState(db, workout_id);
    set_original_start_time(null);
    set_timer_start(null);
    set_elapsed_time(0);
    set_isRunning(false);
    set_isDone(false);
    refresh();
  };

  const primaryColor = theme.primary ?? theme.iconColor ?? theme.text;
  const secondaryColor = theme.secondary ?? primaryColor;
  const cardSurface = theme.cardBackground ?? theme.background;
  const innerSurface = theme.uiBackground ?? cardSurface;
  const cardBorder = theme.cardBorder ?? theme.iconColor ?? theme.text;
  const titleColor = theme.title ?? theme.text;
  const quietText = theme.quietText ?? theme.iconColor ?? theme.text;
  const invertedText = theme.textInverted ?? theme.background ?? "#0E0F12";

  const currentElapsed = elapsed_time + computeCurrentElapsed();
  const resolvedTotalSets = Math.max(Number(totalSets) || 0, 0);
  const resolvedDoneSets = Math.max(Number(doneSets) || 0, 0);
  const progressPercent =
    resolvedTotalSets > 0
      ? Math.min(100, (resolvedDoneSets / resolvedTotalSets) * 100)
      : 0;

  const statusLabel = isDone
    ? "Complete"
    : isRunning
      ? "In progress"
      : original_start_time !== null
        ? "Paused"
        : "Ready";
  const statusTone = isDone ? secondaryColor : primaryColor;
  const statusBackground = isDone
    ? theme.secondaryLight ?? innerSurface
    : isRunning
      ? theme.primaryLight ?? innerSurface
      : innerSurface;
  const statusTextColor = isDone || isRunning ? invertedText : titleColor;
  const timerHint = isRunning
      ? "Timer is currently running"
      : original_start_time !== null
        ? "Resume whenever you are ready"
        : null;
  const startedDisplay =
    original_start_time !== null
      ? formatWorkoutStart(original_start_time)
      : "Not started yet";
  const progressCaption =
    resolvedTotalSets > 0
      ? `${Math.round(progressPercent)}% complete`
      : "No sets yet";

  return (
    <ThemedView style={{ flex: 1 }}>
      <ThemedKeyboardProtection scroll>
        <View style={styles.heroShell}>
          <ThemedCard
            style={[
              styles.heroCard,
              {
                backgroundColor: isDone
                  ? "rgba(96, 218, 172, 0.08)"
                  : cardSurface,
                borderColor: isDone
                  ? secondaryColor
                  : isRunning
                    ? primaryColor
                    : cardBorder,
              },
            ]}
          >
            <View
              pointerEvents="none"
              style={[
                styles.heroAccentPrimary,
                { backgroundColor: isDone ? secondaryColor : primaryColor },
              ]}
            />
            <View
              pointerEvents="none"
              style={[
                styles.heroAccentSecondary,
                { backgroundColor: secondaryColor },
              ]}
            />

            <View style={styles.heroContentRow}>
              <View style={styles.heroInfoColumn}>
                <View style={styles.heroStatusRow}>
                  <View
                    style={[
                      styles.heroStatusBadge,
                      {
                        backgroundColor: statusBackground,
                        borderColor: isDone || isRunning ? statusTone : cardBorder,
                      },
                    ]}
                  >
                    <ThemedText
                      style={styles.heroStatusBadgeText}
                      setColor={statusTextColor}
                    >
                      {statusLabel}
                    </ThemedText>
                  </View>
                </View>

                <ThemedText style={styles.heroTimerLabel} setColor={quietText}>
                  Elapsed time
                </ThemedText>
                <ThemedText style={styles.heroTimerValue} setColor={titleColor}>
                  {formatTime(currentElapsed)}
                </ThemedText>
                {timerHint ? (
                  <ThemedText style={styles.heroTimerHint} setColor={quietText}>
                    {timerHint}
                  </ThemedText>
                ) : null}

                <View style={styles.heroMetaRow}>
                  <View
                    style={[
                      styles.heroMetaCard,
                      {
                        backgroundColor: innerSurface,
                        borderColor: cardBorder,
                      },
                    ]}
                  >
                    <ThemedText style={styles.heroMetaLabel} setColor={quietText}>
                      Started
                    </ThemedText>
                    <ThemedText style={styles.heroMetaValue} setColor={titleColor}>
                      {startedDisplay}
                    </ThemedText>
                  </View>
                </View>
              </View>

              <View style={styles.heroProgressColumn}>
                <CircularProgression
                  size={136}
                  strokeWidth={12}
                  text={`${resolvedDoneSets}/${resolvedTotalSets}`}
                  textSize={24}
                  label="Sets"
                  caption={progressCaption}
                  progressPercent={progressPercent}
                  bgColor={innerSurface}
                  pgColor={isDone ? secondaryColor : primaryColor}
                  centerColor={cardSurface}
                />
              </View>
            </View>

            <View style={styles.heroActionsRow}>
              {!isRunning && !isDone && (
                <View
                  style={[
                    styles.heroActionSlot,
                    original_start_time !== null && styles.heroActionSlotSpaced,
                  ]}
                >
                  <ThemedButton
                    title={original_start_time !== null ? "Continue" : "Start"}
                    onPress={startWorkout}
                    variant="primary"
                    disabled={isDone || isRunning}
                    style={styles.heroActionButton}
                  />
                </View>
              )}

              {!isRunning && !isDone && original_start_time !== null && (
                <View style={styles.heroActionSlot}>
                  <ThemedButton
                    title="Finish"
                    onPress={endWorkout}
                    variant="secondary"
                    disabled={original_start_time === null || isDone}
                    style={styles.heroActionButton}
                  />
                </View>
              )}

              {isRunning && (
                <View style={styles.heroActionSlot}>
                  <ThemedButton
                    title="Pause"
                    onPress={pauseWorkout}
                    variant="primary"
                    disabled={!isRunning || isDone}
                    style={styles.heroActionButton}
                  />
                </View>
              )}

              {isDone && (
                <View style={styles.heroActionSlot}>
                  <ThemedButton
                    title="Restart"
                    onPress={restartWorkout}
                    variant="danger"
                    disabled={original_start_time === null || !isDone}
                    style={styles.heroActionButton}
                  />
                </View>
              )}
            </View>
          </ThemedCard>
        </View>

        <View style={styles.toolbar}>
          <TouchableOpacity
            style={[
              styles.toolbarButton,
              {
                backgroundColor: innerSurface,
                borderColor: cardBorder,
              },
            ]}
            onPress={() => {
              setExpansionAction({
                type: "expand",
                key: Date.now(),
              });
            }}
          >
            <ArrowDoubleDown width={24} height={24} color={primaryColor} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.toolbarButton,
              {
                backgroundColor: innerSurface,
                borderColor: cardBorder,
              },
            ]}
            onPress={() => {
              setExpansionAction({
                type: "collapse",
                key: Date.now(),
              });
            }}
          >
            <ArrowDoubleUp width={24} height={24} color={primaryColor} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.toolbarButton,
              {
                backgroundColor: innerSurface,
                borderColor: cardBorder,
              },
            ]}
            onPress={() => {
              setFilterBottomsheetVisible(true);
            }}
          >
            <Filter width={24} height={24} color={primaryColor} />
          </TouchableOpacity>
        </View>

        <View style={styles.workingSets}>
          <ExerciseList
            workout_id={workout_id}
            refreshing={refreshing}
            updateUI={refresh}
            showCompletedExercises={showCompletedExercises}
            expansionAction={expansionAction}
          />
        </View>

      </ThemedKeyboardProtection>

      <ThemedBottomSheet
        visible={filterBottomsheetVisible}
        onClose={() => setFilterBottomsheetVisible(false)}
      >
        <View style={pageStyles.bottomsheetTitle}>
          <ThemedText>Filter exercises</ThemedText>
        </View>

        <View style={pageStyles.bottomsheetBody}>
          <TouchableOpacity
            style={[pageStyles.option, pageStyles.filterOption]}
            onPress={() => {
              setShowCompletedExercises((prev) => !prev);
            }}
          >
            <ThemedText style={pageStyles.filterOptionText}>
              Show completed exercises
            </ThemedText>

            {showCompletedExercises && (
              <Checkmark
                width={24}
                height={24}/>
            )}
          </TouchableOpacity>
        </View>
      </ThemedBottomSheet>
    </ThemedView>
  );
}

export default StrengthTraining;
