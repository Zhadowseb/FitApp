import { useState, useEffect, useRef } from "react";
import { View, FlatList, TouchableOpacity } from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useSQLiteContext } from "expo-sqlite";
import { useNavigation } from "@react-navigation/native";
import { useColorScheme } from "react-native";
import { Colors } from "../../../../Resources/GlobalStyling/colors";
import ThreeDots from "../../../../Resources/Icons/UI-icons/ThreeDots"
import Copy from "../../../../Resources/Icons/UI-icons/Copy";
import Plus from "../../../../Resources/Icons/UI-icons/Plus";
import CalenderPastePicker from "../../../../Resources/Components/CalenderPastePicker/CalenderPasteModal";
import CircularProgression from "../../../../Resources/Components/CircularProgression"
import { useFocusEffect } from "@react-navigation/native";
import { useCallback } from "react";
import WeekdayIndicator from "../../../../Resources/Figures/WeekdayIndicator";
import { getWorkoutIconConfig } from "../../../../Resources/Icons/WorkoutLabels";
import PickWorkoutModal from "../../../WeekPage/Components/Day/Components/PickWorkoutModal/PickWorkoutModal";
import WorkoutLabel from "../../../../Resources/Components/WorkoutLabel";

import styles from "./MicrocycleListStyle";
import { programService as programRepository } from "../../../../Services";

import { ThemedCard, 
        ThemedText, 
        ThemedBouncyCheckbox,
        ThemedBottomSheet,
        ThemedPicker,
        ThemedTitle } from "../../../../Resources/ThemedComponents";
import { formatDate, parseCustomDate } from "../../../../Utils/dateUtils";
import Delete from "../../../../Resources/Icons/UI-icons/Delete";

