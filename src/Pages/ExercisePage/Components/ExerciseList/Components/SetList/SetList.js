// src/Components/ExerciseList/ExerciseList.js
import { View, Text, TextInput } from "react-native";
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

  const updateSetWeight = async (sets_id, weight) => {
    if (weight === "" || Number.isNaN(weight)) {
      return;
    }

    await db.runAsync(
      `UPDATE Sets SET weight = ? WHERE sets_id = ?`,
      [weight, sets_id]
    );

    updateUI?.();
  };

  return (
    <View style={styles.wrapper}>

      <Title />

      {localSets.map((set) => (

        <View key={set.set_id} style={styles.container}>
            <View style={[styles.pause, styles.text]}> 
              <Text> {set.pause} </Text>
            </View>
  
            <View style={[styles.set, styles.text]}>  
                <Text> {set.set_number} </Text>
            </View>

            <View style={[styles.x, styles.text]}> 
                <Text> x </Text>
            </View>

            <View style={[styles.reps, styles.text]}> 
                <Text> {set.reps} </Text>
            </View>

            <View style={[styles.rpe, styles.text]}> 
                <Text> {set.rpe} </Text>
            </View>

            <View style={[styles.weight, styles.text]}> 
                {!editMode ? 
                  <Text> {set.weight} </Text>
                  :
                  <TextInput
                    style={styles.editableInput}
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
              <Checkbox
                value={set.done === 1}
                color={set.done ? "#4CAF50" : "#ccc"}
                onValueChange={(checked) => onToggleSet(set.sets_id, checked)}
                style={styles.checkbox} />
            </View>

        </View>
      ))}
    </View>
  );
};

export default SetList;
