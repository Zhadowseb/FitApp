import { useState, useCallback } from "react";
import { TouchableOpacity, View } from "react-native";
import { useSQLiteContext } from "expo-sqlite";
import { useFocusEffect } from "@react-navigation/native";
import { useColorScheme } from "react-native";
import { Colors } from "../../../../Resources/GlobalStyling/colors";

import {
  ThemedCard,
  ThemedText,
  ThemedBottomSheet,
  ThemedEditableCell,
} from "../../../../Resources/ThemedComponents";

import Delete from "../../../../Resources/Icons/UI-icons/Delete";
import Cross from "../../../../Resources/Icons/UI-icons/Cross";
import styles from "./RunStyle";
import ListHeader from "./ListHeader";

const RunSetList = ({
  workout_id,
  type,
  empty,
  reloadKey,
  triggerReload,
}) => {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme] ?? Colors.light;
  const db = useSQLiteContext();

  const [sets, setSets] = useState([]);
  const [bottomsheetVisible, set_bottomsheetVisible] = useState(false);
  const [selectedSet, set_selectedSet] = useState(null);

  const [zoneDropdownVisible, setZoneDropdownVisible] = useState(false);
  const [zoneSetId, setZoneSetId] = useState(null);

  const ZONES = [
    { label: "1", value: 1 },
    { label: "2", value: 2 },
    { label: "3", value: 3 },
    { label: "4", value: 4 },
    { label: "5", value: 5 },
  ];

  const ZONE_COLORS = {
    1: "#b6b6b6",
    2: "#02a5e4",
    3: "#00ad5c",
    4: "#ea8106",
    5: "#ff2600",
  };

  useFocusEffect(
    useCallback(() => {
      loadRunSets();
    }, [reloadKey])
  );

  useFocusEffect(
    useCallback(() => {
      loadRunSets();
    }, [workout_id, type])
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
    if (!selectedSet) return;

    await db.runAsync(
      `DELETE FROM Run WHERE Run_id = ?;`,
      [selectedSet.Run_id]
    );

    triggerReload();
  };

  const renumberWorkingSets = async () => {
    const rows = await db.getAllAsync(
      `SELECT *
       FROM Run
       WHERE workout_id = ?
         AND type = ?
       ORDER BY set_number ASC;`,
      [workout_id, type]
    );

    let counter = 1;

    for (const row of rows) {
      if (!row.is_pause) {
        await db.runAsync(
          `UPDATE Run SET set_number = ? WHERE Run_id = ?;`,
          [counter, row.Run_id]
        );
        counter++;
      }
    }
  };

  const togglePause = async () => {
    if (!selectedSet) return;

    const newValue = selectedSet.is_pause ? 0 : 1;

    await db.runAsync(
      `UPDATE Run SET is_pause = ? WHERE Run_id = ?;`,
      [newValue, selectedSet.Run_id]
    );

    await renumberWorkingSets();
    await loadRunSets();
    set_bottomsheetVisible(false);
  };

  if (sets.length === 0) {
    return (
      <ThemedCard style={{ opacity: 0.3 }}>
        <ThemedText style={{ paddingLeft: 15 }}>
          No sets
        </ThemedText>
      </ThemedCard>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <ThemedCard
        style={{
          opacity: sets.length === 0 ? 0.3 : 1,
          overflow: "visible", // IMPORTANT
        }}
      >
        <ListHeader styles={styles} />

        {sets.map((set, index) => (
          <View key={set.Run_id} style={styles.grid}>
            {/* SET NUMBER / PAUSE */}
            <TouchableOpacity
              style={[
                styles.set,
                styles.sharedGrid,
                index === sets.length - 1 && styles.lastGrid,
              ]}
              onPress={() => {
                set_selectedSet(set);
                set_bottomsheetVisible(true);
              }}
            >
              {set.is_pause ? (
                <ThemedText style={{ color: theme.quietText }}>
                  Pause
                </ThemedText>
              ) : (
                <ThemedText>{set.set_number}</ThemedText>
              )}
            </TouchableOpacity>

            {/* DISTANCE */}
            <View
              style={[
                styles.distance,
                styles.sharedGrid,
                index === sets.length - 1 && styles.lastGrid,
              ]}
            >
              <ThemedEditableCell
                value={set.distance?.toString() ?? ""}
                onCommit={async (v) => {
                  await db.runAsync(
                    `UPDATE Run SET distance = ? WHERE Run_id = ?;`,
                    [v === "" ? null : Number(v), set.Run_id]
                  );
                  await loadRunSets();
                }}
              />
            </View>

            {/* PACE */}
            <View
              style={[
                styles.pace,
                styles.sharedGrid,
                index === sets.length - 1 && styles.lastGrid,
              ]}
            >
              <ThemedEditableCell
                value={set.pace?.toString() ?? ""}
                keyboardType="normal"
                onCommit={async (v) => {
                  await db.runAsync(
                    `UPDATE Run SET pace = ? WHERE Run_id = ?;`,
                    [v === "" ? null : v, set.Run_id]
                  );
                  await loadRunSets();
                }}
              />
            </View>

            {/* TIME */}
            <View
              style={[
                styles.time,
                styles.sharedGrid,
                index === sets.length - 1 && styles.lastGrid,
              ]}
            >
              <ThemedEditableCell
                value={set.time?.toString() ?? ""}
                onCommit={async (v) => {
                  await db.runAsync(
                    `UPDATE Run SET time = ? WHERE Run_id = ?;`,
                    [v === "" ? null : Number(v), set.Run_id]
                  );
                  await loadRunSets();
                }}
              />
            </View>

            {/* ZONE DROPDOWN */}
            <View
              style={[
                styles.zone,
                styles.sharedGrid,
                index === sets.length - 1 && styles.lastGrid,
                set.heartrate && {backgroundColor: ZONE_COLORS[set.heartrate]},
              ]}
            >
              <View style={{ position: "relative", width: "100%" }}>
                <TouchableOpacity
                  style={{ width: "100%", position: "relative", justifyContent: "center" }}
                  onPress={() => {
                    if (zoneSetId === set.Run_id) {
                      setZoneDropdownVisible(!zoneDropdownVisible);
                    } else {
                      setZoneSetId(set.Run_id);
                      setZoneDropdownVisible(true);
                    }
                  }}
                >
                  <ThemedText style={{ textAlign: "center" }}>
                    {set.heartrate ? `${set.heartrate}` : ""}
                  </ThemedText>

                </TouchableOpacity>


                {zoneDropdownVisible &&
                  zoneSetId === set.Run_id && (
                    <View
                      style={[
                        styles.zone_dropdown_container,
                        {
                          backgroundColor: theme.cardBackground,
                          borderColor: theme.border,
                        },
                      ]}
                    >
                      {/* CLEAR ZONE */}
                      <TouchableOpacity
                        style={{
                          padding: 10,
                          alignItems: "center",
                          borderBottomWidth: 1,
                          borderColor: theme.border,
                        }}
                        onPress={async () => {
                          setZoneDropdownVisible(false);

                          await db.runAsync(
                            `UPDATE Run SET heartrate = NULL WHERE Run_id = ?;`,
                            [set.Run_id]
                          );

                          await loadRunSets();
                        }}
                      >
                        <Cross width={14} height={14} />
                      </TouchableOpacity>

                      {/* ZONES */}
                      {ZONES.map((zone) => {
                        const bgColor = ZONE_COLORS[zone.value];

                        return (
                          <TouchableOpacity
                            key={zone.value}
                            style={{
                              padding: 10,
                              alignItems: "center",
                              backgroundColor: bgColor,
                            }}
                            onPress={async () => {
                              setZoneDropdownVisible(false);

                              await db.runAsync(
                                `UPDATE Run SET heartrate = ? WHERE Run_id = ?;`,
                                [zone.value, set.Run_id]
                              );

                              await loadRunSets();
                            }}
                          >
                            <ThemedText
                              style={{
                                textAlign: "center",
                                color: zone.value === 1 ? "#000" : "#fff",
                                fontWeight: "600",
                              }}
                            >
                              {zone.label}
                            </ThemedText>
                          </TouchableOpacity>
                        );
                      })}

                    </View>
                  )}

              </View>
            </View>
          </View>
        ))}
      </ThemedCard>

      {/* BOTTOM SHEET */}
      <ThemedBottomSheet
        visible={bottomsheetVisible}
        onClose={() => set_bottomsheetVisible(false)}
      >
        <View style={styles.bottomsheet_title}>
          <ThemedText>
            Set: {selectedSet?.set_number}
          </ThemedText>

          <View
            style={[
              styles.togglepauseorworking,
              { borderColor: theme.primary },
            ]}
          >
            <TouchableOpacity onPress={togglePause}>
              <ThemedText>
                {selectedSet?.is_pause
                  ? "Pause"
                  : "Working Set"}
              </ThemedText>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.bottomsheet_body}>
          <TouchableOpacity
            style={styles.option}
            onPress={async () => {
              await deleteSet();
              set_bottomsheetVisible(false);
            }}
          >
            <Delete width={24} height={24} />
            <ThemedText style={styles.option_text}>
              Delete set
            </ThemedText>
          </TouchableOpacity>
        </View>
      </ThemedBottomSheet>
    </View>
  );
};

export default RunSetList;
