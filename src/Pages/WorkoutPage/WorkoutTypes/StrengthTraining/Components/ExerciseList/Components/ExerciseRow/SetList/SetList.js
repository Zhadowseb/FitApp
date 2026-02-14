// src/Components/ExerciseList/ExerciseList.js
import { View, Text, TextInput, Button } from "react-native";
import { SQLiteDatabase, useSQLiteContext } from "expo-sqlite";
import { useState, useEffect } from "react";
import { useColorScheme } from "react-native";
import { Colors } from "../../../../../../../../../Resources/GlobalStyling/colors";

import styles from "./SetListStyle";
import Title from "./Title";

import {ThemedCard,
        ThemedText,
        ThemedTextInput,
        ThemedButton,
        ThemedEditableCell,
        ThemedBouncyCheckbox} 
  from "../../../../../../../../../Resources/ThemedComponents";
  
const SetList = ({ sets, visibleColumns, onToggleSet, updateUI }) => {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme] ?? Colors.light;

  if (!sets || sets.length === 0) {
    return null;
  }

  const db = useSQLiteContext();
  const [localSets, setLocalSets] = useState(sets);

  useEffect(() => {
    setLocalSets(sets);
  }, [sets]);

  return (
    <ThemedCard style={styles.wrapper}>
      
      <Title />

      {localSets.map((set, index) => (
        <View key={set.sets_id} style={styles.container}>
            
            {/* REST */}
            {visibleColumns.rest && (
            <View style={[styles.editable_cell, styles.pause,
              index === sets.length - 1 && styles.lastGrid ]}>
              <ThemedEditableCell
                value={ set.pause?.toString() ?? ""}
                onCommit={async (v) => {
                  setLocalSets(prev =>
                    prev.map(s =>
                      s.sets_id === set.sets_id
                        ? { ...s, pause: v === "" ? null : Number(v) }
                        : s
                    )
                  );

                  await db.runAsync(
                    `UPDATE Sets SET pause = ? WHERE sets_id = ?;`,
                    [v === "" ? null : Number(v), set.sets_id]
                  );
                  updateUI();
                }}
              />
            </View>
            )}
  
            {/* SET_NUMBER */}
            {visibleColumns.set && (
            <View style={[styles.set, styles.editable_cell,
              index === sets.length - 1 && styles.lastGrid ]}>  
                <ThemedText> {set.set_number} </ThemedText>
            </View>
            )}

            {/* X SPACER */}
            {visibleColumns.x && (
            <View style={[styles.x, styles.editable_cell,
            index === sets.length - 1 && styles.lastGrid ]}>   
                <ThemedText> x </ThemedText>
            </View>
            )}

            {/* REPS */}
            {visibleColumns.reps && (
            <View style={[styles.reps, styles.editable_cell,
            index === sets.length - 1 && styles.lastGrid ]}>  
              <ThemedEditableCell
                value={ set.reps?.toString() ?? ""}
                onCommit={async (v) => {
                  setLocalSets(prev =>
                    prev.map(s =>
                      s.sets_id === set.sets_id
                        ? { ...s, reps: v === "" ? null : Number(v) }
                        : s
                    )
                  );

                  await db.runAsync(
                    `UPDATE Sets SET reps = ? WHERE sets_id = ?;`,
                    [v === "" ? null : Number(v), set.sets_id]
                  );
                  updateUI();
                }}
              />
            </View>
            )}

            {/* RPE */}
            {visibleColumns.rpe && (
            <View style={[styles.rpe, styles.editable_cell,
            index === sets.length - 1 && styles.lastGrid ]}>  
              <ThemedEditableCell
                value={ set.rpe?.toString() ?? ""}
                onCommit={async (v) => {
                  setLocalSets(prev =>
                    prev.map(s =>
                      s.sets_id === set.sets_id
                        ? { ...s, rpe: v === "" ? null : Number(v) }
                        : s
                    )
                  );

                  await db.runAsync(
                    `UPDATE Sets SET rpe = ? WHERE sets_id = ?;`,
                    [v === "" ? null : Number(v), set.sets_id]
                  );
                  updateUI();
                }}
              />
            </View>
            )}

            {/* WEIGHT */}
            {visibleColumns.weight && (
            <View style={[styles.weight, styles.editable_cell,
            index === sets.length - 1 && styles.lastGrid ]}>  
              
              <ThemedEditableCell
                value={ set.weight?.toString() ?? ""}
                onCommit={async (v) => {
                  setLocalSets(prev =>
                    prev.map(s =>
                      s.sets_id === set.sets_id
                        ? { ...s, weight: v === "" ? null : Number(v) }
                        : s
                    )
                  );

                  await db.runAsync(
                    `UPDATE Sets SET weight = ? WHERE sets_id = ?;`,
                    [v === "" ? null : Number(v), set.sets_id]
                  );
                  updateUI();
                }}
              />
            </View>
            )}

            {visibleColumns.done && (
            <View style={[styles.editable_cell, styles.done,
            index === sets.length - 1 && styles.lastGrid ]}>  
              <View style={{justifyContent:"center"}}>
                <ThemedBouncyCheckbox
                  value={set.done === 1}
                  onChange={(checked) => onToggleSet(set.sets_id, checked)}
                  size={18}
                  edgeSize={2}
                  checkmarkColor={theme.cardBackground}
                />
              </View>
            </View>
            )}
        </View>
      ))}
    </ThemedCard>
  );
};

export default SetList;
