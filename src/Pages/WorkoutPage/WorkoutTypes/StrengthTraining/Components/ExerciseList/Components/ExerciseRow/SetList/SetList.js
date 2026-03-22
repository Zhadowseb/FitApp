import { TouchableOpacity, View } from "react-native";
import { useColorScheme } from "react-native";
import { useEffect, useState } from "react";
import { useSQLiteContext } from "expo-sqlite";
import { Colors } from "../../../../../../../../../Resources/GlobalStyling/colors";

import styles from "./SetListStyle";
import Title from "./Title";

import {
  ThemedBouncyCheckbox,
  ThemedBottomSheet,
  ThemedCard,
  ThemedEditableCell,
  ThemedModal,
  ThemedText,
  ThemedTextInput,
} from "../../../../../../../../../Resources/ThemedComponents";
import Cross from "../../../../../../../../../Resources/Icons/UI-icons/Cross";
import Delete from "../../../../../../../../../Resources/Icons/UI-icons/Delete";
import Note from "../../../../../../../../../Resources/Icons/UI-icons/Note";
import Amrap from "../../../../../../../../../Resources/Icons/UI-icons/Amrap";
import { weightliftingService as weightliftingRepository } from "../../../../../../../../../Services";

const SetList = ({
  sets,
  exerciseName,
  visibleColumns,
  onToggleSet,
  updateUI,
}) => {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme] ?? Colors.light;

  const db = useSQLiteContext();
  const [localSets, setLocalSets] = useState(sets);

  const [setOptionsVisible, setSetOptionsVisible] = useState(false);
  const [selectedSet, set_selectedSet] = useState(null);
  const [selectedSetNote, setSelectedSetNote] = useState("");
  const [noteModalVisible, setNoteModalVisible] = useState(false);
  const [noteModalText, setNoteModalText] = useState("");

  useEffect(() => {
    setLocalSets(sets);
  }, [sets]);

  if (!localSets || localSets.length === 0) {
    return null;
  }

  const columnConfig = [
    { key: "note", style: styles.note, flexValue: 1 },
    { key: "rest", style: styles.pause, flexValue: 20 },
    { key: "set", style: styles.set, flexValue: 8 },
    { key: "reps", style: styles.reps, flexValue: 13 },
    { key: "rpe", style: styles.rpe, flexValue: 9 },
    { key: "rm_percentage", style: styles.rm_percentage, flexValue: 14 },
    { key: "weight", style: styles.weight, flexValue: 20 },
    { key: "done", style: styles.done, flexValue: 14 },
  ];

  const activeColumns = columnConfig.filter((col) => visibleColumns[col.key]);

  const getRenderedColumns = (set) => {
    if (set.amrap !== 1 || !visibleColumns.reps) {
      return activeColumns;
    }

    const renderedColumns = [];

    for (const column of activeColumns) {
      if (column.key === "rpe") {
        continue;
      }

      if (column.key === "reps") {
        renderedColumns.push({
          ...column,
          mergedStyle: {
            flex:
              column.flexValue +
              (visibleColumns.rpe ? 9 : 0),
          },
        });
        continue;
      }

      renderedColumns.push(column);
    }

    return renderedColumns;
  };

  const parsePauseValue = (value) => {
    if (value === null || value === undefined || value === "") {
      return null;
    }

    const parsedValue = Number(value);

    return Number.isFinite(parsedValue) ? parsedValue : null;
  };

  const formatPauseDisplay = (value) => {
    const pauseValue = parsePauseValue(value);

    if (pauseValue === null) {
      return "";
    }

    if (pauseValue < 120) {
      return pauseValue.toString();
    }

    const minutes = pauseValue / 60;

    if (Number.isInteger(minutes)) {
      return minutes.toString();
    }

    return Number(minutes.toFixed(2)).toString();
  };

  const getPauseSuffix = (value) => {
    const pauseValue = parsePauseValue(value);

    if (pauseValue === null) {
      return "";
    }

    return pauseValue < 120 ? "sec" : "min";
  };

  const deleteSet = async (setId) => {
    await weightliftingRepository.deleteSet(db, setId);
    updateUI();
  };

  const updateField = async (field, value, setId) => {
    const nextValue =
      field === "note"
        ? value === "" ? null : value
        : value === "" ? null : Number(value);

    setLocalSets((prev) =>
      prev.map((set) =>
        set.sets_id === setId ? { ...set, [field]: nextValue } : set
      )
    );

    set_selectedSet((prev) =>
      prev?.sets_id === setId ? { ...prev, [field]: nextValue } : prev
    );

    await weightliftingRepository.updateSetField(db, {
      field,
      value: nextValue,
      setId,
    });

    updateUI();
  };

  const updateRmPercentage = async (value, setId) => {
    const result = await weightliftingRepository.updateSetRmPercentage(db, {
      setId,
      rmPercentage: value,
    });

    setLocalSets((prev) =>
      prev.map((set) => {
        if (set.sets_id !== setId) {
          return set;
        }

        return {
          ...set,
          rm_percentage: result.rmPercentage,
          ...(result.weightUpdated ? { weight: result.weight } : {}),
        };
      })
    );

    set_selectedSet((prev) =>
      prev?.sets_id === setId
        ? {
            ...prev,
            rm_percentage: result.rmPercentage,
            ...(result.weightUpdated ? { weight: result.weight } : {}),
          }
        : prev
    );

    updateUI();
  };

  const updateWeight = async (value, setId) => {
    const result = await weightliftingRepository.updateSetWeight(db, {
      setId,
      weight: value,
    });

    setLocalSets((prev) =>
      prev.map((set) =>
        set.sets_id === setId
          ? {
              ...set,
              weight: result.weight,
              rm_percentage: result.rmPercentage,
            }
          : set
      )
    );

    set_selectedSet((prev) =>
      prev?.sets_id === setId
        ? {
            ...prev,
            weight: result.weight,
            rm_percentage: result.rmPercentage,
          }
        : prev
    );

    updateUI();
  };

  const handleOpenSetOptions = (set) => {
    set_selectedSet(set);
    setSelectedSetNote(set.note ?? "");
    setSetOptionsVisible(true);
  };

  const persistSelectedSetNote = async () => {
    if (!selectedSet) {
      return;
    }

    const currentNote = selectedSet.note ?? "";

    if (selectedSetNote === currentNote) {
      return;
    }

    await updateField("note", selectedSetNote, selectedSet.sets_id);
  };

  const handleCloseSetOptions = async () => {
    await persistSelectedSetNote();
    setSetOptionsVisible(false);
  };

  const renderCellContent = (key, set) => {
    switch (key) {
      case "note":
        return set.note ? (
          <TouchableOpacity
            style={styles.note_button}
            onPress={() => {
              setNoteModalText(set.note);
              setNoteModalVisible(true);
            }}
          >
            <Note width={18} height={18} />
          </TouchableOpacity>
        ) : null;

      case "rest":
        return (
          <ThemedEditableCell
            value={set.pause?.toString() ?? ""}
            displayFormatter={formatPauseDisplay}
            suffixFormatter={getPauseSuffix}
            onCommit={(value) => updateField("pause", value, set.sets_id)}
          />
        );

      case "set":
        return (
          <TouchableOpacity
            style={{
              justifyContent: "center",
              alignItems: "center",
              width: "100%",
              height: "100%",
              borderTopWidth: 2,
              borderLeftWidth: 2,
              borderBottomWidth: 3,
              borderRightWidth: 3,
              backgroundColor: "rgb(32, 30, 29)",
              borderTopColor: "rgb(106, 100, 98)",
              borderLeftColor: "rgb(106, 100, 98)",
              borderBottomColor: "rgb(8, 7, 7)",
              borderRightColor: "rgb(8, 7, 7)",
            }}
            onPress={() => handleOpenSetOptions(set)}
          >
            <ThemedText
              style={styles.set_chip_text}
              setColor={theme.primary ?? theme.text}
            >
              {set.set_number}
            </ThemedText>
          </TouchableOpacity>
        );

      case "reps":
        return (
          <ThemedEditableCell
            value={set.reps?.toString() ?? ""}
            suffix={set.amrap === 1 ? "AMRAP" : ""}
            showSuffixWhenEmpty={set.amrap === 1}
            onCommit={(value) => updateField("reps", value, set.sets_id)}
          />
        );

      case "rpe":
        return (
          <ThemedEditableCell
            value={set.rpe?.toString() ?? ""}
            onCommit={(value) => updateField("rpe", value, set.sets_id)}
          />
        );

      case "rm_percentage":
        return (
          <ThemedEditableCell
            value={set.rm_percentage?.toString() ?? ""}
            suffix="%"
            onCommit={(value) => updateRmPercentage(value, set.sets_id)}
          />
        );

      case "weight":
        return (
          <ThemedEditableCell
            value={set.weight?.toString() ?? ""}
            suffix="kg"
            onCommit={(value) => updateWeight(value, set.sets_id)}
          />
        );

      case "done":
        return (
          <ThemedBouncyCheckbox
            value={set.done === 1}
            onChange={(checked) => onToggleSet(set.sets_id, checked)}
            size={18}
            edgeSize={2}
            checkmarkColor={theme.cardBackground}
            fillColor={set.failed === 1 && theme.danger}
          />
        );

      default:
        return null;
    }
  };

  return (
    <>
      <ThemedCard style={styles.wrapper}>
        <Title visibleColumns={visibleColumns} />

        {localSets.map((set, rowIndex) => {
          const renderedColumns = getRenderedColumns(set);

          return (
            <View key={set.sets_id} style={styles.container}>
              {renderedColumns.map((col, colIndex) => {
                const isFirst = colIndex === 0;
                const isLast = colIndex === renderedColumns.length - 1;

                return (
                  <View
                    key={col.key}
                    style={[
                      styles.editable_cell,
                      styles.padding,
                      col.style,
                      col.mergedStyle,
                      isFirst && { borderLeftWidth: 0 },
                      isLast && { borderRightWidth: 0 },
                      rowIndex === localSets.length - 1 && styles.lastGrid,
                    ]}
                  >
                    {renderCellContent(col.key, set)}
                  </View>
                );
              })}
            </View>
          );
        })}
      </ThemedCard>

      <ThemedBottomSheet
        visible={setOptionsVisible}
        onClose={handleCloseSetOptions}
      >
        <View style={styles.bottomsheet_title}>
          <ThemedText>Set: {selectedSet?.set_number}</ThemedText>
          <ThemedText>{exerciseName}</ThemedText>
        </View>

        <View style={styles.bottomsheet_body}>
          <View style={styles.note_section}>
            <ThemedText size={12} setColor={theme.quietText}>
              Note
            </ThemedText>

            <ThemedTextInput
              value={selectedSetNote}
              onChangeText={setSelectedSetNote}
              onEndEditing={persistSelectedSetNote}
              placeholder="Add note"
              multiline
              inputStyle={styles.note_input}
            />
          </View>

          <TouchableOpacity
            style={styles.option}
            onPress={async () => {
              if (!selectedSet) {
                return;
              }

              await updateField(
                "amrap",
                selectedSet.amrap === 1 ? 0 : 1,
                selectedSet.sets_id
              );
              setSetOptionsVisible(false);
            }}
          >
            <Amrap width={24} height={24} />
            <ThemedText style={styles.option_text}>
              {selectedSet?.amrap === 1
                ? "Remove AMRAP mark"
                : "Mark as AMRAP"}
            </ThemedText>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.option}
            onPress={async () => {
              if (!selectedSet) {
                return;
              }

              await deleteSet(selectedSet.sets_id);
              setSetOptionsVisible(false);
            }}
          >
            <Delete width={24} height={24} />
            <ThemedText style={styles.option_text}>Delete set</ThemedText>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.option}
            onPress={async () => {
              if (!selectedSet) {
                return;
              }

              await persistSelectedSetNote();
              await updateField(
                "failed",
                selectedSet.failed === 1 ? 0 : 1,
                selectedSet.sets_id
              );
              setSetOptionsVisible(false);
            }}
          >
            <Cross width={24} height={24} />
            <ThemedText style={styles.option_text}>
              {selectedSet?.failed === 1
                ? "Remove failed mark"
                : "Mark set as failed"}
            </ThemedText>
          </TouchableOpacity>
        </View>
      </ThemedBottomSheet>

      <ThemedModal
        visible={noteModalVisible}
        onClose={() => setNoteModalVisible(false)}
        title="Note"
      >
        <ThemedText>{noteModalText}</ThemedText>
      </ThemedModal>
    </>
  );
};

export default SetList;
