import { useEffect, useState } from "react";
import { TouchableOpacity, View } from "react-native";
import { useColorScheme } from "react-native";
import { useSQLiteContext } from "expo-sqlite";

import { Colors } from "../../../../../../../../Resources/GlobalStyling/colors";
import styles from "./ExerciseRowStyle";
import SetList from "./SetList/SetList";
import { formatExerciseSetSummary } from "../../Utils/checkUniformSets";

import Cogwheel from "../../../../../../../../Resources/Icons/UI-icons/Cogwheel";
import Note from "../../../../../../../../Resources/Icons/UI-icons/Note";
import Expand from "../../../../../../../../Resources/Icons/UI-icons/Expand";
import Plus from "../../../../../../../../Resources/Icons/UI-icons/Plus";
import Colapse from "../../../../../../../../Resources/Icons/UI-icons/Colapse";

import {
  ThemedBouncyCheckbox,
  ThemedModal,
  ThemedText,
  ThemedTitle,
} from "../../../../../../../../Resources/ThemedComponents";
import PanelSettingsModal from "./PanelSettingsModal";
import { weightliftingService as weightliftingRepository } from "../../../../../../../../Services";

const ExerciseRow = ({
  exercise,
  isExpanded,
  onToggleExpanded,
  updateUI,
  onToggleSet,
  updateWeight,
}) => {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme] ?? Colors.light;

  const [visibleColumns, setVisibleColumns] = useState(exercise.visibleColumns);
  const [exerciseNote, setExerciseNote] = useState(exercise.note ?? "");
  const [panelModalVisible, setPanelModalVisible] = useState(false);
  const [noteModalVisible, setNoteModalVisible] = useState(false);

  const db = useSQLiteContext();

  useEffect(() => {
    setVisibleColumns(exercise.visibleColumns);
  }, [exercise.visibleColumns]);

  useEffect(() => {
    setExerciseNote(exercise.note ?? "");
  }, [exercise.note]);

  const deleteExercise = async (exerciseId) => {
    try {
      await weightliftingRepository.deleteExercise(db, exerciseId);
      updateUI?.();
    } catch (error) {
      console.error(error);
    }
  };

  const addSet = async () => {
    try {
      await weightliftingRepository.addSetToExercise(db, exercise.exercise_id);
      updateUI?.();
    } catch (error) {
      console.error(error);
    }
  };

  const saveExerciseSettings = async ({ columns, note }) => {
    await weightliftingRepository.updateExerciseVisibleColumns(db, {
      exerciseId: exercise.exercise_id,
      columns,
    });
    await weightliftingRepository.updateExerciseNote(db, {
      exerciseId: exercise.exercise_id,
      note,
    });

    setVisibleColumns(columns);
    setExerciseNote(note);
  };

  const isDone = Number(exercise.done) === 1;
  const hasSets = exercise.sets.length > 0;
  const hasNote = exerciseNote.trim().length > 0;

  const primaryColor = theme.primary ?? theme.iconColor ?? theme.text;
  const secondaryColor = theme.secondary ?? primaryColor;
  const cardBorder = theme.cardBorder ?? theme.iconColor ?? theme.text;
  const cardSurface = theme.cardBackground ?? theme.background;
  const innerSurface = theme.uiBackground ?? cardSurface;
  const quietText = theme.quietText ?? theme.iconColor ?? theme.text;
  const titleColor = theme.title ?? theme.text;

  const exerciseSummary = formatExerciseSetSummary(
    exercise.sets,
    exercise.setCount
  );

  return (
    <>
      <View
        style={[
          styles.exerciseCard,
          {
            backgroundColor: isDone ? "rgba(96, 218, 172, 0.1)" : cardSurface,
            borderColor: isDone ? secondaryColor : cardBorder,
          },
        ]}
      >
        <View style={styles.headerRow}>
          <TouchableOpacity
            activeOpacity={0.88}
            onPress={onToggleExpanded}
            style={styles.headerMain}
          >
            <View
              style={[
                styles.checkboxShell,
                {
                  backgroundColor: isDone ? secondaryColor : innerSurface,
                  borderColor: isDone ? secondaryColor : cardBorder,
                },
              ]}
            >
              <ThemedBouncyCheckbox
                value={isDone}
                size={20}
                edgeSize={2}
                disabled
                fillColor={secondaryColor}
                checkmarkColor={cardSurface}
                style={styles.checkbox}
              />
            </View>

            <View style={styles.titleBlock}>
              <ThemedTitle
                type="h3"
                style={[styles.exerciseTitle, { color: titleColor }]}
                numberOfLines={1}
              >
                {exercise.exercise_name}
              </ThemedTitle>

              <ThemedText
                size={11}
                style={styles.exerciseMeta}
                setColor={quietText}
              >
                {hasSets
                  ? `${exercise.setCount} ${exercise.setCount === 1 ? "set" : "sets"} planned`
                  : "No sets added yet"}
              </ThemedText>
            </View>
          </TouchableOpacity>

          <View style={styles.actionsRow}>
            {hasNote && (
              <TouchableOpacity
                activeOpacity={0.88}
                style={[
                  styles.actionButton,
                  {
                    backgroundColor: innerSurface,
                    borderColor: cardBorder,
                  },
                ]}
                onPress={() => setNoteModalVisible(true)}
              >
                <Note width={18} height={18} color={primaryColor} />
              </TouchableOpacity>
            )}

            <TouchableOpacity
              activeOpacity={0.88}
              style={[
                styles.actionButton,
                {
                  backgroundColor: innerSurface,
                  borderColor: cardBorder,
                },
              ]}
              onPress={addSet}
            >
              <Plus width={18} height={18} color={primaryColor} />
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.88}
              style={[
                styles.actionButton,
                {
                  backgroundColor: innerSurface,
                  borderColor: cardBorder,
                },
              ]}
              onPress={() => {
                setPanelModalVisible(true);
              }}
            >
              <Cogwheel width={18} height={18} color={primaryColor} />
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.88}
              style={[
                styles.actionButton,
                {
                  backgroundColor: innerSurface,
                  borderColor: cardBorder,
                },
              ]}
              onPress={onToggleExpanded}
            >
              {isExpanded ? (
                <Colapse width={18} height={18} color={primaryColor} />
              ) : (
                <Expand width={18} height={18} color={primaryColor} />
              )}
            </TouchableOpacity>
          </View>
        </View>

        {!isExpanded && (
          <TouchableOpacity
            activeOpacity={0.88}
            onPress={onToggleExpanded}
            style={[
              styles.summaryRow,
              {
                backgroundColor: innerSurface,
                borderColor: cardBorder,
              },
            ]}
          >
            <View style={styles.summaryTextBlock}>
              <ThemedText
                size={12}
                style={styles.summaryValue}
                setColor={hasSets ? undefined : quietText}
              >
                {exerciseSummary}
              </ThemedText>
            </View>

            <View style={styles.summaryIcon}>
              <Expand width={18} height={18} />
            </View>
          </TouchableOpacity>
        )}

        {isExpanded && (
          <View style={styles.expandedSection}>
            <SetList
              sets={exercise.sets}
              exerciseName={exercise.exercise_name}
              visibleColumns={visibleColumns}
              onToggleSet={onToggleSet}
              updateWeight={updateWeight}
              updateUI={updateUI}
            />
          </View>
        )}
      </View>

      <PanelSettingsModal
        visible={panelModalVisible}
        currentColumns={visibleColumns}
        currentNote={exerciseNote}
        onDelete={async () => {
          await deleteExercise(exercise.exercise_id);
          setPanelModalVisible(false);
        }}
        onClose={async ({ columns, note }) => {
          await saveExerciseSettings({ columns, note });
          setPanelModalVisible(false);
        }}
      />

      <ThemedModal
        visible={noteModalVisible}
        onClose={() => setNoteModalVisible(false)}
        title="Note"
      >
        <ThemedText>{exerciseNote}</ThemedText>
      </ThemedModal>
    </>
  );
};

export default ExerciseRow;
