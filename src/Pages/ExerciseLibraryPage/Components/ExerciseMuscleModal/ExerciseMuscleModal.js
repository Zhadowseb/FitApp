import { ActivityIndicator, ScrollView, View, useColorScheme } from "react-native";
import { useEffect, useState } from "react";

import styles from "./ExerciseMuscleModalStyle";
import { weightliftingService } from "../../../../Services";
import { Colors } from "../../../../Resources/GlobalStyling/colors";
import {
  ThemedButton,
  ThemedModal,
  ThemedText,
  ThemedTitle,
} from "../../../../Resources/ThemedComponents";

function formatActivationPercent(value) {
  const numericValue = Number(value) || 0;

  return Number.isInteger(numericValue)
    ? `${numericValue}%`
    : `${numericValue.toFixed(1)}%`;
}

export default function ExerciseMuscleModal({
  visible,
  exerciseName,
  onClose,
}) {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme] ?? Colors.light;
  const [muscles, set_muscles] = useState([]);
  const [loading, set_loading] = useState(false);
  const [errorMessage, set_errorMessage] = useState("");

  useEffect(() => {
    if (!visible || !exerciseName) {
      return;
    }

    let isMounted = true;

    const loadMuscles = async () => {
      set_loading(true);
      set_errorMessage("");

      try {
        const rows = await weightliftingService.getExerciseLibraryMuscleDetails(
          exerciseName
        );

        if (isMounted) {
          set_muscles(rows);
        }
      } catch (error) {
        if (isMounted) {
          set_muscles([]);
          set_errorMessage("Could not load muscle details right now.");
        }

        console.error("Error loading exercise muscle details", error);
      } finally {
        if (isMounted) {
          set_loading(false);
        }
      }
    };

    loadMuscles();

    return () => {
      isMounted = false;
    };
  }, [visible, exerciseName]);

  return (
    <ThemedModal
      visible={visible}
      onClose={onClose}
      title={exerciseName || "Exercise details"}
      style={styles.modal}
      contentStyle={styles.content}
    >
      <ThemedText
        style={styles.subtitle}
        setColor={theme.quietText ?? theme.iconColor ?? theme.text}
      >
        Muscle activation for this exercise
      </ThemedText>

      {loading ? (
        <View style={styles.feedbackState}>
          <ActivityIndicator
            size="small"
            color={theme.primary ?? theme.text}
          />
          <ThemedText
            style={styles.feedbackText}
            setColor={theme.quietText ?? theme.iconColor ?? theme.text}
          >
            Loading muscles...
          </ThemedText>
        </View>
      ) : errorMessage ? (
        <View style={styles.feedbackState}>
          <ThemedTitle type="h3" style={styles.feedbackTitle}>
            Something went wrong
          </ThemedTitle>
          <ThemedText
            style={styles.feedbackText}
            setColor={theme.quietText ?? theme.iconColor ?? theme.text}
          >
            {errorMessage}
          </ThemedText>
        </View>
      ) : muscles.length === 0 ? (
        <View style={styles.feedbackState}>
          <ThemedTitle type="h3" style={styles.feedbackTitle}>
            No muscles found
          </ThemedTitle>
          <ThemedText
            style={styles.feedbackText}
            setColor={theme.quietText ?? theme.iconColor ?? theme.text}
          >
            No muscle activation rows were found for this exercise yet.
          </ThemedText>
        </View>
      ) : (
        <ScrollView
          style={styles.list}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        >
          {muscles.map((muscle, index) => (
            <View
              key={`${muscle.muscle_id}-${muscle.activation_level}-${index}`}
              style={[
                styles.muscleRow,
                {
                  backgroundColor:
                    theme.uiBackground ??
                    theme.navBackground ??
                    theme.background,
                  borderColor:
                    theme.cardBorder ?? theme.iconColor ?? theme.text,
                },
              ]}
            >
              <View style={styles.muscleCopy}>
                <ThemedText style={styles.muscleNickname}>
                  {muscle.nickname}
                </ThemedText>
                <ThemedText
                  style={styles.muscleName}
                  setColor={theme.quietText ?? theme.iconColor ?? theme.text}
                >
                  {muscle.muscle_name}
                </ThemedText>
              </View>

              <View
                style={[
                  styles.percentBadge,
                  {
                    backgroundColor:
                      muscle.activation_level === "primary"
                        ? theme.secondaryLight ??
                          "rgba(96, 218, 172, 0.16)"
                        : theme.primaryLight ??
                          "rgba(247, 116, 46, 0.12)",
                  },
                ]}
              >
                <ThemedText
                  style={styles.percentText}
                  setColor={
                    muscle.activation_level === "primary"
                      ? theme.secondaryDark ?? theme.secondary ?? theme.text
                      : theme.primaryDark ?? theme.primary ?? theme.text
                  }
                >
                  {formatActivationPercent(muscle.activation_percent)}
                </ThemedText>
              </View>
            </View>
          ))}
        </ScrollView>
      )}

      <View style={styles.buttonRow}>
        <ThemedButton title="Close" variant="secondary" onPress={onClose} />
      </View>
    </ThemedModal>
  );
}
