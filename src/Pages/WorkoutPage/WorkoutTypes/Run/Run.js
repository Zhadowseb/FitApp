import { StatusBar } from 'expo-status-bar';
import { View, Button, ScrollView, Text, TouchableOpacity, Switch } from 'react-native';
import { useState, useCallback, useEffect } from "react";
import { useSQLiteContext } from "expo-sqlite";
import { useFocusEffect } from "@react-navigation/native";
import RunSetList from "./RunSetList";
import ListHeader from './ListHeader';

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
    const db = useSQLiteContext();

    const [updateCount, set_updateCount] = useState(0);
    const triggerReload = () => {
        set_updateCount(prev => prev + 1);
    };

  const [addRunSetModal_visible, set_addRunSetModal_visible] = useState(false);


  const [type, set_type] = useState("WORKING_SET");

  const [warmup_sets, set_warmup_sets] = useState(0);
  const [working_sets, set_working_sets] = useState(0);
  const [cooldown_sets, set_cooldown_sets] = useState(0);

    const addSet = async (setVariety, pauseOrWorking, distance, pace, time, heartrate) => {
        try {
            const row = await db.getFirstAsync(
                `SELECT COUNT(*) as count FROM Run WHERE workout_id = ? AND type = ?;`,
                [workout_id, setVariety]
            );

            const set_number = row.count + 1;
            const is_pause = pauseOrWorking === "right" ? 1 : 0;

            await db.runAsync(
            `INSERT INTO Run (
                workout_id,
                type,
                set_number,
                is_pause,
                distance,
                pace,
                time,
                heartrate
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?);`,
            [
                workout_id,
                setVariety,
                set_number,
                is_pause,
                Number(distance) || null,
                Number(pace) || null,
                Number(time) || null,
                Number(heartrate) || null,
            ]
            );
            triggerReload();
        } catch (error) {
            console.error("Failed to add warmup set:", error);
        }
    };


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
                <ListHeader
                    styles={styles}/>

                <RunSetList
                    reloadKey={updateCount}
                    workout_id={workout_id}
                    type="WARMUP" />
            </ThemedCard>
        </View>



        <View>
            <View style={{flexDirection: "row", alignItems: "center"}}>
                <ThemedTitle type={"h2"}>
                    Working Sets
                </ThemedTitle>

                <View style={{marginLeft: "auto", marginRight: "15"}}>
                    <TouchableOpacity
                        onPress={ () => {
                            set_type("WORKING_SET");
                            set_addRunSetModal_visible(true);
                        }}>
                        <Plus
                            width={24}
                            height={24}/>
                    </TouchableOpacity>
                </View>
            </View>

            <ThemedCard>
                <ListHeader
                    styles={styles}/>

                <RunSetList
                    reloadKey={updateCount}
                    workout_id={workout_id}
                    type="WORKING_SET"
                />
            </ThemedCard>
        </View>


        <View>
            <View style={{flexDirection: "row", alignItems: "center"}}>
                <ThemedTitle type={"h2"}>
                    Cooldown
                </ThemedTitle>

                <View style={{marginLeft: "auto", marginRight: "15"}}>
                    <TouchableOpacity
                        onPress={ () => {
                            set_type("COOLDOWN");
                            set_addRunSetModal_visible(true);
                        }}>
                        <Plus
                            width={24}
                            height={24}/>
                    </TouchableOpacity>
                </View>
            </View>

            <ThemedCard>
                <ListHeader
                    styles={styles}/>
                    
                <RunSetList
                    reloadKey={updateCount}
                    workout_id={workout_id}
                    type="COOLDOWN"
                />
            </ThemedCard>
        </View>


    </ThemedView>

    <AddRunSetModal
        visible={addRunSetModal_visible}
        onClose={ () => {set_addRunSetModal_visible(false)}}
        onSubmit={({ pauseOrWorking, distance, pace, time, heartrate }) => {
            if (type === "WARMUP") {
                addSet("WARMUP", pauseOrWorking, distance, pace, time, heartrate);
            }
            if (type === "WORKING_SET") {
                addSet("WORKING_SET", pauseOrWorking, distance, pace, time, heartrate);
            }
            if (type === "COOLDOWN") {
                addSet("COOLDOWN", pauseOrWorking, distance, pace, time, heartrate);
            }
        }}
    />

    
    </>
  );
}

export default Run;
