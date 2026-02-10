// src/Components/RunSetList/RunSetList.js
import { useState, useCallback } from "react";
import { View } from "react-native";
import { useSQLiteContext } from "expo-sqlite";
import { useFocusEffect } from "@react-navigation/native";


import { ThemedCard, ThemedText } from "../../../../Resources/Components";
import styles from "./RunStyle";
import ListHeader from "./ListHeader";

const RunSetList = ({ workout_id, type, reloadKey, empty }) => {
  const db = useSQLiteContext();
  const [sets, setSets] = useState([]);

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

  useFocusEffect(
    useCallback(() => {
      loadRunSets();
    }, [workout_id, type])
  );

  if (sets.length === 0) {
    return (
      <ThemedText style={{ opacity: 0.5, padding: 12 }}>
        No sets
      </ThemedText>
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
            <View style={[styles.set, styles.sharedGrid,
              index === sets.length - 1 && styles.lastGrid ]}>
              {set.is_pause ? 
              (<ThemedText style={{ paddingLeft: 20 }}>
                Pause
              </ThemedText>) : 
              (<ThemedText>{set.set_number}</ThemedText>)}

            </View>

            {/* DISTANCE */}
            <View style={[styles.distance, styles.sharedGrid,
              index === sets.length - 1 && styles.lastGrid ]}>
              <ThemedText>
                {set.distance ? `${set.distance} m` : ""}
              </ThemedText>
            </View>

            {/* PACE */}
            <View style={[styles.pace, styles.sharedGrid,
              index === sets.length - 1 && styles.lastGrid ]}>
              <ThemedText>
                {set.pace ? formatPace(set.pace) : ""}
              </ThemedText>
            </View>

            {/* TIME */}
            <View style={[styles.time, styles.sharedGrid,
              index === sets.length - 1 && styles.lastGrid ]}>
              <ThemedText>
                {set.time ? formatTime(set.time) : ""}
              </ThemedText>
            </View>

            {/* HEART RATE */}
            <View style={[styles.zone, styles.sharedGrid,
              index === sets.length - 1 && styles.lastGrid]}>
              <ThemedText>
                {set.heartrate ? `HR ${set.heartrate}` : ""}
              </ThemedText>
            </View>
          </View>
        ))}
      </ThemedCard>
    </>
  );
};

export default RunSetList;

/* ---------- helpers ---------- */

const formatTime = (minutes) => {
  const m = Math.floor(minutes);
  const s = Math.round((minutes - m) * 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
};

const formatPace = (secondsPerKm) => {
  const m = Math.floor(secondsPerKm / 60);
  const s = secondsPerKm % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
};
