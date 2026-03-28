import { useEffect, useState } from "react";
import { View, TouchableOpacity, useColorScheme } from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useNavigation } from "@react-navigation/native";
import { useSQLiteContext } from "expo-sqlite";
import { Colors } from "../../Resources/GlobalStyling/colors";

import styles from "./WorkoutPageStyle";
import {
  ThemedBottomSheet,
  ThemedHeader,
  ThemedText,
  ThemedTitle,
  ThemedView,
} from "../../Resources/ThemedComponents";
import ThreeDots from "../../Resources/Icons/UI-icons/ThreeDots";
import Delete from "../../Resources/Icons/UI-icons/Delete";
import Copy from "../../Resources/Icons/UI-icons/Copy";
import Reload from "../../Resources/Icons/UI-icons/Reload";
import { programService, workoutService } from "../../Services";

import Run from "./WorkoutTypes/Run/Run";
import StrengthTraining from "./WorkoutTypes/StrengthTraining/StrengthTraining";

const WorkoutPage = ({ route }) => {
  const db = useSQLiteContext();
  const navigation = useNavigation();
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme] ?? Colors.light;

  const {
    workout_id,
    workout_label: initialWorkoutLabel,
    day: initialDay,
    date: initialDate,
    program_id: initialProgramId,
  } = route.params;

  const [optionsBottomsheetVisible, setOptionsBottomsheetVisible] = useState(false);
  const [datePickerVisible, setDatePickerVisible] = useState(false);
  const [newDate, setNewDate] = useState(new Date());
  const [metadata, setMetadata] = useState(null);
  const [restartRequestKey, setRestartRequestKey] = useState(0);

  useEffect(() => {
    let cancelled = false;

    const loadMetadata = async () => {
      try {
        const nextMetadata = await workoutService.getWorkoutPageMetadata(db, workout_id);

        if (!cancelled) {
          setMetadata(nextMetadata);
        }
      } catch (error) {
        console.error("Failed to load workout metadata:", error);
      }
    };

    loadMetadata();

    return () => {
      cancelled = true;
    };
  }, [db, workout_id]);

  const workoutLabel = metadata?.workout_label ?? initialWorkoutLabel ?? "Workout";
  const workoutDay = metadata?.day ?? initialDay ?? "";
  const workoutDate = metadata?.date ?? initialDate ?? "";
  const programId = metadata?.program_id ?? initialProgramId;
  const workoutSubtitle = [workoutDay, workoutDate].filter(Boolean).join(" - ");
  const headerEyebrowColor = theme.quietText ?? theme.iconColor;
  const isRunWorkout = workoutLabel === "Run";
  const isStrengthWorkout =
    workoutLabel === "Resistance" ||
    workoutLabel === "Upperbody" ||
    workoutLabel === "Legs" ||
    workoutLabel === "StrengthTraining";
  const supportsTimerRestart = isRunWorkout || isStrengthWorkout;

  const deleteWorkout = async () => {
    try {
      await programService.deleteWorkout(db, workout_id);
      setOptionsBottomsheetVisible(false);
      navigation.goBack();
    } catch (error) {
      console.error("Failed to delete workout:", error);
    }
  };

  const copyWorkoutToDate = async (selectedDate) => {
    if (!programId) {
      console.error("Missing program_id for workout copy.");
      return;
    }

    try {
      const copiedWorkoutId = await programService.copyWorkoutToDate(db, {
        workoutId: workout_id,
        programId,
        date: selectedDate,
      });

      if (!copiedWorkoutId) {
        console.warn("No day found for date");
      }
    } catch (error) {
      console.error("Copy workout failed:", error);
    }
  };

  return (
    <ThemedView>
      <ThemedHeader
        right={
          <TouchableOpacity
            onPress={() => {
              setOptionsBottomsheetVisible(true);
            }}
          >
            <ThreeDots width={20} height={20} />
          </TouchableOpacity>
        }
      >
        <View style={styles.pageHeaderTitleGroup}>
          <ThemedText
            size={10}
            style={[
              styles.pageHeaderTitleEyebrow,
              { color: headerEyebrowColor },
            ]}
          >
            Workout
          </ThemedText>

          <ThemedTitle
            type="h3"
            style={styles.pageHeaderTitleMain}
            numberOfLines={1}
          >
            {workoutLabel}
          </ThemedTitle>

          {!!workoutSubtitle && (
            <ThemedText
              size={10}
              style={[styles.pageHeaderTitleMeta, { color: headerEyebrowColor }]}
            >
              {workoutSubtitle}
            </ThemedText>
          )}
        </View>
      </ThemedHeader>

      {isRunWorkout && (
        <Run workout_id={workout_id} restartRequestKey={restartRequestKey} />
      )}

      {isStrengthWorkout && (
        <StrengthTraining
          workout_id={workout_id}
          date={workoutDate}
          restartRequestKey={restartRequestKey}
        />
      )}

      <ThemedBottomSheet
        visible={optionsBottomsheetVisible}
        onClose={() => setOptionsBottomsheetVisible(false)}
      >
        <View style={styles.bottomsheetTitle}>
          <ThemedText>{workoutLabel}</ThemedText>
          <ThemedText>{workoutSubtitle}</ThemedText>
        </View>

        <View style={styles.bottomsheetBody}>
          {supportsTimerRestart && (
            <TouchableOpacity
              style={[styles.option, { paddingTop: 0 }]}
              onPress={() => {
                setOptionsBottomsheetVisible(false);
                setRestartRequestKey(Date.now());
              }}
            >
              <Reload width={24} height={24} />
              <ThemedText style={styles.optionText}>Restart Workout</ThemedText>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={[
              styles.option,
              { paddingTop: supportsTimerRestart ? 20 : 0 },
            ]}
            onPress={() => {
              setOptionsBottomsheetVisible(false);
              setDatePickerVisible(true);
            }}
          >
            <Copy width={24} height={24} />
            <ThemedText style={styles.optionText}>
              Copy workout to a different day
            </ThemedText>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.option}
            onPress={async () => {
              await deleteWorkout();
            }}
          >
            <Delete width={24} height={24} />
            <ThemedText style={styles.optionText}>Delete Workout</ThemedText>
          </TouchableOpacity>
        </View>
      </ThemedBottomSheet>

      {datePickerVisible && (
        <DateTimePicker
          value={newDate}
          mode="date"
          display="default"
          onChange={async (event, selectedDate) => {
            setDatePickerVisible(false);

            if (event.type !== "set" || !selectedDate) {
              return;
            }

            setNewDate(selectedDate);
            await copyWorkoutToDate(selectedDate);
          }}
        />
      )}
    </ThemedView>
  );
};

export default WorkoutPage;
