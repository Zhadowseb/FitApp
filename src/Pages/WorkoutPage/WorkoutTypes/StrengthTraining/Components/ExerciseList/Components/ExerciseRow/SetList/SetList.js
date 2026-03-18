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
    { key: "note", style: styles.note },
    { key: "rest", style: styles.pause },
    { key: "set", style: styles.set },
    { key: "reps", style: styles.reps },
    { key: "rpe", style: styles.rpe },
    { key: "weight", style: styles.weight },
    { key: "done", style: styles.done },
  ];

  const activeColumns = columnConfig.filter((col) => visibleColumns[col.key]);

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
              borderTopWidth: 1,
              borderLeftWidth: 1,
              borderBottomWidth: 2,
              borderRightWidth: 2,
              backgroundColor: "rgb(32, 30, 29)",
              borderTopColor: "rgb(48, 45, 43)",
              borderLeftColor: "rgb(48, 45, 43)",
              borderBottomColor: "rgb(8, 7, 7)",
              borderRightColor: "rgb(8, 7, 7)",
            }}
            onPress={() => handleOpenSetOptions(set)}
          >
            <ThemedText>{set.set_number}</ThemedText>
          </TouchableOpacity>
        );

      case "reps":
        return (
          <ThemedEditableCell
            value={set.reps?.toString() ?? ""}
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

      case "weight":
        return (
          <ThemedEditableCell
            value={set.weight?.toString() ?? ""}
            suffix="kg"
            onCommit={(value) => updateField("weight", value, set.sets_id)}
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

        {localSets.map((set, rowIndex) => (
          <View key={set.sets_id} style={styles.container}>
            {activeColumns.map((col, colIndex) => {
              const isFirst = colIndex === 0;
              const isLast = colIndex === activeColumns.length - 1;

              return (
                <View
                  key={col.key}
                  style={[
                    styles.editable_cell,
                    styles.padding,
                    col.style,
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
        ))}
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
            style={[styles.option, { paddingTop: 0 }]}
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
