import { useState, useCallback, useRef } from "react";
import { Dimensions, TouchableOpacity, View } from "react-native";
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
import { formatTime } from "../../../../Utils/timeUtils";
import { runningService as runningRepository } from "../../../../Services";

const RunSetList = ({
  workout_id,
  type,
  empty,
  reloadKey,
  triggerReload,
  activeSet,
  activeSet_remainingTime,
}) => {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme] ?? Colors.light;
  const db = useSQLiteContext();

  const [sets, setSets] = useState([]);
  const [bottomsheetVisible, set_bottomsheetVisible] = useState(false);
  const [selectedSet, set_selectedSet] = useState(null);

  const [zoneDropdownVisible, setZoneDropdownVisible] = useState(false);
  const [zoneSetId, setZoneSetId] = useState(null);
  const [zoneDropdownDirection, setZoneDropdownDirection] = useState("down");
  const zoneTriggerRefs = useRef({});

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
  const ZONE_DROPDOWN_ESTIMATED_HEIGHT = 236;
  const ZONE_DROPDOWN_SAFE_MARGIN = 20;

  const handleZonePress = (setId) => {
    const toggleDropdown = (direction = "down") => {
      setZoneDropdownDirection(direction);

      if (zoneSetId === setId) {
        setZoneDropdownVisible((prev) => !prev);
        return;
      }

      setZoneSetId(setId);
      setZoneDropdownVisible(true);
    };

    const anchor = zoneTriggerRefs.current[setId];

    if (!anchor?.measureInWindow) {
      toggleDropdown("down");
      return;
    }

    anchor.measureInWindow((_x, y, _width, height) => {
      const screenHeight = Dimensions.get("window").height;
      const spaceBelow = screenHeight - (y + height);
      const spaceAbove = y;
      const requiredSpace =
        ZONE_DROPDOWN_ESTIMATED_HEIGHT + ZONE_DROPDOWN_SAFE_MARGIN;
      const canOpenDown = spaceBelow >= requiredSpace;
      const canOpenUp = spaceAbove >= requiredSpace;

      let shouldOpenUp = false;

      if (!canOpenDown && canOpenUp) {
        shouldOpenUp = true;
      } else if (!canOpenDown && !canOpenUp) {
        shouldOpenUp = spaceAbove >= spaceBelow;
      }

      toggleDropdown(shouldOpenUp ? "up" : "down");
    });
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
      const rows = await runningRepository.getRunSets(db, {
        workoutId: workout_id,
        type,
      });

      setSets(rows);
      empty?.(rows.length === 0);
    } catch (err) {
      console.error("Failed to load run sets:", err);
    }
  };

  const deleteSet = async () => {
    if (!selectedSet) return;

    await runningRepository.deleteRunSet(db, {
      runId: selectedSet.Run_id,
      workoutId: workout_id,
      type,
    });

    triggerReload();
  };

  const togglePause = async () => {
    if (!selectedSet) return;

    const newValue = selectedSet.is_pause ? 0 : 1;

    await runningRepository.toggleRunSetPause(db, {
      runId: selectedSet.Run_id,
      workoutId: workout_id,
      type,
      isPause: newValue === 1,
    });

    await loadRunSets();
    triggerReload();
    set_bottomsheetVisible(false);
  };

  if (sets.length === 0) {
    return (
      <ThemedCard
        style={{
          opacity: 0.3,
          marginHorizontal: 0,
          marginVertical: 0,
        }}
      >
        <ThemedText style={{ paddingLeft: 15 }}>No sets</ThemedText>
      </ThemedCard>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <ThemedCard
        style={{
          opacity: sets.length === 0 ? 0.3 : 1,
          overflow: "visible",
          marginHorizontal: 0,
          marginVertical: 0,
          paddingHorizontal: 0,
          paddingVertical: 0,
        }}
      >
        <ListHeader styles={styles} />

        {sets.map((set, index) => {
          const isActive = activeSet === set.Run_id;

          return (
            <View
              key={set.Run_id}
              style={[styles.grid, isActive && styles.timeRunning]}
            >
              <TouchableOpacity
                style={[
                  styles.set,
                  styles.sharedGrid,
                  { borderRightWidth: 0, justifyContent: "center", alignItems: "center" },
                  index === sets.length - 1 && styles.lastGrid,
                ]}
                onPress={() => {
                  set_selectedSet(set);
                  set_bottomsheetVisible(true);
                }}
              >
                {set.is_pause ? (
                  <ThemedText style={{ color: theme.quietText }}>Pause</ThemedText>
                ) : (
                  <View style={styles.set_number_button}>
                    <ThemedText
                      style={styles.set_number_button_text}
                      setColor={theme.primary ?? theme.text}
                    >
                      {set.set_number}
                    </ThemedText>
                  </View>
                )}
              </TouchableOpacity>

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
                    await runningRepository.updateRunSetField(db, {
                      runId: set.Run_id,
                      field: "distance",
                      value: v === "" ? null : Number(v),
                    });
                    await loadRunSets();
                    triggerReload();
                  }}
                />
              </View>

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
                    await runningRepository.updateRunSetField(db, {
                      runId: set.Run_id,
                      field: "pace",
                      value: v === "" ? null : v,
                    });
                    await loadRunSets();
                    triggerReload();
                  }}
                />
              </View>

              <View
                style={[
                  styles.time,
                  styles.sharedGrid,
                  index === sets.length - 1 && styles.lastGrid,
                ]}
              >
                {isActive ? (
                  <ThemedText style={{ textAlign: "center", fontWeight: "600" }}>
                    {formatTime(activeSet_remainingTime)}
                  </ThemedText>
                ) : (
                  <ThemedEditableCell
                    value={set.time?.toString() ?? ""}
                  onCommit={async (v) => {
                    await runningRepository.updateRunSetField(db, {
                      runId: set.Run_id,
                      field: "time",
                      value: v === "" ? null : Number(v),
                    });
                    await loadRunSets();
                    triggerReload();
                  }}
                />
                )}
              </View>

              <View
                style={[
                  styles.zone,
                  styles.sharedGrid,
                  index === sets.length - 1 && styles.lastGrid,
                  set.heartrate && {
                    backgroundColor: ZONE_COLORS[set.heartrate],
                    borderRadius: 5,
                  },
                ]}
              >
                <View
                  ref={(node) => {
                    if (node) {
                      zoneTriggerRefs.current[set.Run_id] = node;
                    } else {
                      delete zoneTriggerRefs.current[set.Run_id];
                    }
                  }}
                  style={{ position: "relative", width: "100%" }}
                >
                  <TouchableOpacity
                    style={{
                      width: "100%",
                      position: "relative",
                      justifyContent: "center",
                    }}
                    onPress={() => handleZonePress(set.Run_id)}
                  >
                    <ThemedText style={{ textAlign: "center" }}>
                      {set.heartrate ? `${set.heartrate}` : ""}
                    </ThemedText>
                  </TouchableOpacity>

                  {zoneDropdownVisible && zoneSetId === set.Run_id && (
                    <View
                      style={[
                        styles.zone_dropdown_container,
                        zoneDropdownDirection === "up"
                          ? styles.zone_dropdown_container_up
                          : styles.zone_dropdown_container_down,
                        {
                          backgroundColor: theme.cardBackground,
                          borderColor: theme.border,
                        },
                      ]}
                    >
                      <TouchableOpacity
                        style={{
                          padding: 10,
                          alignItems: "center",
                          borderBottomWidth: 1,
                          borderColor: theme.border,
                        }}
                        onPress={async () => {
                          setZoneDropdownVisible(false);

                          await runningRepository.updateRunSetField(db, {
                            runId: set.Run_id,
                            field: "heartrate",
                            value: null,
                          });

                          await loadRunSets();
                          triggerReload();
                        }}
                      >
                        <Cross width={14} height={14} />
                      </TouchableOpacity>

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

                              await runningRepository.updateRunSetField(db, {
                                runId: set.Run_id,
                                field: "heartrate",
                                value: zone.value,
                              });

                              await loadRunSets();
                              triggerReload();
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
          );
        })}
      </ThemedCard>

      <ThemedBottomSheet
        visible={bottomsheetVisible}
        onClose={() => set_bottomsheetVisible(false)}
      >
        <View style={styles.bottomsheet_title}>
          <ThemedText>Set: {selectedSet?.set_number}</ThemedText>

          <View
            style={[
              styles.togglepauseorworking,
              { borderColor: theme.primary },
            ]}
          >
            <TouchableOpacity onPress={togglePause}>
              <ThemedText>
                {selectedSet?.is_pause ? "Pause" : "Working Set"}
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
            <ThemedText style={styles.option_text}>Delete set</ThemedText>
          </TouchableOpacity>
        </View>
      </ThemedBottomSheet>
    </View>
  );
};

export default RunSetList;
