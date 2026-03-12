import { useState, useEffect } from "react";
import { View, Text, ScrollView, ActivityIndicator, TouchableOpacity } from "react-native";
import { useSQLiteContext } from "expo-sqlite";
import { useNavigation } from "@react-navigation/native";
import { useColorScheme } from "react-native";
import { Colors } from "../../../../Resources/GlobalStyling/colors";

import styles from "./MesocycleListStyle";
import { programRepository } from "../../../../Database/repository";
import AddMesocycleModal from "../AddMesocycle/AddMesocycleModal";
import { ThemedTitle, ThemedCard, ThemedView, ThemedText, ThemedButton, ThemedHeader } 
  from "../../../../Resources/ThemedComponents";
import Plus from "../../../../Resources/Icons/UI-icons/Plus"
import { parseCustomDate, formatDate } from "../../../../Utils/dateUtils";

const MesocycleList = ({ program_id, start_date, refreshKey, refresh }) => {
  const db = useSQLiteContext();
  const navigation = useNavigation();

  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme] ?? Colors.light;

  const [mesocycles, setMesocycles] = useState([]);
  const [loading, setLoading] = useState(false);


  const [modalVisible, setModalVisible] = useState(false);

  const loadMesocycles = async () => {
    try {
      setLoading(true);
      const cycles = await programRepository.getMesocyclesByProgram(db, program_id);
      const workoutCounts =
        await programRepository.getMesocycleWorkoutCountsByProgram(db, program_id);

      const workoutCountMap = workoutCounts.reduce((acc, row) => {
        acc[row.mesocycle_id] = row.workout_count ?? 0;
        return acc;
      }, {});

      const enriched = enrichMesocycles(cycles, workoutCountMap);
      setMesocycles(enriched);

    } catch (error) {
      console.error("Error loading programs", error);
    } finally {
      setLoading(false);
    }
  };

  const enrichMesocycles = (cycles, workoutCountMap) => {
    let weekOffset = 0;

    return cycles.map(cycle => {
      const start = parseCustomDate(start_date);
      start.setDate(start.getDate() + weekOffset * 7);

      const end = new Date(start);
      end.setDate(end.getDate() + cycle.weeks * 7 - 1);

      weekOffset += cycle.weeks;

      const workoutCount = workoutCountMap[cycle.mesocycle_id] ?? 0;
      const averageWeeklyWorkouts = cycle.weeks > 0 ? workoutCount / cycle.weeks : 0;

      return {
        ...cycle,
        period_start: formatDate(start),
        period_end: formatDate(end),
        average_weekly_workouts: averageWeeklyWorkouts,
        weightlifts: 0,
        cardio: 0,
        other: 0,
      };
    });
  };



  const handleAdd = async (data) => {
      try {
          await programRepository.createMesocycle(db, {
              programId: program_id,
              startDate: start_date,
              weeks: data.weeks,
              focus: data.focus,
          });

          refresh();

      } catch (error) {
          console.error(error);
      }

      setModalVisible(false);
  };

  useEffect(() => {
    loadMesocycles();
  }, [refreshKey]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <>
    <ScrollView horizontal>
      {mesocycles.map(item => (
        <TouchableOpacity
          key={item.mesocycle_id}
          onPress={() => {
            navigation.navigate("MicrocyclePage", {
              mesocycle_id: item.mesocycle_id,
              mesocycle_number: item.mesocycle_number,
              mesocycle_focus: item.focus,
              program_id: program_id,
              period_start: item.period_start,
              period_end: item.period_end,
            });
          }}
        >

          <View style={{alignItems: "center"}}>
            <ThemedTitle type="h3"> Cycle: {item.mesocycle_number} </ThemedTitle>
          </View>

          <ThemedCard
            style={{
              width: 200,
              height: 250,
              flexDirection: "column",
              borderWidth: item.done ? 3 : 0,
              borderColor: theme.secondary,
              backgroundColor: theme.primaryLight,
            }}>

            <View style={styles.focus}>
                <ThemedText size={13} setColor={theme.textInverted}> {item.focus}</ThemedText>
            </View>

            <View style={styles.weeks}>
                <ThemedText setColor={theme.textInverted}>
                  Weeks: {item.weeks}
                </ThemedText>
            </View>

            <View style={[styles.frequency, {
              flex: 1, 
              justifyContent: "flex-end",
              alignItems: "center" }]}>
              <ThemedText setColor={theme.textInverted}>
                Avg. weekly workouts:
              </ThemedText>

              <ThemedText setColor={theme.textInverted}>
                {item.average_weekly_workouts.toFixed(1)}
              </ThemedText>

            </View>


          </ThemedCard>

          <View style={{alignItems: "center"}}>
            <ThemedText size={10}> {item.period_start} - {item.period_end} </ThemedText>
          </View>

        </TouchableOpacity>
      ))}

      {mesocycles.length === 0 && (
        <>
        </>
      )}

      <TouchableOpacity
        onPress={ () => {
          setModalVisible(true)
        }} >

        <ThemedCard
          style={
          {justifyContent: "center",
            alignItems: "center", 
            marginTop: 35,
            width: 200,
            height: 250,
            borderWidth: 1,
            backgroundColor: "currentColor"}}>

          <Plus
            width={24}
            height={24}/>

        </ThemedCard>

      </TouchableOpacity>
    </ScrollView>

    
    <AddMesocycleModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSubmit={handleAdd}
    />

    </>
  );
};


export default MesocycleList;
