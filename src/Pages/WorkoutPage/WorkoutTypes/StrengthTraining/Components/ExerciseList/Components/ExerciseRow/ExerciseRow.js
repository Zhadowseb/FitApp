// src/Components/ExerciseList/ExerciseList.js
import { useState, useEffect } from "react";
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
import PanelSettingsModal from "./PanelSettingsModal";
import { weightliftingService as weightliftingRepository } from "../../../../../../../../Services";


const ExerciseRow = ( {exercise, updateUI, onToggleSet, updateWeight} ) => {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme] ?? Colors.light;
  
  const [expandedExercises, setExpandedExercises] = useState({});
  const [visibleColumns, set_VisibleColumns] = useState(exercise.visibleColumns);

  const [panelModalVisible, set_panelModalVisible] = useState(false);
  const [selectedExercise, set_selectedExercise] = useState(null);

  const db = useSQLiteContext();
  const navigation = useNavigation();

  useEffect(() => {
    set_VisibleColumns(exercise.visibleColumns);
  }, [exercise.visibleColumns]);

  const toggleExpanded = (exercise_id) => {
    setExpandedExercises(prev => ({
      ...prev,
      [exercise_id]: !prev[exercise_id],
    }));
  };

  const deleteExercise = async (exercise_id) => {
    try {
      await weightliftingRepository.deleteExercise(db, exercise_id);
 
      updateUI?.();
    } catch (error) {
      console.error(error);
    }
  };

  const addSet = async () => {
    try {
      await weightliftingRepository.addSetToExercise(db, exercise.exercise_id);
      updateUI?.();
    } catch (error) {
      console.error(error);
    }
  };

  const saveColumns = async (columns) => {
    await weightliftingRepository.updateExerciseVisibleColumns(db, {
      exerciseId: exercise.exercise_id,
      columns,
    });

    set_VisibleColumns(columns);
  };

  return (
    <>
      <View style={{
        borderWidth: 0.2,
        borderRadius: 20,
        marginBottom: 5,
        marginLeft: 5,
        marginRight: 5,
        backgroundColor: exercise.done && "rgba(96, 218, 171, 0.75)",
        borderColor: "#858584"}}>

      <View style={{
        paddingTop: 10,
        paddingBottom: 10,
        flexDirection: "row"}}>
      
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

        <TouchableOpacity
          onPress={() => addSet()}>
            <Plus
              width={24}
              height={24} />
        </TouchableOpacity>
        </View>
        
        <View style={styles.ui_icons}>
        <TouchableOpacity
          onPress={() => {
            set_panelModalVisible(true);
            set_selectedExercise(exercise.exercise_id);
          }}>
            <Cogwheel
              width={24}
              height={24} />
        </TouchableOpacity>
        </View>

      </View>

    </View> 
  
      <TouchableOpacity
        onPress={() => toggleExpanded(exercise.exercise_id)}>

        {!expandedExercises[exercise.exercise_id] && exercise.sets.length !== 0 && (
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
              exerciseName={exercise.exercise_name}
              visibleColumns={visibleColumns}
              onToggleSet={onToggleSet}
              updateWeight={updateWeight}
              updateUI={updateUI} 
              />
        </View>
      )}

      {/* White border wrapping exercise and sheets */}
      </View>

      <PanelSettingsModal
        visible={panelModalVisible}
        currentColumns={visibleColumns}
        exercise_id={selectedExercise}
        deleteExercise={deleteExercise}
        onClose={(columns) => {
          saveColumns(columns);
          set_panelModalVisible(false)
        }}/>

    </>
  );
};

export default ExerciseRow;
