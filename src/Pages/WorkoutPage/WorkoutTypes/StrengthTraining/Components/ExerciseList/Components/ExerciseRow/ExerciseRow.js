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
import Note from "../../../../../../../../Resources/Icons/UI-icons/Note";

import {ThemedCard,
        ThemedText,
        ThemedBouncyCheckbox,
        ThemedModal,
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
  const [exerciseNote, setExerciseNote] = useState(exercise.note ?? "");

  const [panelModalVisible, set_panelModalVisible] = useState(false);
  const [noteModalVisible, set_noteModalVisible] = useState(false);
  const [selectedExercise, set_selectedExercise] = useState(null);

  const db = useSQLiteContext();
  const navigation = useNavigation();

  useEffect(() => {
    set_VisibleColumns(exercise.visibleColumns);
  }, [exercise.visibleColumns]);

  useEffect(() => {
    setExerciseNote(exercise.note ?? "");
  }, [exercise.note]);

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

  const saveExerciseSettings = async ({ columns, note }) => {
    await weightliftingRepository.updateExerciseVisibleColumns(db, {
      exerciseId: exercise.exercise_id,
      columns,
    });
    await weightliftingRepository.updateExerciseNote(db, {
      exerciseId: exercise.exercise_id,
      note,
    });

    set_VisibleColumns(columns);
    setExerciseNote(note);
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

        {exerciseNote.trim().length > 0 && (
        <View style={styles.ui_icons}>
          <TouchableOpacity
            onPress={() => set_noteModalVisible(true)}>
              <Note
                width={24}
                height={24} />
          </TouchableOpacity>
        </View>
        )}
        
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
        currentNote={exerciseNote}
        onDelete={async () => {
          await deleteExercise(selectedExercise);
          set_panelModalVisible(false);
        }}
        onClose={async ({ columns, note }) => {
          await saveExerciseSettings({ columns, note });
          set_panelModalVisible(false);
        }}/>

      <ThemedModal
        visible={noteModalVisible}
        onClose={() => set_noteModalVisible(false)}
        title="Note"
      >
        <ThemedText>
          {exerciseNote}
        </ThemedText>
      </ThemedModal>

    </>
  );
};

export default ExerciseRow;
