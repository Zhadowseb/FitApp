import { View, TouchableOpacity } from "react-native";
import { useSQLiteContext } from "expo-sqlite";
import { useState, useEffect } from "react";
import { useColorScheme } from "react-native";
import { Colors } from "../../../../../../../../../Resources/GlobalStyling/colors";

import styles from "./SetListStyle";
import Title from "./Title";

import {
  ThemedCard,
  ThemedBottomSheet,
  ThemedText,
  ThemedEditableCell,
  ThemedBouncyCheckbox
} from "../../../../../../../../../Resources/ThemedComponents";
import { weightliftingService as weightliftingRepository } from "../../../../../../../../../Services";
import Delete from "../../../../../../../../../Resources/Icons/UI-icons/Delete";
import Cross from "../../../../../../../../../Resources/Icons/UI-icons/Cross";

const SetList = ({ sets, visibleColumns, onToggleSet, updateUI }) => {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme] ?? Colors.light;

  const db = useSQLiteContext();
  const [localSets, setLocalSets] = useState(sets);

  const [setOptionsVisible, setSetOptionsVisible] = useState(false);
  const [selectedSet, set_selectedSet] = useState(null);

  useEffect(() => {
    setLocalSets(sets);
  }, [sets]);

  if (!localSets || localSets.length === 0) return null;

  // 🔹 Column configuration
  const columnConfig = [
    { key: "rest", style: styles.pause },
    { key: "set", style: styles.set },
    { key: "x", style: styles.x },
    { key: "reps", style: styles.reps },
    { key: "rpe", style: styles.rpe },
    { key: "weight", style: styles.weight },
    { key: "done", style: styles.done },
  ];

  const activeColumns = columnConfig.filter(col => visibleColumns[col.key]);

  const deleteSet = async (set_id) => {
    await weightliftingRepository.deleteSet(db, set_id);
    updateUI();
  }

  const updateField = async (field, value, setId) => {
    setLocalSets(prev =>
      prev.map(s =>
        s.sets_id === setId
          ? { ...s, [field]: value === "" ? null : Number(value) }
          : s
      )
    );

    await weightliftingRepository.updateSetField(db, {
      field,
      value: value === "" ? null : Number(value),
      setId,
    });
    updateUI();
  };

  const renderCellContent = (key, set, index) => {
    switch (key) {
      case "rest":
        return (
          <ThemedEditableCell
            value={set.pause?.toString() ?? ""}
            onCommit={(v) => updateField("pause", v, set.sets_id)}
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

            borderTopColor: "rgb(48, 45, 43)",   // lys
            borderLeftColor: "rgb(48, 45, 43)",

            borderBottomColor: "rgb(8, 7, 7)", // mørk
            borderRightColor: "rgb(8, 7, 7)",
          }}
          onPress={() => {
            set_selectedSet(set);
            setSetOptionsVisible(true);
          }}>
            <ThemedText>{set.set_number}</ThemedText>          
          </TouchableOpacity>
        );
          

      case "x":
        return <ThemedText>x</ThemedText>;

      case "reps":
        return (
          <ThemedEditableCell
            value={set.reps?.toString() ?? ""}
            onCommit={(v) => updateField("reps", v, set.sets_id)}
          />
        );

      case "rpe":
        return (
          <ThemedEditableCell
            value={set.rpe?.toString() ?? ""}
            onCommit={(v) => updateField("rpe", v, set.sets_id)}
          />
        );

      case "weight":
        return (
          <ThemedEditableCell
            value={set.weight?.toString() ?? ""}
            suffix="kg"
            onCommit={(v) => updateField("weight", v, set.sets_id)}
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
                {renderCellContent(col.key, set, rowIndex)}
              </View>
            );
          })}
        </View>
      ))}
    </ThemedCard>

    <ThemedBottomSheet
      visible={setOptionsVisible}
      onClose={() => setSetOptionsVisible(false)}
    >
      <View style={styles.bottomsheet_title}>
        <ThemedText>Set: {selectedSet?.set_number}</ThemedText>
      </View>

      <View style={styles.bottomsheet_body}>
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
          <ThemedText style={styles.option_text}>
            Delete set
          </ThemedText>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.option}
          onPress={async () => {
            if (!selectedSet) {
              return;
            }

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
            {selectedSet?.failed === 1 ? "Remove failed mark" : "Mark set as failed"}
          </ThemedText>
        </TouchableOpacity>
      </View>
    </ThemedBottomSheet>
    </>
  );
};

export default SetList;
