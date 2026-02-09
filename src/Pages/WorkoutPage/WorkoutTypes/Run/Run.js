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
import styles from './RunStyle';

const Run = ({workout_id}) =>  {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme] ?? Colors.light;

  const [addRunSetModal_visible, set_addRunSetModal_visible] = useState(false);

  const db = useSQLiteContext();

  const [type, set_type] = useState("WORKING_SET");

  const [warmup_sets, set_warmup_sets] = useState(0);
  const [working_sets, set_working_sets] = useState(0);
  const [cooldown_sets, set_cooldown_sets] = useState(0);

  const addWarmupSet = async (pauseOrWorking, distance, pace, time, heartrate) => {
        set_warmup_sets(warmup_sets + 1);
        let trueorfalse = pauseOrWorking = left;
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
                [workout_id, warmup_sets, trueorfalse, distance, pace, time, heartrate]
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
                            set_type("WARMUP");
                            set_addRunSetModal_visible(true);
                        }}>
                        <Plus
                            width={24}
                            height={24}/>
                    </TouchableOpacity>
                </View>
            </View>

            <ThemedCard>
                <View style={styles.grid}> 
                    <View style={[styles.set, styles.sharedGrid]}>
                        <ThemedText > 1 </ThemedText>
                        <ThemedText style={{paddingLeft: 20}}>Pause</ThemedText>
                        <ThemedText > 2 </ThemedText>
                        <ThemedText style={{paddingLeft: 20}}>Pause</ThemedText>
                    </View>

                    <View style={[styles.distance, styles.sharedGrid]}>
                        <ThemedText> 5000 m </ThemedText>
                    </View>

                    <View style={[styles.pace, styles.sharedGrid]}>
                        <ThemedText> 6:00 </ThemedText>
                    </View>

                    <View style={[styles.time, styles.sharedGrid]}>
                        <ThemedText> 60 min </ThemedText>
                    </View>

                    <View style={[styles.zone, styles.sharedGrid]}>
                        <ThemedText> Zone 2 </ThemedText>
                    </View>

                </View>

                
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
        onClose={ () => {set_addRunSetModal_visible(false)}}
        onSubmit={ (pauseOrWorking, distance, pace, time, heartrate) => {

            if(type === "Warmup"){
                addWarmupSet();
            }

        }}
    />

    
    </>
  );
}

export default Run;
