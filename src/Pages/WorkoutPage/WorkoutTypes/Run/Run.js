import { Alert, AppState, TouchableOpacity, View, Vibration } from "react-native";
import { useState, useCallback, useEffect, useRef } from "react";
import { useSQLiteContext } from "expo-sqlite";
import { useFocusEffect } from "@react-navigation/native";
import { useColorScheme } from "react-native";

import RunSetList from "./RunSetList";
import Plus from "../../../../Resources/Icons/UI-icons/Plus";
import { Colors } from "../../../../Resources/GlobalStyling/colors";
import {
  ThemedCard,
  ThemedView,
  ThemedText,
  ThemedButton,
  ThemedKeyboardProtection,
} from "../../../../Resources/ThemedComponents";
import styles from "./RunStyle";

import { formatTime, formatWorkoutStart } from "../../../../Utils/timeUtils";
import {
  locationService,
  runningService as runningRepository,
  workoutService as workoutRepository,
} from "../../../../Services";

const TYPE_LABELS = {
  WARMUP: "Warmup",
  WORKING_SET: "Run block",
  COOLDOWN: "Cooldown",
};

const parsePaceToMinutes = (value) => {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  const normalized = String(value)
    .trim()
    .replace(",", ".")
    .replace(/[’′]/g, "'")
    .replace(/[”″]/g, "")
    .replace(/\s+/g, "");

  const splitMatch = normalized.match(/^(\d+)[\:'](\d{1,2})$/);

  if (splitMatch) {
    const minutes = Number(splitMatch[1]);
    const seconds = Number(splitMatch[2]);

    if (Number.isFinite(minutes) && Number.isFinite(seconds)) {
      return minutes + seconds / 60;
    }
  }

  const numericValue = Number(normalized.replace(/[^0-9.]/g, ""));
  return Number.isFinite(numericValue) ? numericValue : null;
};

const formatPaceDisplay = (paceMinutes) => {
  if (!Number.isFinite(paceMinutes) || paceMinutes <= 0) {
    return "--'--''";
  }

  const totalSeconds = Math.round(paceMinutes * 60);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return `${minutes}'${String(seconds).padStart(2, "0")}`;
};

const Run = ({ workout_id }) => {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme] ?? Colors.light;
  const db = useSQLiteContext();

  const [updateCount, set_updateCount] = useState(0);
  const triggerReload = () => {
    set_updateCount((prev) => prev + 1);
  };

  const [warmupEmpty, set_WarmupEmpty] = useState(true);
  const [workingEmpty, set_WorkingEmpty] = useState(true);
  const [cooldownEmpty, set_CooldownEmpty] = useState(true);

  const [original_start_time, set_original_start_time] = useState(null);
  const [timer_start, set_timer_start] = useState(null);
  const [elapsed_time, set_elapsed_time] = useState(0);
  const [isDone, set_isDone] = useState(false);
  const [isRunning, set_isRunning] = useState(false);
  const [totalDistance, set_totalDistance] = useState(0);

  const [activeSet, set_activeSet] = useState(null);
  const [activeSet_remainingTime, set_activeSet_remainingTime] = useState(0);
  const [activeSetDetails, set_activeSetDetails] = useState(null);

  const previousActiveSetRef = useRef(null);
  const timerStartRef = useRef(null);
  const elapsedTimeRef = useRef(0);

  useEffect(() => {
    timerStartRef.current = timer_start;
  }, [timer_start]);

  useEffect(() => {
    elapsedTimeRef.current = elapsed_time;
  }, [elapsed_time]);

  const persistCurrentTimerState = useCallback(async () => {
    await workoutRepository.persistWorkoutTimerState(db, {
      workoutId: workout_id,
      timerStart: timerStartRef.current,
      elapsedTime: elapsedTimeRef.current,
    });
  }, [db, workout_id]);

  const stopRunTrackingSafely = useCallback(async () => {
    try {
      await locationService.stopRunTracking(db);
    } catch (error) {
      console.error("Failed to stop run tracking cleanly:", error);
    }
  }, [db]);

  const clearActiveSegment = () => {
    previousActiveSetRef.current = null;
    set_activeSet(null);
    set_activeSet_remainingTime(0);
    set_activeSetDetails(null);
  };

  const loadTrackedRunSummary = useCallback(async () => {
    try {
      const summary = await locationService.getTrackedRunSummary(db, workout_id);
      set_totalDistance(summary.totalDistanceKm);
    } catch (error) {
      console.error("Failed to load tracked run summary:", error);
    }
  }, [db, workout_id]);

  const computeCurrentElapsed = () => {
    if (!timer_start) return 0;

    return Math.floor((Date.now() - timer_start) / 1000);
  };

  const calculateActiveSet = async (currentElapsed) => {
    const sets = await runningRepository.getOrderedRunSetsForWorkout(db, workout_id);

    if (!sets.length) {
      clearActiveSegment();
      return;
    }

    let remainingElapsed = currentElapsed;

    for (let i = 0; i < sets.length; i++) {
      const setDuration = (sets[i].time ?? 0) * 60;

      if (remainingElapsed >= setDuration) {
        if (!sets[i].done) {
          await runningRepository.updateRunSetDone(db, {
            runId: sets[i].Run_id,
            done: true,
          });
        }
        remainingElapsed -= setDuration;
        continue;
      }

      const newActiveSet = sets[i].Run_id;

      if (previousActiveSetRef.current !== newActiveSet) {
        previousActiveSetRef.current = newActiveSet;

        if (sets[i].is_pause) {
          Vibration.vibrate([0, 100, 100, 100]);
        } else {
          Vibration.vibrate(500);
        }
      }

      set_activeSet(newActiveSet);
      set_activeSetDetails(sets[i]);
      set_activeSet_remainingTime(Math.max(0, setDuration - remainingElapsed));
      return;
    }

    clearActiveSegment();
  };

  useFocusEffect(
    useCallback(() => {
      const reload = async () => {
        try {
          await locationService.syncRunTrackingState(db);
        } catch (error) {
          console.warn("Unable to sync run tracking state:", error);
        }

        const row = await workoutRepository.getWorkoutTimerState(db, workout_id);
        const nextIsDone = Number(row.done) === 1;
        const currentElapsed =
          row.elapsed_time +
          (row.timer_start
            ? Math.floor((Date.now() - row.timer_start) / 1000)
            : 0);

        set_isRunning(row.timer_start !== null && !nextIsDone);
        set_isDone(nextIsDone);
        set_original_start_time(row.original_start_time);
        set_timer_start(row.timer_start);
        set_elapsed_time(row.elapsed_time);

        if (row.original_start_time !== null && !nextIsDone) {
          await calculateActiveSet(currentElapsed);
        } else {
          clearActiveSegment();
        }

        if (row.timer_start !== null && !nextIsDone) {
          try {
            await locationService.ensureRunTracking(db, workout_id);
          } catch (error) {
            console.warn("Unable to ensure location tracking:", error);
          }
        }

        await loadTrackedRunSummary();
      };

      reload();
    }, [db, workout_id, loadTrackedRunSummary])
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
    if (original_start_time === null || isDone) {
      clearActiveSegment();
      return;
    }

    calculateActiveSet(isRunning ? elapsed_time + computeCurrentElapsed() : elapsed_time);
  }, [updateCount, original_start_time, isDone]);

  useEffect(() => {
    loadTrackedRunSummary();
  }, [loadTrackedRunSummary, updateCount]);

  useEffect(() => {
    if (!isRunning) return;

    const interval = setInterval(() => {
      const currentTime = computeCurrentElapsed();
      calculateActiveSet(elapsed_time + currentTime);
    }, 1000);

    return () => clearInterval(interval);
  }, [timer_start, isRunning, workout_id, elapsed_time]);

  useEffect(() => {
    if (!isRunning) {
      return;
    }

    const interval = setInterval(() => {
      loadTrackedRunSummary();
    }, 2000);

    return () => clearInterval(interval);
  }, [isRunning, loadTrackedRunSummary]);

  const updateElapsed = async () => {
    const newElapsed = Math.floor(elapsed_time + computeCurrentElapsed());

    await workoutRepository.persistWorkoutTimerState(db, {
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
    try {
      const row = await workoutRepository.getWorkoutOriginalStartTime(db, workout_id);
      const start_time = Date.now();
      const isFreshStart = row.original_start_time === null;

      if (isFreshStart) {
        await workoutRepository.setWorkoutOriginalStartTime(db, {
          workoutId: workout_id,
          startTime: start_time,
        });
      }

      await workoutRepository.persistWorkoutTimerState(db, {
        workoutId: workout_id,
        timerStart: start_time,
        elapsedTime: elapsed_time,
      });

      try {
        await locationService.startRunTracking(db, workout_id, {
          resetLogs: isFreshStart,
        });
      } catch (trackingError) {
        await workoutRepository.persistWorkoutTimerState(db, {
          workoutId: workout_id,
          timerStart: null,
          elapsedTime: elapsed_time,
        });

        if (isFreshStart) {
          await workoutRepository.setWorkoutOriginalStartTime(db, {
            workoutId: workout_id,
            startTime: null,
          });
        }

        throw trackingError;
      }

      Vibration.vibrate(500);
      if (isFreshStart) {
        set_original_start_time(start_time);
      }
      timerStartRef.current = start_time;
      set_isRunning(true);
      set_timer_start(start_time);
      await loadTrackedRunSummary();
    } catch (error) {
      console.error("Failed to start run tracking:", error);
      Alert.alert(
        "Location tracking could not start",
        "Check that location is allowed and turned on, then try again."
      );
    }
  };

  const pauseWorkout = async () => {
    const newElapsed = await updateElapsed();
    await stopRunTrackingSafely();

    Vibration.vibrate([0, 100, 100, 100]);
    set_isRunning(false);
    set_timer_start(null);
    set_elapsed_time(newElapsed);
    await calculateActiveSet(newElapsed);
    await loadTrackedRunSummary();
  };

  const endWorkout = async () => {
    const finalElapsed = timer_start ? await updateElapsed() : elapsed_time;
    await stopRunTrackingSafely();

    set_isRunning(false);
    set_isDone(true);
    set_timer_start(null);
    set_elapsed_time(finalElapsed);
    clearActiveSegment();

    await workoutRepository.setWorkoutDone(db, {
      workoutId: workout_id,
      done: true,
    });

    await loadTrackedRunSummary();
  };

  const restartWorkout = async () => {
    await stopRunTrackingSafely();
    await locationService.clearTrackedRunData(db, workout_id);
    await workoutRepository.resetWorkoutState(db, workout_id);
    set_original_start_time(null);
    set_timer_start(null);
    set_elapsed_time(0);
    set_isRunning(false);
    set_isDone(false);
    set_totalDistance(0);
    clearActiveSegment();
    triggerReload();
  };

  const addSet = async (setVariety) => {
    try {
      await runningRepository.addRunSet(db, {
        workoutId: workout_id,
        type: setVariety,
      });
      triggerReload();
    } catch (error) {
      console.error("Failed to add run set:", error);
    }
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
  const avgPaceMinutes =
    totalDistance > 0 ? currentElapsed / 60 / totalDistance : null;
  const startedDisplay =
    original_start_time !== null
      ? formatWorkoutStart(original_start_time)
      : "Not started yet";

  const formattedTotalDistance = `${Number(totalDistance.toFixed(2)).toString()} km`;
  const avgPaceDisplay = formatPaceDisplay(avgPaceMinutes);

  const activeSegmentMeta = activeSetDetails
    ? [
        activeSetDetails.is_pause
          ? "Recovery block"
          : `Set ${activeSetDetails.set_number}`,
        activeSetDetails.distance ? `${activeSetDetails.distance} km` : null,
        activeSetDetails.time ? `${activeSetDetails.time} min` : null,
      ]
        .filter(Boolean)
        .join(" • ")
    : isDone
      ? "All planned run blocks finished"
      : original_start_time === null
        ? "Build your run below and start when ready"
        : "Current block is waiting to resume";

  const sectionConfigs = [
    {
      type: "WARMUP",
      title: "Warmup",
      badge: "Warmup",
      accent: quietText,
      badgeBackground: innerSurface,
      badgeTextColor: titleColor,
      emptySetter: set_WarmupEmpty,
      isEmpty: warmupEmpty,
    },
    {
      type: "WORKING_SET",
      title: "Working Sets",
      badge: "Main Work",
      accent: primaryColor,
      badgeBackground: theme.primaryLight ?? innerSurface,
      badgeTextColor: invertedText,
      titleColor: primaryColor,
      emptySetter: set_WorkingEmpty,
      isEmpty: workingEmpty,
    },
    {
      type: "COOLDOWN",
      title: "Cooldown",
      badge: "Cooldown",
      accent: quietText,
      badgeBackground: innerSurface,
      badgeTextColor: titleColor,
      titleColor: titleColor,
      emptySetter: set_CooldownEmpty,
      isEmpty: cooldownEmpty,
    },
  ];

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
                <View style={styles.heroTimerBlock}>
                  <ThemedText style={styles.heroTimerLabel} setColor={quietText}>
                    Elapsed time
                  </ThemedText>
                  <ThemedText style={styles.heroTimerValue} setColor={titleColor}>
                    {formatTime(currentElapsed)}
                  </ThemedText>
                </View>

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

              <View style={styles.heroLiveColumn}>
                <View
                  style={[
                    styles.heroLiveCard,
                    {
                      backgroundColor: innerSurface,
                      borderColor: isRunning ? primaryColor : cardBorder,
                    },
                  ]}
                >
                  <ThemedText style={styles.heroLiveLabel} setColor={quietText}>
                    Total Distance
                  </ThemedText>
                  <ThemedText style={styles.heroLiveValue} setColor={titleColor}>
                    {formattedTotalDistance}
                  </ThemedText>
                </View>

                <View
                  style={[
                    styles.heroLiveSubCard,
                    {
                      backgroundColor: innerSurface,
                      borderColor: cardBorder,
                    },
                  ]}
                >
                  <ThemedText style={styles.heroLiveLabel} setColor={quietText}>
                    Avg Pace
                  </ThemedText>
                  <ThemedText style={styles.heroLiveSubValue} setColor={titleColor}>
                    {avgPaceDisplay}
                  </ThemedText>
                </View>
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
                    title="Finish Run"
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

        {sectionConfigs.map((section) => (
          <View key={section.type} style={styles.sectionShell}>
            <ThemedCard
              style={[
                styles.sectionCard,
                {
                  backgroundColor: cardSurface,
                  borderColor:
                    section.isEmpty || section.type === "COOLDOWN"
                      ? cardBorder
                      : section.accent,
                },
              ]}
            >
              <View style={styles.sectionHeader}>
                <View style={styles.sectionTitleBlock}>
                  <View
                    style={[
                      styles.sectionBadge,
                      {
                        backgroundColor: section.badgeBackground,
                        borderColor:
                          section.isEmpty || section.type === "COOLDOWN"
                            ? cardBorder
                            : section.accent,
                      },
                    ]}
                  >
                    <ThemedText
                      style={styles.sectionBadgeText}
                      setColor={section.badgeTextColor}
                    >
                      {section.badge}
                    </ThemedText>
                  </View>
                  <ThemedText
                    style={styles.sectionTitle}
                    setColor={
                      section.isEmpty
                        ? quietText
                        : section.titleColor ?? titleColor
                    }
                  >
                    {section.title}
                  </ThemedText>
                </View>

                <TouchableOpacity
                  style={[
                    styles.sectionAddButton,
                    {
                      backgroundColor: innerSurface,
                      borderColor:
                        section.isEmpty || section.type === "COOLDOWN"
                          ? cardBorder
                          : section.accent,
                      opacity: section.isEmpty ? 0.7 : 1,
                    },
                  ]}
                  onPress={() => addSet(section.type)}
                >
                  <Plus width={20} height={20} color={section.accent} />
                </TouchableOpacity>
              </View>

              <RunSetList
                reloadKey={updateCount}
                triggerReload={triggerReload}
                empty={section.emptySetter}
                workout_id={workout_id}
                type={section.type}
                activeSet={activeSet}
                activeSet_remainingTime={activeSet_remainingTime}
              />
            </ThemedCard>
          </View>
        ))}
      </ThemedKeyboardProtection>
    </ThemedView>
  );
};

export default Run;
