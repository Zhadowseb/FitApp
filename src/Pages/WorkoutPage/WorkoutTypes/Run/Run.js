import { StatusBar } from 'expo-status-bar';
import { View, Button, ScrollView, Text, TouchableOpacity, Switch } from 'react-native';
import { useState, useCallback, useEffect } from "react";
import { useSQLiteContext } from "expo-sqlite";
import { useFocusEffect } from "@react-navigation/native";

import { useColorScheme } from "react-native";
import { Colors } from "../../../../Resources/GlobalStyling/colors";

import { ThemedTitle, 
        ThemedCard, 
        ThemedView, 
        ThemedText, 
        ThemedSwitch, 
        ThemedModal,
        ThemedHeader, } 
  from "../../../../Resources/Components/";
import AddRunSetModal from './AddRunSetModal';

import WorkoutStopwatch from '../../../../Resources/Components/StopWatch';
import Plus from '../../../../Resources/Icons/UI-icons/Plus';

const Run = ({workout_id}) =>  {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme] ?? Colors.light;

  const [addRunSetModal_visible, set_addRunSetModal_visible] = useState(false);

  const db = useSQLiteContext();

  const addWarmupSet = async () => {
      try{
          await db.runAsync(
              `INSERT INTO Run (
                workout_id, 
                type, 
                set_number,
                is_pause,
                distance,
                pace,
                time,
                heartrate ) VALUES (?, "WARMUP", ?, ?, ?, ?, ?, ?);`, 
                [workout_id]
          );
      }catch (error) {
          console.error(error);
      }
  }

  const addWorkingSet = () => {

  } 

  const addCooldownSet = () => {

  }


  return (
    <>
    <ThemedView>

        <View>
            <ThemedCard style={{alignItems: "center"}}>
                <WorkoutStopwatch
                    workout_id={workout_id}
                    onStop={(seconds) => {
                        
                    }} />
            </ThemedCard>
        </View>

        <View>
            <View style={{flexDirection: "row", alignItems: "center"}}>
                <ThemedTitle type={"h2"}>
                    Warmup
                </ThemedTitle>

                <View style={{marginLeft: "auto", marginRight: "15"}}>
                    <TouchableOpacity
                        onPress={ () => {
                            set_addRunSetModal_visible(true);
                        }}>
                        <Plus
                            width={24}
                            height={24}/>
                    </TouchableOpacity>
                </View>
            </View>

            <ThemedCard>
                
            </ThemedCard>
        </View>



        <View>
            <ThemedTitle type={"h2"}>
                Working Sets
            </ThemedTitle>

            <ThemedCard>

            </ThemedCard>
        </View>


        <View>
            <ThemedTitle type={"h2"}>
                Cooldown
            </ThemedTitle>

            <ThemedCard>

            </ThemedCard>
        </View>


    </ThemedView>

    <AddRunSetModal
        visible={addRunSetModal_visible}
        onClose={ () => set_addRunSetModal_visible(false)}
    />

    
    </>
  );
}

export default Run;
