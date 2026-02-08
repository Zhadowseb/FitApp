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
        ThemedHeader } 
  from "../../../../Resources/Components/";

import WorkoutStopwatch from '../../../../Resources/Components/StopWatch';
import Plus from '../../../../Resources/Icons/UI-icons/Plus';

const Run = ({workout_id}) =>  {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme] ?? Colors.light;

  const db = useSQLiteContext();

  return (
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
                    <TouchableOpacity>
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
  );
}

export default Run;
