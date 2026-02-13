// src/Components/ExerciseList/ExerciseList.js
import { useState } from "react";
import { View, Text, Button, TouchableOpacity } from "react-native";
import { useSQLiteContext } from "expo-sqlite";
import { useNavigation } from "@react-navigation/native";
import { useColorScheme } from "react-native";
import { Colors } from "../../../../../../../../Resources/GlobalStyling/colors";


import styles from "./ExerciseRowStyle";
import SetList from "./SetList/SetList";
import {checkUniformWeights, 
        checkUniformReps} from "../../Utils/checkUniformSets";

import {ThemedCard,
        ThemedText,
        ThemedButton,
        ThemedBouncyCheckbox,
        ThemedTitle} 
  from "../../../../../../../../Resources/ThemedComponents";


const ExerciseRow = ( {exercise, updateUI, onToggleSet, updateWeight} ) => {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme] ?? Colors.light;
  
  const [expandedExercises, setExpandedExercises] = useState({});

  const db = useSQLiteContext();
  const navigation = useNavigation();

  const toggleExpanded = (exercise_id) => {
    setExpandedExercises(prev => ({
      ...prev,
      [exercise_id]: !prev[exercise_id],
    }));
  };

  const deleteExercise = async (exercise_id) => {
    try {
      await db.runAsync(
        `DELETE FROM Exercise WHERE exercise_id = ?;`,
        [exercise_id]);
      updateUI?.();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <>
  
      <TouchableOpacity
        onPress={() => toggleExpanded(exercise.exercise_id)}>
        
        <View style={{flexDirection: "row"}}>
          
          <View style={{paddingLeft: 20}}>
            <ThemedTitle type={"h3"}>
              {exercise.exercise_name}
            </ThemedTitle>
          </View>

          <View style={[styles.done_box]}>
              <ThemedBouncyCheckbox
                value={exercise.done === 1}
                size= "20"
                edgeSize={2}
                disabled
                checkmarkColor={theme.cardBackground}
              />
          </View>
        </View>

        
        {expandedExercises[exercise.exercise_id] && (
          <View>
            <SetList 
                sets={exercise.sets}
                onToggleSet={onToggleSet}
                updateWeight={updateWeight}
                updateUI={updateUI} 
                />

            <TouchableOpacity
              onPress={() => toggleExpanded(exercise.exercise_id)}
              style={styles.hideset}>
              
            </TouchableOpacity>

          </View>
        )}

        {!expandedExercises[exercise.exercise_id] && (
          <ThemedCard>
            <ThemedText>
              3 x 5 @ 95
            </ThemedText>
          </ThemedCard>
        )}



      </TouchableOpacity>

    </>
  );
};

export default ExerciseRow;
