import { useState, useEffect } from "react";
import { View, Text, FlatList, ActivityIndicator, TouchableOpacity } from "react-native";
import { useSQLiteContext } from "expo-sqlite";
import { useNavigation } from "@react-navigation/native";
import { useColorScheme } from "react-native";
import { Colors } from "../../../../Resources/GlobalStyling/colors";
import ThreeDots from "../../../../Resources/Icons/UI-icons/ThreeDots"
import Plus from "../../../../Resources/Icons/UI-icons/Plus";
import Copy from "../../../../Resources/Icons/UI-icons/Copy";
import CalenderPastePicker from "../../../../Resources/Components/CalenderPastePicker/CalenderPasteModal";
import CircularProgression from "../../../../Resources/Components/CircularProgression"
import { useFocusEffect } from "@react-navigation/native";
import { useCallback } from "react";
import WeekIndicator from "../../../../Resources/Figures/WeekIndicator";
import { WORKOUT_ICONS } from "../../../../Resources/Icons/WorkoutLabels";

import styles from "./MicrocycleListStyle";

import { ThemedCard, 
        ThemedText, 
        ThemedBouncyCheckbox,
        ThemedBottomSheet,
        ThemedPicker,
        ThemedTitle } from "../../../../Resources/Components";
import { formatDate, parseCustomDate } from "../../../../Utils/dateUtils";

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


  const loadMicrocycles = async () => {
    try {
      setLoading(true);

      const cycles = await db.getAllAsync(
        "SELECT microcycle_id, microcycle_number, program_id, focus, done FROM Microcycle WHERE mesocycle_id = ?;",
        [mesocycle_id]
      );

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

    for (const mc of microcycles) {
      const days = [];

      const start = parseCustomDate(mc.period_start);

      for (let i = 0; i < 7; i++) {
        const date = new Date(start);
        date.setDate(start.getDate() + i);

        const dayRow = await db.getFirstAsync(
          `SELECT day_id FROM Day
          WHERE microcycle_id = ?
          AND date = ?`,
          [mc.microcycle_id, formatDate(date)]
        );

        let icon = null;
        let iconLabel = null;

        if (dayRow) {
          const workouts = await db.getAllAsync(
            `SELECT label FROM Workout WHERE day_id = ?`,
            [dayRow.day_id]
          );

          if (workouts.length === 1) {
            const found =
              WORKOUT_ICONS.find(w => w.id === workouts[0].label);

            icon = found?.Icon ?? null;
            iconLabel = found?.short ?? workouts[0].label;
          } 
          else if (workouts.length > 1) {
            iconLabel = "Multi";
          }
        }

        days.push({
          label: ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"][i],
          dateLabel: formatDate(date).slice(0, 5),
          active: formatDate(date) === formatDate(new Date()),
          icon,
          iconLabel,
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

      await db.getAllAsync(
        "UPDATE Microcycle SET focus = ? WHERE microcycle_id = ? ",
        [focus, microcycle_id]
      );

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

      // Get all days from old week.
      const oldDays = await db.getAllAsync(
        `SELECT day_id, Weekday FROM Day WHERE microcycle_id = ?`,
        [source_microcycle_id]
      );

      // Get all days from new week.
      const newDays = await db.getAllAsync(
        `SELECT day_id, Weekday FROM Day WHERE microcycle_id = ?`,
        [target_microcycle_id]
      );

      // Creating a dictionary mapping old day_id to new day_id
      const dayMap = {};
      newDays.forEach(d => {
        dayMap[d.Weekday] = d.day_id;
      });

      // Loop over old days.
      for (const oldDay of oldDays) {
        const newDayId = dayMap[oldDay.Weekday];
        if (!newDayId) continue; //Safety

        //Get workouts from old day.
        const workouts = await db.getAllAsync(
          `SELECT * FROM Workout WHERE day_id = ?`,
          [oldDay.day_id]
        );

        for (const workout of workouts) {
          // Loop over all workouts, and insert them into new day.
          const resultWorkout = await db.runAsync(
            `INSERT INTO Workout (day_id, date, label, done)
            VALUES (?, ?, ?, 0)`,
            [newDayId, workout.date, workout.label]
          );

          const newWorkoutId = resultWorkout.lastInsertRowId;

          // Get all exercises from the old workout
          const exercises = await db.getAllAsync(
            `SELECT * FROM Exercise WHERE workout_id = ?`,
            [workout.workout_id]
          );

          for (const exercise of exercises) {
            // Loop over all the old exercises from the old workout, creating new exercises matching.
            const resultExercise = await db.runAsync(
              `INSERT INTO Exercise (workout_id, exercise_name, sets, done)
              VALUES (?, ?, ?, 0)`,
              [newWorkoutId, exercise.exercise_name, exercise.sets]
            );

            const newExerciseId = resultExercise.lastInsertRowId;

            // Collect all the sets ascociated with the currently looped over exercise
            const sets = await db.getAllAsync(
              `SELECT * FROM Sets WHERE exercise_id = ?`,
              [exercise.exercise_id]
            );

            for (const set of sets) {
              // Loop over all the old sets, inserting copies within the new exercise.
              await db.runAsync(
                `INSERT INTO Sets (
                  set_number,
                  exercise_id,
                  date,
                  personal_record,
                  pause,
                  rpe,
                  weight,
                  reps,
                  done,
                  failed,
                  note
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0, 0, ?)`,
                [
                  set.set_number,
                  newExerciseId,
                  set.date,
                  set.personal_record,
                  set.pause,
                  set.rpe,
                  set.weight,
                  set.reps,
                  set.note
                ]
              );
            }
          }
        }
      }
      set_targetWeek(null);

    } catch (err) {
      console.error("Error copying week:", err);
    } finally {
      setLoading(false);
    }
  };

  const getWorkoutCounts = async (microcycle_id) => {
    const total = await db.getFirstAsync(
      `SELECT COUNT(*) AS count
      FROM Workout w
      JOIN Day d ON w.day_id = d.day_id
      WHERE d.microcycle_id = ?`,
      [microcycle_id]
    );

    const done = await db.getFirstAsync(
      `SELECT COUNT(*) AS count
      FROM Workout w
      JOIN Day d ON w.day_id = d.day_id
      WHERE d.microcycle_id = ?
        AND w.done = 1`,
      [microcycle_id]
    );

    return {
      total: total.count,
      done: done.count,
    };
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
  
  const buildWeekIndicatorDays = (microcycle) => {
    const days = [];
    const start = parseCustomDate(microcycle.period_start);
    const today = formatDate(new Date());

    for (let i = 0; i < 7; i++) {
      const date = new Date(start);
      date.setDate(start.getDate() + i);

      days.push({
        label: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"][i],
        dateLabel: formatDate(date).slice(0, 5), // dd.MM
        active: formatDate(date) === today,

        // simpelt default – kan udvides senere
        icon: null,
        iconLabel: null,
      });
    }

    return days;
  };



  /*
  Add in total sets for each exercise.
  Add in total weight liftet for week.
  */

  const renderItem = ({ item }) => {

    const counts =
      workoutCounts[item.microcycle_id] ?? { total: 0, done: 0 };

    const progress =
      counts.total > 0
        ? (counts.done / counts.total) * 100
        : 0;

    return (
      <TouchableOpacity
        onPress={() => {
          navigation.navigate("WeekPage", {
              microcycle_id: item.microcycle_id,
              program_id: item.program_id,
              week_number: item.microcycle_number,
              period_start: item.period_start,
              period_end: item.period_end})
        }}>
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
              <WeekIndicator
                days={weekSummaries[item.microcycle_id] ?? []} />
            </View>

          </ThemedCard>

      </TouchableOpacity>
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
    
    </>
  );

};

export default MicrocycleList;