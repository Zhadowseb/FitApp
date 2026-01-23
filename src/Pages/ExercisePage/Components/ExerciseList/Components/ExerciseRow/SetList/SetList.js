// src/Components/ExerciseList/ExerciseList.js
import { View, Text, TextInput, Button } from "react-native";
import { SQLiteDatabase, useSQLiteContext } from "expo-sqlite";
import { useState, useEffect } from "react";
import { useColorScheme } from "react-native";
import { Colors } from "../../../../../../../Resources/GlobalStyling/colors";

import styles from "./SetListStyle";
import Title from "./Title/Title";


import {ThemedCard,
        ThemedText,
        ThemedTextInput,
        ThemedButton,
        ThemedBouncyCheckbox} 
  from "../../../../../../../Resources/Components";
  
const SetList = ({ sets, onToggleSet, editMode, updateUI }) => {
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

  const updateLocalSet = (sets_id, patch) => {
    setLocalSets(prev =>
      prev.map(s =>
        s.sets_id === sets_id
          ? { ...s, ...patch }
          : s
      )
    );
  };

  const updateSetPause = async (sets_id, pause) => {
    if (pause === "" || Number.isNaN(pause)) {return;}
    await db.runAsync(
      `UPDATE Sets SET pause = ? WHERE sets_id = ?`,
      [pause, sets_id]);
    updateUI?.();
  }

  const updateSetReps = async (sets_id, reps) => {
    if (reps === "" || Number.isNaN(reps)) {return;}
    await db.runAsync(
      `UPDATE Sets SET reps = ? WHERE sets_id = ?`,
      [reps, sets_id]);
    updateUI?.();
  }

  const updateSetRPE = async (sets_id, rpe) => {
    if (rpe === "" || Number.isNaN(rpe)) {return;}
    await db.runAsync(
      `UPDATE Sets SET rpe = ? WHERE sets_id = ?`,
      [rpe, sets_id] );
    updateUI?.();
  }

  const updateSetWeight = async (sets_id, weight) => {
    if (weight === "" || Number.isNaN(weight)) {return;}
    await db.runAsync(
      `UPDATE Sets SET weight = ? WHERE sets_id = ?`,
      [weight, sets_id] );
    updateUI?.();
  };

  const deleteSet = async (sets_id) => {
    try {
      await db.runAsync(
        `DELETE FROM Sets WHERE sets_id = ?;`,
        [sets_id]);
      updateUI?.();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <View style={styles.wrapper}>
      
      <Title />

      {localSets.map((set) => (
        <View key={set.sets_id} style={styles.container}>
            <View style={styles.pause}> 
                {!editMode ? 
                  <ThemedText style={styles.text}> {set.pause} </ThemedText>
                  :
                <ThemedTextInput
                  style={[styles.widthPause, styles.input]}
                  inputStyle={styles.editableInput}
                  value={String(set.pause ?? "")}
                  onChangeText={(text) =>
                    updateLocalSet(set.sets_id, { pause: text })
                  }
                  onBlur={() =>
                    updateSetPause(set.sets_id, Number(set.pause))
                  }
                />}
            </View>
  
            <View style={[styles.set, styles.text]}>  
                <ThemedText> {set.set_number} </ThemedText>
            </View>

            <View style={[styles.x, styles.text]}> 
                <ThemedText> x </ThemedText>
            </View>

            <View style={styles.reps}> 
                {!editMode ? 
                  <ThemedText style={styles.text}> {set.reps} </ThemedText>
                  :
                <ThemedTextInput
                  style={[styles.widthReps, styles.input]}
                  inputStyle={styles.editableInput}
                  value={String(set.reps ?? "")}
                  onChangeText={(text) =>
                    updateLocalSet(set.sets_id, { reps: text })
                  }
                  onBlur={() =>
                    updateSetReps(set.sets_id, Number(set.reps))
                  }
                />}
            </View>

            <View style={styles.rpe}> 
                {!editMode ? 
                  <ThemedText style={styles.text}> {set.rpe} </ThemedText>
                  :
                <ThemedTextInput
                  style={[styles.widthRPE, styles.input]}
                  inputStyle={styles.editableInput}
                  value={String(set.rpe ?? "")}
                  onChangeText={(text) =>
                    updateLocalSet(set.sets_id, { rpe: text })
                  }
                  onBlur={() =>
                    updateSetRPE(set.sets_id, Number(set.rpe))
                  }
                />}
            </View>

            <View style={styles.weight}> 
                {!editMode ? 
                  <ThemedText style={styles.text}> {set.weight} </ThemedText>
                  :
                  <ThemedTextInput
                    style={[styles.widthWeight, styles.input]}
                    inputStyle={styles.editableInput}
                    value={String(set.weight ?? "")}
                    onChangeText={(text) =>
                      updateLocalSet(set.sets_id, { weight: text })
                    }
                    onBlur={() =>
                      updateSetWeight(set.sets_id, Number(set.weight))
                    }
                  />}
            </View>

            <View style={[styles.done, styles.text]}> 

              {editMode ?
                <ThemedButton
                  title="x"
                  variant="danger"
                  style={{
                    paddingVertical: 1,
                    paddingHorizontal: 1,
                    height: 25,
                    width: 25,
                  }}
                  onPress={() => deleteSet(set.sets_id)}
                />
                :
                <View style={{justifyContent:"center"}}>
                  <ThemedBouncyCheckbox
                    value={set.done === 1}
                    onChange={(checked) => onToggleSet(set.sets_id, checked)}
                    size={18}
                    edgeSize={2}
                    checkmarkColor={theme.cardBackground}
                  />
                </View>


                  
              }
            </View>
        </View>
      ))}
    </View>
  );
};

export default SetList;
