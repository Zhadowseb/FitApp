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
import { programRepository } from "../../../../Database/repository";

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

    for (const mc of microcycles) {
      const days = [];

      const start = parseCustomDate(mc.period_start);

      for (let i = 0; i < 7; i++) {
        const date = new Date(start);
        date.setDate(start.getDate() + i);

        const dayRow = await programRepository.getDayByMicrocycleAndDate(db, {
          microcycleId: mc.microcycle_id,
          date: formatDate(date),
        });

        let icon = null;
        let iconLabel = null;

        if (dayRow) {
          const workouts = await programRepository.getWorkoutLabelsByDay(
            db,
            dayRow.day_id
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
    
    </>
  );

};

export default MicrocycleList;
