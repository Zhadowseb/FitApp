// src/Components/ExerciseList/ExerciseList.js
import { View, Text, TextInput, Button } from "react-native";
import { SQLiteDatabase, useSQLiteContext } from "expo-sqlite";
import { useState, useEffect } from "react";

import Checkbox from 'expo-checkbox';

import styles from "./SetListStyle";
import Title from "./Title/Title";
  
const SetList = ({ sets, onToggleSet, editMode, updateUI }) => {
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
            <View style={[styles.pause, styles.text]}> 
                {!editMode ? 
                  <Text> {set.pause} </Text>
                  :
                <TextInput
                  style={[styles.editableInput, styles.widthPause]}
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
                <Text> {set.set_number} </Text>
            </View>

            <View style={[styles.x, styles.text]}> 
                <Text> x </Text>
            </View>

            <View style={[styles.reps, styles.text]}> 
                {!editMode ? 
                  <Text> {set.reps} </Text>
                  :
                <TextInput
                  style={[styles.editableInput, styles.widthReps]}
                  value={String(set.reps ?? "")}
                  onChangeText={(text) =>
                    updateLocalSet(set.sets_id, { reps: text })
                  }
                  onBlur={() =>
                    updateSetReps(set.sets_id, Number(set.reps))
                  }
                />}
            </View>

            <View style={[styles.rpe, styles.text]}> 
                {!editMode ? 
                  <Text> {set.rpe} </Text>
                  :
                <TextInput
                  style={[styles.editableInput, styles.widthRPE]}
                  value={String(set.rpe ?? "")}
                  onChangeText={(text) =>
                    updateLocalSet(set.sets_id, { rpe: text })
                  }
                  onBlur={() =>
                    updateSetRPE(set.sets_id, Number(set.rpe))
                  }
                />}
            </View>

            <View style={[styles.weight, styles.text]}> 
                {!editMode ? 
                  <Text> {set.weight} </Text>
                  :
                  <TextInput
                    style={[styles.editableInput, styles.widthWeight]}
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
                <Button
                  title="x"
                  color="red"
                  onPress={() => deleteSet(set.sets_id)}
                />
                :
                <Checkbox
                  value={set.done === 1}
                  color={set.done ? "#4CAF50" : "#ccc"}
                  onValueChange={(checked) => onToggleSet(set.sets_id, checked)}
                  style={styles.checkbox} />
              }
            </View>
        </View>
      ))}
    </View>
  );
};

export default SetList;