const MicrocycleList = ( {program_id, mesocycle_id, period_start, period_end, refreshKey, updateui} ) => {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme] ?? Colors.light;
  const db = useSQLiteContext();
  const navigation = useNavigation();

  const [microcycles, setMicrocycles] = useState([]);
  const [weekSummaries, setWeekSummaries] = useState({});
  const [loading, setLoading] = useState(false);

  const [workoutCounts, setWorkoutCounts] = useState({});

  const [selectedWeek, set_selectedWeek] = useState(0);
  const [targetWeek, set_targetWeek] = useState(0);
  const [OptionsBottomsheet_visible, set_OptionsBottomsheet_visible] = useState(false);
  const [showCalendarPicker, set_ShowCalendarPicker] = useState(false);
  const [selectedDay, setSelectedDay] = useState(null);
  const [selectedWorkoutId, setSelectedWorkoutId] = useState(null);
  const [pickWorkoutModalVisible, setPickWorkoutModalVisible] = useState(false);
  const [pickMode, setPickMode] = useState(null);
  const [dayOptionsVisible, setDayOptionsVisible] = useState(false);
  const [labelModalVisible, setLabelModalVisible] = useState(false);
  const [datePickerVisible, setDatePickerVisible] = useState(false);
  const [newDate, setNewDate] = useState(new Date());
  const longPressHandledRef = useRef(false);
  const PICK_MODE = {
    NAVIGATE: "navigate",
    DELETE: "delete",
    COPY: "copy",
  };


  const loadMicrocycles = async () => {
    try {
      setLoading(true);
      const cycles =
        await programRepository.getMicrocyclesByMesocycle(db, mesocycle_id);

      const enriched = enrichMicrocycles(cycles);
      setMicrocycles(enriched);

    } catch (error) {
      console.error("Error loading programs", error);
    } finally {
      setLoading(false);
    }
  };

  const loadWeekSummaries = async () => {
    const summariesByMicrocycle = {};
    const weekDayNames = [
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
      "Sunday",
    ];
    const weekDayLabels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

    for (const mc of microcycles) {
      const days = [];

      for (let i = 0; i < 7; i++) {
        const dayRow = await programRepository.getDayDetails(db, {
          microcycleId: mc.microcycle_id,
          weekday: weekDayNames[i],
        });
        const date = dayRow?.date ?? buildMicrocycleDate(mc.period_start, i);
        const workouts = dayRow?.workouts ?? [];
        const completed =
          workouts.length > 0 &&
          workouts.every((workout) => workout.done === 1);

        let icon = null;
        let iconLabel = null;

        if (workouts.length === 1) {
          const found = getWorkoutIconConfig(workouts[0].label);

          icon = found?.Icon ?? null;
          iconLabel = found?.short ?? workouts[0].label;
        } else if (workouts.length > 1) {
          iconLabel = "Multi";
        }

        days.push({
          microcycleId: mc.microcycle_id,
          dayId: dayRow?.day_id ?? null,
          label: weekDayLabels[i],
          day: weekDayNames[i],
          date,
          dateLabel: date.slice(0, 5),
          active: date === formatDate(new Date()),
          completed,
          icon,
          iconLabel,
          workouts,
        });
      }

      summariesByMicrocycle[mc.microcycle_id] = days;
    }

    setWeekSummaries(summariesByMicrocycle);
  };


  const enrichMicrocycles = (cycles) => {
    return cycles.map(cycle => {
      const start = parseCustomDate(period_start);
      start.setDate(start.getDate() + (cycle.microcycle_number * 7 - 7))

      const end = new Date(start);
      end.setDate(end.getDate() + 6);

      return {
        ...cycle,
        period_start: formatDate(start),
        period_end: formatDate(end),
      };
    })
  };

  const updateFocus = async (microcycle_id, focus) => {
    try {
      setLoading(true);

      await programRepository.updateMicrocycleFocus(db, {
        microcycleId: microcycle_id,
        focus,
      });

      updateui();
    } catch (error) {
      console.error("Error loading programs", error);
    } finally {
      setLoading(false);
    }
  }

  const copyWeek = async (source_microcycle_id, target_microcycle_id) => {
    try {
      setLoading(true);

      await programRepository.copyMicrocycleWorkouts(db, {
        sourceMicrocycleId: source_microcycle_id,
        targetMicrocycleId: target_microcycle_id,
      });
      set_targetWeek(null);

    } catch (err) {
      console.error("Error copying week:", err);
    } finally {
      setLoading(false);
    }
  };

  const getWorkoutCounts = async (microcycle_id) => {
    return programRepository.getMicrocycleWorkoutCounts(db, microcycle_id);
  };

  const loadCounts = async () => {
    const result = {};

    for (const mc of microcycles) {
      result[mc.microcycle_id] =
        await getWorkoutCounts(mc.microcycle_id);
    }

    setWorkoutCounts(result);
  };

  useFocusEffect(
    useCallback(() => {
      loadMicrocycles();

    }, [mesocycle_id, refreshKey])
  );

  useEffect(() => {
    loadCounts();
  }, [refreshKey]);

  useEffect(() => {
    if (microcycles.length === 0) return;
    loadWeekSummaries();
    loadCounts();
  }, [microcycles]);
  
  const buildMicrocycleDate = (periodStart, dayOffset) => {
    const start = parseCustomDate(periodStart);
    start.setDate(start.getDate() + dayOffset);
    return formatDate(start);
  };

  const buildWeekdayIndicators = (microcycle) => {
    const days = [];
    const start = parseCustomDate(microcycle.period_start);
    const today = formatDate(new Date());
    const weekDayNames = [
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
      "Sunday",
    ];

    for (let i = 0; i < 7; i++) {
      const date = new Date(start);
      date.setDate(start.getDate() + i);
      const formattedDate = formatDate(date);

      days.push({
        microcycleId: microcycle.microcycle_id,
        dayId: null,
        label: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"][i],
        day: weekDayNames[i],
        date: formattedDate,
        dateLabel: formattedDate.slice(0, 5),
        active: formattedDate === today,
        completed: false,

        // simpelt default – kan udvides senere
        icon: null,
        iconLabel: null,
        workouts: [],
      });
    }

    return days;
  };


  const deleteMicrocycle = async (microcycle_id) => {
    try {
      await programRepository.deleteMicrocycle(db, microcycle_id);

      updateui(); // refresh list
      set_OptionsBottomsheet_visible(false);

    } catch (e) {
      console.error("deleteMicrocycle failed:", e);
    }
  };



  /*
  Add in total sets for each exercise.
  Add in total weight liftet for week.
  */

  const navigateToWorkout = (workout, day) => {
    navigation.navigate("WorkoutPage", {
      workout_id: workout.workout_id,
      workout_label: workout.label,
      day: day.day,
      date: day.date,
    });
  };

  const handleWeekdayPress = (day) => {
    if (!day.workouts?.length) {
      return;
    }

    if (day.workouts.length === 1) {
      navigateToWorkout(day.workouts[0], day);
      return;
    }

    setSelectedDay(day);
    setPickMode(PICK_MODE.NAVIGATE);
    setPickWorkoutModalVisible(true);
  };

  const handleWeekdayLongPress = (day) => {
    longPressHandledRef.current = true;
    setSelectedDay(day);
    setDayOptionsVisible(true);
  };

  const createWorkoutForDay = async (labelId) => {
    if (!selectedDay) {
      return;
    }

    try {
      const dayRow =
        selectedDay.dayId
          ? { day_id: selectedDay.dayId }
          : await programRepository.getDayByMicrocycleAndDate(db, {
              microcycleId: selectedDay.microcycleId,
              date: selectedDay.date,
            });

      if (!dayRow?.day_id) {
        return;
      }

      const workoutResult = await programRepository.createWorkoutForDay(db, {
        date: selectedDay.date,
        dayId: dayRow.day_id,
        label: labelId.id,
      });

      setLabelModalVisible(false);
      setDayOptionsVisible(false);
      updateui();

      navigation.navigate("WorkoutPage", {
        program_id: program_id,
        day: selectedDay.day,
        date: selectedDay.date,
        workout_id: workoutResult.lastInsertRowId,
        workout_label: labelId.id,
      });
    } catch (error) {
      console.error("Failed to create workout:", error);
    }
  };

  const deleteWorkout = async (workoutId) => {
    try {
      await programRepository.deleteWorkout(db, workoutId);
      setPickWorkoutModalVisible(false);
      setDayOptionsVisible(false);
      setSelectedDay(null);
      setSelectedWorkoutId(null);
      setPickMode(null);
      updateui();
    } catch (error) {
      console.error("Failed to delete workout:", error);
    }
  };

  const copyWorkoutToDate = async (workoutId, date) => {
    try {
      const copiedWorkoutId = await programRepository.copyWorkoutToDate(db, {
        workoutId,
        programId: program_id,
        date,
      });

      if (!copiedWorkoutId) {
        console.warn("No day found for date");
        setSelectedWorkoutId(null);
        setPickMode(null);
        return;
      }

      setDatePickerVisible(false);
      setSelectedWorkoutId(null);
      setPickWorkoutModalVisible(false);
      setDayOptionsVisible(false);
      setSelectedDay(null);
      setPickMode(null);
      updateui();
    } catch (error) {
      console.error("Copy workout failed:", error);
    }
  };

  const renderItem = ({ item }) => {

    const counts =
      workoutCounts[item.microcycle_id] ?? { total: 0, done: 0 };

    const progress =
      counts.total > 0
        ? (counts.done / counts.total) * 100
        : 0;

    return (
      <ThemedCard style={{flexDirection: "column", paddingTop: "0", paddingBottom: "0",}}>

            <View style={{flexDirection: "row"}}>
            <View style={styles.status_section}>

                <View style={styles.done}>
                    <ThemedBouncyCheckbox
                      value={item.done === 1}
                      size={24}
                      edgeSize={2}
                      disabled
                      checkmarkColor={theme.cardBackground} />
                </View>              

                <View style={styles.header_status}>
                    <ThemedText style={styles.label}>Week</ThemedText>
                    <ThemedText> {item.microcycle_number} </ThemedText>
                </View>

            </View>

            <View style={styles.body}>

                <ThemedText>
                  {item.focus}
                </ThemedText>
                
            </View>

              <CircularProgression
                size = {60}
                strokeWidth = {5} 
                text= {`${counts.done}/${counts.total}`}
                textSize = {16}
                progressPercent = {progress}
              />

            <View style={{justifyContent: "center"}}>
              <TouchableOpacity
                  style={styles.options}
                  onPress={async () => {
                      set_selectedWeek(item);
                      set_OptionsBottomsheet_visible(true);
                  }}>

                  <ThreeDots
                      width={"20"}
                      height={"20"}/>

              </TouchableOpacity>   
            </View>
            </View>

            <View>
              <View style={styles.weekdaysRow}>
                {(weekSummaries[item.microcycle_id] ?? buildWeekdayIndicators(item)).map((day) => (
                  <TouchableOpacity
                    key={`${item.microcycle_id}-${day.day}`}
                    style={styles.weekdayTouchable}
                    delayLongPress={600}
                    onPress={() => {
                      if (longPressHandledRef.current) {
                        longPressHandledRef.current = false;
                        return;
                      }
                      handleWeekdayPress(day);
                    }}
                    onLongPress={() => {
                      handleWeekdayLongPress(day);
                    }}
                  >
                    <WeekdayIndicator
                      label={day.label}
                      dateLabel={day.dateLabel}
                      active={day.active}
                      completed={day.completed}
                      icon={day.icon}
                      iconLabel={day.iconLabel}
                    />
                  </TouchableOpacity>
                ))}
              </View>
            </View>

      </ThemedCard>
    );
  };

  return (
    <>
    <FlatList
      data={microcycles}
      renderItem={renderItem}
    />

    <ThemedBottomSheet
      visible={OptionsBottomsheet_visible}
      onClose={() => set_OptionsBottomsheet_visible(false)} >

      <View style={styles.bottomsheet_title}>

          <ThemedTitle type={"h3"} style={{flex: 10}}> 
            Week number: {selectedWeek.microcycle_number} 
          </ThemedTitle>

          <View style={styles.focus}>
            <ThemedText> Change Focus </ThemedText>

            <ThemedPicker
              value={selectedWeek.focus}
              onChange={ (newFocus) => {
                updateFocus(selectedWeek.microcycle_id, newFocus);
              }}
              placeholder="Focus"
              title="Select Week Focus"
              items={[
                "Progressive Overload",
                "Volume",
                "Intensity",
                "Technique",
                "Speed / Power",
                "Easy / Recovery",
                "Deload",
                "Max Test",
              ]}
            />
          </View>
      </View>

      <View style={styles.bottomsheet_body}>

          {/* Copy a workout, and paste it to a different day */}
          <TouchableOpacity 
              style={styles.option}
              onPress={async () => {
                set_ShowCalendarPicker(true);
              }}>

              <Copy
                  width={24}
                  height={24}/>
              <ThemedText style={styles.option_text}> 
                  Copy workouts to a different week
              </ThemedText>

          </TouchableOpacity>

          {/* Delete microcycle */}
          <TouchableOpacity 
              style={styles.option}
              onPress={async () => {
                await deleteMicrocycle(selectedWeek.microcycle_id);
              }}>

              <Delete
                  width={24}
                  height={24}/>
              <ThemedText style={styles.option_text}> 
                  Delete Week.
              </ThemedText>

          </TouchableOpacity>

      </View>

    </ThemedBottomSheet>
    
    {showCalendarPicker && (
      <CalenderPastePicker 
        program_id={program_id}
        visible={showCalendarPicker}
        close={ (returned) => {
          set_ShowCalendarPicker(false);
          copyWeek(selectedWeek.microcycle_id, returned.microcycle_id);
          updateui();
        }} 
        version="microcycle"/>
    )}

    <PickWorkoutModal
      workouts={selectedDay?.workouts ?? []}
      visible={pickWorkoutModalVisible}
      onClose={() => {
        setPickWorkoutModalVisible(false);
        setSelectedWorkoutId(null);
        setPickMode(null);
      }}
      onSubmit={(workout) => {
        if (pickMode === PICK_MODE.DELETE) {
          deleteWorkout(workout.workout_id);
          return;
        }

        if (pickMode === PICK_MODE.COPY) {
          setSelectedWorkoutId(workout.workout_id);
          setPickWorkoutModalVisible(false);
          setDatePickerVisible(true);
          return;
        }

        navigateToWorkout(workout, selectedDay);
      }}
    />

    <ThemedBottomSheet
      visible={dayOptionsVisible}
      onClose={() => {
        setDayOptionsVisible(false);
      }}
    >
      <View style={styles.bottomsheet_title}>
        <ThemedText>{selectedDay?.day}</ThemedText>
        <ThemedText>{selectedDay?.date}</ThemedText>
      </View>

      <View style={styles.bottomsheet_body}>
        <TouchableOpacity
          style={[styles.option, { paddingTop: 0 }]}
          onPress={() => {
            setDayOptionsVisible(false);
            setLabelModalVisible(true);
          }}
        >
          <Plus width={24} height={24} />
          <ThemedText style={styles.option_text}>
            Add new workout
          </ThemedText>
        </TouchableOpacity>

        {!!selectedDay?.workouts?.length && (
          <TouchableOpacity
            style={styles.option}
            onPress={() => {
              if (selectedDay.workouts.length === 1) {
                setSelectedWorkoutId(selectedDay.workouts[0].workout_id);
                setPickMode(PICK_MODE.COPY);
                setDayOptionsVisible(false);
                setDatePickerVisible(true);
                return;
              }

              setDayOptionsVisible(false);
              setPickMode(PICK_MODE.COPY);
              setPickWorkoutModalVisible(true);
            }}
          >
            <Copy width={24} height={24} />
            <ThemedText style={styles.option_text}>
              Copy workout to a different day
            </ThemedText>
          </TouchableOpacity>
        )}

        {!!selectedDay?.workouts?.length && (
          <TouchableOpacity
            style={styles.option}
            onPress={() => {
              if (selectedDay.workouts.length === 1) {
                deleteWorkout(selectedDay.workouts[0].workout_id);
                return;
              }

              setDayOptionsVisible(false);
              setPickMode(PICK_MODE.DELETE);
              setPickWorkoutModalVisible(true);
            }}
          >
            <Delete width={24} height={24} />
            <ThemedText style={styles.option_text}>
              Delete workout
            </ThemedText>
          </TouchableOpacity>
        )}
      </View>
    </ThemedBottomSheet>

    <WorkoutLabel
      visible={labelModalVisible}
      onClose={() => {
        setLabelModalVisible(false);
      }}
      onSubmit={async (labelId) => {
        await createWorkoutForDay(labelId);
      }}
    />

    {datePickerVisible && (
      <DateTimePicker
        value={newDate}
        mode="date"
        display="default"
        onChange={async (event, date) => {
          setDatePickerVisible(false);

          if (event.type !== "set" || !date || !selectedWorkoutId) {
            setSelectedWorkoutId(null);
            setPickMode(null);
            return;
          }

          setNewDate(date);
          await copyWorkoutToDate(selectedWorkoutId, date);
        }}
      />
    )}
    
    </>
  );

};

export default MicrocycleList;
