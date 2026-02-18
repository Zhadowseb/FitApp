import { View, TouchableOpacity } from "react-native";
import { useSQLiteContext } from "expo-sqlite";
import { useState, useEffect } from "react";
import { useColorScheme } from "react-native";
import { Colors } from "../../../../../../../../../Resources/GlobalStyling/colors";

import styles from "./SetListStyle";
import Title from "./Title";
import DeleteSetModal from "./DeleteSetModal";

import {
  ThemedCard,
  ThemedText,
  ThemedEditableCell,
  ThemedBouncyCheckbox
} from "../../../../../../../../../Resources/ThemedComponents";

const SetList = ({ sets, visibleColumns, onToggleSet, updateUI }) => {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme] ?? Colors.light;

  const db = useSQLiteContext();
  const [localSets, setLocalSets] = useState(sets);

  const [deleteSetModal_visible, set_deleteSetModal_visible] = useState(false);
  const [selectedSet, set_selectedSet] = useState("");

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
    await db.runAsync(
      `DELETE FROM Sets WHERE sets_id = ?;`,
      [set_id]
    );
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

    await db.runAsync(
      `UPDATE Sets SET ${field} = ? WHERE sets_id = ?;`,
      [value === "" ? null : Number(value), setId]
    );
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
          onPress={() => {
            set_deleteSetModal_visible(true);
            set_selectedSet(set.sets_id);
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
                  col.style,
                  styles.padding,
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

    <DeleteSetModal
      visible={deleteSetModal_visible}
      onClose={() => set_deleteSetModal_visible(false)}
      onSubmit={ () => {
        deleteSet(selectedSet);
        set_deleteSetModal_visible(false);
      }}
      />
    </>
  );
};

export default SetList;
