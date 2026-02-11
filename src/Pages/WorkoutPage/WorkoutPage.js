import { StatusBar } from 'expo-status-bar';
import { View, Button, ScrollView, Text, TouchableOpacity, Switch } from 'react-native';
import { useState, useCallback, useEffect } from "react";
import { useSQLiteContext } from "expo-sqlite";
import { useFocusEffect } from "@react-navigation/native";

import { WORKOUT_ICONS } from '../../Resources/Icons/WorkoutLabels';
import { useColorScheme } from "react-native";
import { Colors } from "../../Resources/GlobalStyling/colors";

import styles from "./WorkoutPageStyle";
import { ThemedTitle, 
        ThemedCard, 
        ThemedView, 
        ThemedText, 
        ThemedSwitch, 
        ThemedModal,
        ThemedHeader } 
  from "../../Resources/Components";

//Types of workouts:
import Run from "./WorkoutTypes/Run/Run";
import StrengthTraining from "./WorkoutTypes/StrengthTraining/StrengthTraining";

const WorkoutPage = ({route}) =>  {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme] ?? Colors.light;
  const db = useSQLiteContext();

  const {workout_id, workout_label, day, date} = route.params;

  const SelectedIcon =
    WORKOUT_ICONS.find(item => item.id === workout_label)?.Icon;

  return (
    <ThemedView>

      <ThemedHeader right={
        SelectedIcon && (
          <View style={styles.label}>
            <SelectedIcon
              width={50}
              height={50}
              backgroundColor={theme.background}
            />
          </View> )
      }>
          
          <ThemedText size={18}> {workout_label}  </ThemedText>
          <ThemedText size={10}> {day} - {date}  </ThemedText>
      
      </ThemedHeader>

      {workout_label === "Run" && (
        <Run
          workout_id={workout_id}/>
      )}

      {workout_label === "Upperbody" && (
        <StrengthTraining
          workout_id={workout_id}
          date={date}/>
      )}

    </ThemedView>
  );
}

export default WorkoutPage;