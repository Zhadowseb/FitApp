import { useState, useEffect } from "react";
import { View, Text, ScrollView, ActivityIndicator, TouchableOpacity } from "react-native";
import { useSQLiteContext } from "expo-sqlite";
import { useNavigation } from "@react-navigation/native";
import Checkbox from 'expo-checkbox';

import styles from "./MesocycleListStyle";
import AddMesocycleModal from "../AddMesocycle/AddMesocycleModal";
import { ThemedTitle, ThemedCard, ThemedView, ThemedText, ThemedButton } 
  from "../../../../Resources/Components";
import Plus from "../../../../Resources/Icons/UI-icons/Plus"
import { parseCustomDate, formatDate } from "../../../../Utils/dateUtils";

const MesocycleList = ({ program_id, start_date, refreshKey, refresh }) => {
  const db = useSQLiteContext();
  const navigation = useNavigation();

  const [mesocycles, setMesocycles] = useState([]);
  const [loading, setLoading] = useState(false);

  const [modalVisible, setModalVisible] = useState(false);

  const weekDays = [
      'Monday', 
      'Tuesday', 
      'Wednesday', 
      'Thursday', 
      'Friday', 
      'Saturday', 
      'Sunday'];

  const loadMesocycles = async () => {
    try {
      setLoading(true);
      const cycles = await db.getAllAsync(
        "SELECT mesocycle_id, mesocycle_number, weeks, focus, done FROM Mesocycle WHERE program_id = ?;",
        [program_id]
      );

      const enriched = enrichMesocycles(cycles);
      setMesocycles(enriched);

    } catch (error) {
      console.error("Error loading programs", error);
    } finally {
      setLoading(false);
    }
  };

  const enrichMesocycles = (cycles) => {
    let weekOffset = 0;

    return cycles.map(cycle => {
      const start = parseCustomDate(start_date);
      start.setDate(start.getDate() + weekOffset * 7);

      const end = new Date(start);
      end.setDate(end.getDate() + cycle.weeks * 7 - 1);

      weekOffset += cycle.weeks;

      return {
        ...cycle,
        period_start: formatDate(start),
        period_end: formatDate(end),
      };
    });
  };



  const handleAdd = async (data) => {
      try {

          //Checking what mesocycle number this is
          const row = await db.getFirstAsync(
              `SELECT COUNT(*) AS count FROM Mesocycle WHERE program_id = ?;`,
              [program_id]
          );
          const mesocycleCount = row?.count ?? 0;

          //Insert new mesocycle
          const result = await db.runAsync(
              `INSERT INTO Mesocycle (program_id, mesocycle_number, weeks, focus) VALUES (?, ?, ?, ?);`,
              [program_id, (mesocycleCount + 1), data.weeks, data.focus]
          );

          const weeksBefore = await db.getAllAsync(
              `SELECT COUNT(*) AS count FROM Microcycle WHERE program_id = ?;`,
              [program_id]
          )
          const weekCount = weeksBefore?.count ?? null;

          //Add in weeks to database
          const newMesocycle_id = result.lastInsertRowId;
          for (let week = 1; week <= data.weeks; week++){
              const microcycle_result = await db.runAsync(
                  `INSERT INTO Microcycle (mesocycle_id, program_id, microcycle_number) VALUES (?, ?, ?);`,
                  [newMesocycle_id, program_id, week]
              );
              
              const microcycle_id = microcycle_result.lastInsertRowId;
              for(let day = 1; day <= 7; day++){


                  const current_day = (weekCount * 7) + (week * 7 - 7) + (day - 1)

                  const date = parseCustomDate(start_date);
                  date.setDate(date.getDate() + current_day);

                  await db.runAsync(
                      `INSERT INTO Day (microcycle_id, program_id, Weekday, date) VALUES (?,?,?,?);`,
                      [microcycle_id, program_id, weekDays[day-1], formatDate(date)]
                  )
              }
          }

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
          <ThemedCard
            style={{
              width: 200,
              height: 250,
              flexDirection: "row",
            }}>
            <View style={styles.status_section}>
              <View style={styles.header_status}>

                <View style={styles.checkbox_header}>
                  <ThemedText style={styles.label}>Status</ThemedText>
                </View>

                <View style={styles.checkbox_container}>
                  <Checkbox
                    value={item.done === 1}
                    color={item.done ? "#4CAF50" : "#ccc"}
                  />
                </View>
              
              </View>
            </View>

            <View style={styles.body}>
              <View style={styles.focus}>
                <ThemedText>Mesocycle focus: {item.focus}</ThemedText>
              </View>

              <View style={styles.weeks}>
                <ThemedText>Weeks: {item.weeks}</ThemedText>
                <ThemedText>Period: {item.period_start} to {item.period_end} </ThemedText>
              </View>
            </View>
          </ThemedCard>

          <View style={{alignItems: "center"}}>
            <ThemedText> {item.period_start} - {item.period_end} </ThemedText>
          </View>

        </TouchableOpacity>
      ))}

      {mesocycles.length === 0 && (
        <Text style={{ textAlign: "center", marginTop: 20 }}>
          No mesocycles found.
        </Text>
      )}

      <TouchableOpacity
        onPress={ () => {
          setModalVisible(true)
        }} >

        <ThemedCard
          style={
          {justifyContent: "center",
            alignItems: "center", 
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
