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
  from "../../../../Resources/ThemedComponents";

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

    const [warmupEmpty, set_WarmupEmpty] = useState(true);
    const [workingEmpty, set_WorkingEmpty] = useState(true);
    const [cooldownEmpty, set_CooldownEmpty] = useState(true);

    const addSet = async (setVariety) => {
        try {
            const row = await db.getFirstAsync(
                `SELECT COUNT(*) as count FROM Run WHERE 
                    workout_id = ? AND 
                    type = ?;`,
                [workout_id, setVariety]
            );

            const set_number = row.count + 1;

            await db.runAsync(
            `INSERT INTO Run (workout_id, type, set_number) 
                VALUES (?, ?, ?);`,
            [workout_id, setVariety, set_number]);
            triggerReload();
        } catch (error) {
            console.error("Failed to add warmup set:", error);
        }
    };


  return (
    <>
    <ScrollView>
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
            <View style={{opacity: warmupEmpty ? 0.2 : 1}}>
                <ThemedTitle type={"h2"}>
                    Warmup
                </ThemedTitle>
            </View>

            <View style={{marginLeft: "auto", marginRight: "15"}}>
                <TouchableOpacity
                    onPress={ () => {
                        addSet("WARMUP")
                    }}>
                    <Plus
                        width={24}
                        height={24}/>
                </TouchableOpacity>
            </View>
        </View>

        <RunSetList
            reloadKey={updateCount}
            triggerReload={triggerReload}
            empty={set_WarmupEmpty}
            workout_id={workout_id}
            type="WARMUP" />
    </View>



    <View>
        <View style={{flexDirection: "row", alignItems: "center"}}>
            <View style={{opacity: workingEmpty ? 0.2 : 1}}>
                <ThemedTitle type={"h2"}>
                    Working Sets
                </ThemedTitle>
            </View>

            <View style={{marginLeft: "auto", marginRight: "15"}}>
                <TouchableOpacity
                    onPress={ () => {
                        addSet("WORKING_SET");
                    }}>
                    <Plus
                        width={24}
                        height={24}/>
                </TouchableOpacity>
            </View>
        </View>

        <RunSetList
            reloadKey={updateCount}
            triggerReload={triggerReload}
            empty={set_WorkingEmpty}
            workout_id={workout_id}
            type="WORKING_SET"
        />

    </View>


    <View>
        <View style={{flexDirection: "row", alignItems: "center"}}>
            <View style={{opacity: cooldownEmpty ? 0.2 : 1}}>
                <ThemedTitle type={"h2"}>
                    Cooldown
                </ThemedTitle>
            </View>

            <View style={{marginLeft: "auto", marginRight: "15"}}>
                <TouchableOpacity
                    onPress={ () => {
                        addSet("COOLDOWN");
                    }}>
                    <Plus
                        width={24}
                        height={24}/>
                </TouchableOpacity>
            </View>
        </View>

        <RunSetList
            reloadKey={updateCount}
            triggerReload={triggerReload}
            empty={set_CooldownEmpty}
            workout_id={workout_id}
            type="COOLDOWN"
        />
    </View>
    </ScrollView>
    </>
  );
}

export default Run;
