import { useState, useCallback } from "react";
import { TouchableOpacity, View } from "react-native";
import { useSQLiteContext } from "expo-sqlite";
import { useFocusEffect } from "@react-navigation/native";
import { useColorScheme } from "react-native";
import { Colors } from "../../../../Resources/GlobalStyling/colors";


import { ThemedCard, ThemedText, ThemedBottomSheet, ThemedEditableCell } from "../../../../Resources/ThemedComponents";
import Delete from "../../../../Resources/Icons/UI-icons/Delete";

import styles from "./RunStyle";
import ListHeader from "./ListHeader";

const RunSetList = ({ workout_id, type, empty, reloadKey, triggerReload }) => {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme] ?? Colors.light;
  const db = useSQLiteContext();
  const [sets, setSets] = useState([]);

  const [bottomsheetVisible, set_bottomsheetVisible] = useState(false);
  const [selectedSet, set_selectedSet] = useState(0);

  useFocusEffect(
    useCallback(() => {
      loadRunSets();
    }, [reloadKey])
  );

  const loadRunSets = async () => {
    try {
      const rows = await db.getAllAsync(
        `SELECT *
         FROM Run
         WHERE workout_id = ?
           AND type = ?
         ORDER BY set_number ASC;`,
        [workout_id, type]
      );

      setSets(rows);
      empty?.(rows.length === 0);
    } catch (err) {
      console.error("Failed to load run sets:", err);
    }
  };

  const deleteSet = async () => {
    try {
      db.runAsync(
        `DELETE FROM Run WHERE Run_id = ?;`,
        [selectedSet.Run_id]
      );
      triggerReload();
    } catch (err) {
      console.error("Failed to delete run set:", err);
    }
  }

  useFocusEffect(
    useCallback(() => {
      loadRunSets();
    }, [workout_id, type])
  );

  if (sets.length === 0) {
    return (
      <ThemedCard style={{opacity: 0.3}}>
        <ThemedText style={{ paddingLeft: 15 }}>
          No sets
        </ThemedText>
      </ThemedCard>
    );
  }

  return (
    <>

      <ThemedCard style={{opacity: sets.length === 0 ? 0.3 : 1}}>
        <ListHeader
            styles={styles}/>

        {sets.map((set, index) => (
          
          <View key={set.Run_id} style={styles.grid}>
            
            {/* SET NUMBER + PAUSE */}
            <TouchableOpacity style={[styles.set, styles.sharedGrid,
              index === sets.length - 1 && styles.lastGrid ]}
              
              onPress={async () => {
                set_selectedSet(set);
                set_bottomsheetVisible(true);
              }}>

              {set.is_pause ? 
              (<ThemedText style={{color: theme.quietText}}>
                Pause
              </ThemedText>) : 
              (<ThemedText>{set.set_number}</ThemedText>)}
            </TouchableOpacity>



            {/* DISTANCE */}
            <View style={[styles.distance, styles.sharedGrid,
              index === sets.length - 1 && styles.lastGrid ]}>
              <ThemedEditableCell
                value={ set.distance?.toString() ?? ""}
                onCommit={async (v) => {
                  setSets(prev =>
                    prev.map(s =>
                      s.Run_id === set.Run_id
                        ? { ...s, distance: v === "" ? null : Number(v) }
                        : s
                    )
                  );

                  await db.runAsync(
                    `UPDATE Run SET distance = ? WHERE Run_id = ?;`,
                    [v === "" ? null : Number(v), set.Run_id]
                  );
                }}
              />
            </View>

            {/* PACE */}
            <View style={[styles.pace, styles.sharedGrid,
              index === sets.length - 1 && styles.lastGrid ]}>
              <ThemedEditableCell
                value={set.pace?.toString() ?? ""}
                keyboardType="normal"
                onCommit={async (v) => {
                  setSets(prev =>
                    prev.map(s =>
                      s.Run_id === set.Run_id
                        ? { ...s, pace: v === "" ? null : Number(v) }
                        : s
                    )
                  );

                  await db.runAsync(
                    `UPDATE Run SET pace = ? WHERE Run_id = ?;`,
                    [v === "" ? null : v, set.Run_id]
                  );
                }}
              />
            </View>

            {/* TIME */}
            <View style={[styles.time, styles.sharedGrid,
              index === sets.length - 1 && styles.lastGrid ]}>
              <ThemedEditableCell
                value={set.time?.toString() ?? ""}
                onCommit={async (v) => {
                  setSets(prev =>
                    prev.map(s =>
                      s.Run_id === set.Run_id
                        ? { ...s, time: v === "" ? null : Number(v) }
                        : s
                    )
                  );

                  await db.runAsync(
                    `UPDATE Run SET time = ? WHERE Run_id = ?;`,
                    [v === "" ? null : Number(v), set.Run_id]
                  );
                }}
              />
            </View>

            {/* HEART RATE */}
            <View style={[styles.zone, styles.sharedGrid,
              index === sets.length - 1 && styles.lastGrid]}>
              <ThemedEditableCell
                value={set.heartrate?.toString() ?? ""}
                onCommit={async (v) => {
                  setSets(prev =>
                    prev.map(s =>
                      s.Run_id === set.Run_id
                        ? { ...s, heartrate: v === "" ? null : Number(v) }
                        : s
                    )
                  );

                  await db.runAsync(
                    `UPDATE Run SET heartrate = ? WHERE Run_id = ?;`,
                    [v === "" ? null : Number(v), set.Run_id]
                  );
                }}
              />
            </View>
          </View>
        ))}
      </ThemedCard>


      <ThemedBottomSheet
          visible={bottomsheetVisible}
          onClose={() => set_bottomsheetVisible(false)} >

          <View style={styles.bottomsheet_title}>
              <ThemedText> Set: {selectedSet.set_number} of type: {selectedSet.type} </ThemedText>
          </View>

          <View style={styles.bottomsheet_body}>

              {/* Delete a workout */}
              <TouchableOpacity 
                  style={styles.option}
                  onPress={async () => {
                    deleteSet();
                    set_bottomsheetVisible(false);
                  }}>

                  <Delete
                      width={24}
                      height={24}/>
                  <ThemedText style={styles.option_text}> 
                      Delete set
                  </ThemedText>
              </TouchableOpacity>

          </View>

      </ThemedBottomSheet>
    </>
  );
};

export default RunSetList;