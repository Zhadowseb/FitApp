import { useState, useEffect } from "react";
import { View, Text, FlatList, ActivityIndicator, TouchableOpacity } from "react-native";
import { useSQLiteContext } from "expo-sqlite";
import { useNavigation } from "@react-navigation/native";
import { useColorScheme } from "react-native";
import { Colors } from "../../../../Resources/GlobalStyling/colors";
import ThreeDots from "../../../../Resources/Icons/UI-icons/ThreeDots"
import Plus from "../../../../Resources/Icons/UI-icons/Plus";
import Copy from "../../../../Resources/Icons/UI-icons/Copy";


import styles from "./MicrocycleListStyle";

import { ThemedCard, 
        ThemedText, 
        ThemedBouncyCheckbox,
        ThemedBottomSheet,
        ThemedPicker } from "../../../../Resources/Components";

const MicrocycleList = ( {mesocycle_id, refreshKey, updateui} ) => {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme] ?? Colors.light;

  const db = useSQLiteContext();
  const navigation = useNavigation();

  const [microcycles, setMicrocycles] = useState([]);
  const [loading, setLoading] = useState(false);

  const [OptionsBottomsheet_visible, set_OptionsBottomsheet_visible] = useState(false);

  const loadMicrocycles = async () => {
    try {
      setLoading(true);

      const cycles = await db.getAllAsync(
        "SELECT microcycle_id, microcycle_number, program_id, focus, done FROM Microcycle WHERE mesocycle_id = ?;",
        [mesocycle_id]
      );

      setMicrocycles(cycles);

    } catch (error) {
      console.error("Error loading programs", error);
    } finally {
      setLoading(false);
    }
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

  useEffect(() => {
    loadMicrocycles();
  }, [refreshKey]);

  useEffect(() => {
    loadMicrocycles();
  }, []);

  const renderItem = ({ item }) => (
    <TouchableOpacity
      onPress={() => {
        navigation.navigate("WeekPage", {
            microcycle_id: item.microcycle_id,
            microcycle_number: item.microcycle_number,
            program_id: item.program_id})
      }}>
        <ThemedCard style={{flexDirection: "row"}}>
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

              <View style={styles.focus}>
                <ThemedPicker
                  value={item.focus}
                  onChange={ (newFocus) => {
                    updateFocus(item.microcycle_id, newFocus);
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

          <View style={{justifyContent: "center"}}>
            <TouchableOpacity
                style={styles.options}
                onPress={async () => {
                    set_OptionsBottomsheet_visible(true);
                }}>

                <ThreeDots
                    width={"20"}
                    height={"20"}/>

            </TouchableOpacity>   
          </View>
        </ThemedCard>

    </TouchableOpacity>
  );

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
          <ThemedText> day </ThemedText>
          <ThemedText> date </ThemedText>
      </View>

      <View style={styles.bottomsheet_body}>

          {/* Add new workout to a certain day */}
          <TouchableOpacity 
              style={[styles.option, {paddingTop: 0}]}
              onPress={async () => {
                  set_OptionsBottomsheet_visible(false);

              }}>
              <Plus
                  width={24}
                  height={24}/>
              <ThemedText style={styles.option_text}> 
                  Add new workout
              </ThemedText>
          </TouchableOpacity>

          {/* Copy a workout, and paste it to a different day */}
          <TouchableOpacity 
              style={styles.option}
              onPress={async () => {

              }}>

              <Copy
                  width={24}
                  height={24}/>
              <ThemedText style={styles.option_text}> 
                  Copy workout to a different day
              </ThemedText>

          </TouchableOpacity>

      </View>

    </ThemedBottomSheet>
    </>
  );

};

export default MicrocycleList;