import React, { useEffect, useState } from "react";
import { View, TouchableOpacity } from "react-native";
import { useSQLiteContext } from "expo-sqlite";
import { useNavigation } from "@react-navigation/native";

import styles from "./MicrocyclePageStyle";
import MicrocycleList from "./Components/MicrocycleList/MicrocycleList";
import ThreeDots from "../../Resources/Icons/UI-icons/ThreeDots";
import Plus from "../../Resources/Icons/UI-icons/Plus";
import Delete from "../../Resources/Icons/UI-icons/Delete";

import { ThemedBottomSheet, 
    ThemedView, 
    ThemedHeader, 
    ThemedText, 
    ThemedTitle, 
    ThemedPicker,
    ThemedCard } from "../../Resources/ThemedComponents";

import {
  programService as programRepository,
  weightliftingService,
} from "../../Services";

const MicrocyclePage = ( {route} ) => {
    const db = useSQLiteContext();
    const navigation = useNavigation();

    const {mesocycle_id, 
            mesocycle_number, 
            mesocycle_focus, 
            program_id, 
            period_start, 
            period_end} = route.params;

    const [refreshing, set_refreshing] = useState(0);
    const [OptionsBottomsheet_visible, set_OptionsBottomsheet_visible] = useState(false);
    const [focus, set_focus] = useState(mesocycle_focus);
    const [progressiveOverload, setProgressiveOverload] = useState({
        summary: "No 1 RM values yet.",
        progressions: [],
    });

    const updateUI = () => {
        set_refreshing(prev => prev + 1);
    }

    useEffect(() => {
      const loadProgressiveOverload = async () => {
        try {
          const progressiveOverload =
            await weightliftingService.getMesocycleProgressiveOverload(db, {
              mesocycleId: mesocycle_id,
              programId: program_id,
              mesocycleNumber: mesocycle_number,
            });

          setProgressiveOverload(progressiveOverload);
        } catch (error) {
          console.error("Failed to load mesocycle progression:", error);
        }
      };

      loadProgressiveOverload();
    }, [db, mesocycle_id, mesocycle_number, program_id, refreshing]);

    const deleteMesocycle = async () => {
        try {
            await programRepository.deleteMesocycle(db, mesocycle_id);
        } catch (e) {
            console.error("deleteMesocycle failed:", e);
            throw e;
        }

        set_OptionsBottomsheet_visible(false);
        navigation.goBack();
    };

  const updateFocus = async (focus) => {
    try {
      await programRepository.updateMesocycleFocus(db, {
        mesocycleId: mesocycle_id,
        focus,
      });

      updateUI();
    } catch (error) {
      console.error("Error loading programs", error);
    }
  }

    const addExtraWeek = async () => {
        try {
            await programRepository.addWeekToMesocycle(db, {
                mesocycleId: mesocycle_id,
                programId: program_id,
            });

            updateUI();
            set_OptionsBottomsheet_visible(false);

        } catch (error) {
            console.error(error);
        }
    };


    return (
        <>
        <ThemedView>

            <ThemedHeader
                right={
                    <TouchableOpacity onPress={() => {
                        set_focus(mesocycle_focus)
                        set_OptionsBottomsheet_visible(true) }}>
                        <ThreeDots width={20} height={20} />
                    </TouchableOpacity> } >
                
                <ThemedText size={18}>Mesocycle {mesocycle_number} </ThemedText>
                <ThemedText size={10}> {period_start} - {period_end}  </ThemedText>
            

            </ThemedHeader>

            <View style={styles.section_container}>
              <ThemedTitle type="h2">Progressive Overload</ThemedTitle>
              <ThemedCard style={styles.progression_card}>
                <ThemedText style={styles.progression_summary}>
                  {progressiveOverload.summary}
                </ThemedText>

                {progressiveOverload.progressions.map((progression) => (
                  <View
                    key={progression.exercise_name}
                    style={styles.progression_row}
                  >
                    <ThemedText style={styles.progression_exercise}>
                      {progression.exercise_name}
                    </ThemedText>
                    <ThemedText style={styles.progression_value}>
                      {progression.progression_display}
                    </ThemedText>
                  </View>
                ))}
              </ThemedCard>

              <ThemedTitle type="h2" style={styles.weeks_title}>Weeks</ThemedTitle>
            </View>
            
            <MicrocycleList
                program_id={program_id}
                mesocycle_id={mesocycle_id}
                period_start={period_start}
                period_end={period_end} 
                refreshKey={refreshing}
                updateui={updateUI}/>

        </ThemedView>

        <ThemedBottomSheet
            visible={OptionsBottomsheet_visible}
            onClose={() => set_OptionsBottomsheet_visible(false)} >

            <View style={styles.bottomsheet_title}>
                <ThemedTitle type={"h3"} style={{flex: 10}}> 
                    Mesocycle number: {mesocycle_number} 
                </ThemedTitle>

                <View style={styles.focus}>
                    <ThemedText> Change Focus </ThemedText>

                    <ThemedPicker
                        value={focus}
                        onChange={ (newFocus) => {
                            set_focus(newFocus);
                            updateFocus(newFocus);
                        }}
                        placeholder={focus}
                        title="Select Week Focus"
                        items={[
                            "Strength",
                            "Bodybuilding",
                            "Technique",
                            "Speed / Power",
                            "Easy / Recovery",
                            "Max Test",
                        ]}
                    />
                </View>

            </View>

            <View style={styles.bottomsheet_body}>
                {/* Add on week. */}
                <TouchableOpacity 
                    style={styles.option}
                    onPress={async () => {
                        addExtraWeek();
                    }}>

                    <Plus
                        width={24}
                        height={24}/>
                    <ThemedText style={styles.option_text}> 
                        Add week to mesocycle.
                    </ThemedText>

                </TouchableOpacity>

                {/* Delete Mesocycle */}
                <TouchableOpacity 
                    style={styles.option}
                    onPress={async () => {
                        await deleteMesocycle();
                    }}>

                    <Delete
                        width={24}
                        height={24}/>
                    <ThemedText style={styles.option_text}> 
                        Delete mesocycle.
                    </ThemedText>

                </TouchableOpacity>
            </View>


        </ThemedBottomSheet>
        </>
    );
};

export default MicrocyclePage;
