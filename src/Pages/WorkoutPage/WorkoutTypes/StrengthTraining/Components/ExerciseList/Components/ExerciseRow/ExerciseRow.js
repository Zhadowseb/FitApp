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

//UI icons
import Cogwheel from "../../../../../../../../Resources/Icons/UI-icons/Cogwheel";

import {ThemedCard,
        ThemedText,
        ThemedButton,
        ThemedBouncyCheckbox,
        ThemedTitle} 
  from "../../../../../../../../Resources/ThemedComponents";
import Expand from "../../../../../../../../Resources/Icons/UI-icons/Expand";
import Plus from "../../../../../../../../Resources/Icons/UI-icons/Plus";
import Colapse from "../../../../../../../../Resources/Icons/UI-icons/Colapse";


const ExerciseRow = ( {exercise, updateUI, onToggleSet, updateWeight} ) => {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme] ?? Colors.light;
  
  const [expandedExercises, setExpandedExercises] = useState({});

  const [panelModalVisible, set_panelModalVisible] = useState(false);

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
      <View style={{flexDirection: "row", paddingTop: 20}}>
      
      <View style={[styles.done_box]}>
          <ThemedBouncyCheckbox
            value={exercise.done === 1}
            size= "20"
            edgeSize={2}
            disabled
            checkmarkColor={theme.cardBackground}
          />
      </View>
      
      <View style={{flexDirection: "row"}}>
        <ThemedTitle type={"h3"}>
          {exercise.exercise_name}
        </ThemedTitle>

        {expandedExercises[exercise.exercise_id] && (

        <TouchableOpacity
          onPress={() => toggleExpanded(exercise.exercise_id)}>
          
          <View style={{paddingLeft: 5}}>
            <Colapse
              width={24}
              height={24}
            />
          </View>

        </TouchableOpacity>
        )}
      </View>

      <View style={styles.icon_container}>
        
        <View style={styles.ui_icons}>
          <Plus
            width={24}
            height={24} />
        </View>
        
        <View style={styles.ui_icons}>
        <TouchableOpacity
          onPress={() => set_panelModalVisible(true)}>

        </TouchableOpacity>
          <Cogwheel
            width={24}
            height={24} />
        </View>

      </View>

    </View> 
  
      <TouchableOpacity
        onPress={() => toggleExpanded(exercise.exercise_id)}>

        {!expandedExercises[exercise.exercise_id] && (
          <ThemedCard style={{flexDirection: "row"}}>
            
            <View>
              <ThemedText>
               {exercise.setCount} sets of {checkUniformReps(exercise.sets)} with {checkUniformWeights(exercise.sets)} kg
              </ThemedText>
            </View>

            <View style={{marginLeft: "auto"}}>
              <Expand
                width={20}
                height={20}
              />
            </View>
          </ThemedCard>
        )}
      </TouchableOpacity>

      {expandedExercises[exercise.exercise_id] && (
        <View>
          <SetList 
              sets={exercise.sets}
              onToggleSet={onToggleSet}
              updateWeight={updateWeight}
              updateUI={updateUI} 
              />
        </View>
      )}
    </>
  );
};

export default ExerciseRow;
