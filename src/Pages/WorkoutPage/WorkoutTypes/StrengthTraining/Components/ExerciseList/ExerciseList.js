// src/Components/ExerciseList/ExerciseList.js
import { use, useState } from "react";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { SQLiteDatabase, useSQLiteContext } from "expo-sqlite";
import { useEffect } from "react";
import { useNavigation } from "@react-navigation/native";

import styles from "./ExerciseListStyle";
import { weightliftingRepository } from "../../../../../../Database/repository";

import ExerciseRow from "./Components/ExerciseRow/ExerciseRow"
import Plus from "../../../../../../Resources/Icons/UI-icons/Plus";
import PickExerciseModal from "./Components/PickExerciseModal";

const ExerciseList = ( {workout_id, refreshing, updateUI} ) => {
  const [exercises, setExercises] = useState([]);
  const [loading, setLoading] = useState(false);

  const [pickExerciseModal_visible, set_pickExerciseModal_visible] = useState(false);

  const db = useSQLiteContext();
  const navigation = useNavigation();

  const loadExercises = async () => {
    try {
      setLoading(true);

      const exercises = await weightliftingRepository.getWorkoutExercises(
        db,
        workout_id
      );
      setExercises(exercises);

    } catch (error) {
      console.error("Error loading exercises", error);
    } finally {
      setLoading(false);
    }
  };

  const updateSetDone = async (sets_id, done) => {
    try {
      await weightliftingRepository.updateStrengthSetDone(db, {
        workoutId: workout_id,
        setId: sets_id,
        done,
      });

      //Reloades ui
      loadExercises();
      updateUI();

    } catch (error) {
      console.error("updateSetDone failed:", error);
      throw error;
    }
  };


  useEffect(() => {
    loadExercises();
  }, [refreshing]);

  useEffect(() => {
    loadExercises();
  }, []);

  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", () => {
      loadExercises();
    });

    return unsubscribe;
  }, [navigation]);

  const renderItem = (item) => (
    <View key={item.exercise_id}>

      <ExerciseRow 
        exercise={item}
        updateUI={updateUI}
        onToggleSet={updateSetDone}
        refreshing={refreshing}/>
    </View>
  );

  return (
    <>
    <View>
      {exercises.map((item) => renderItem(item))}
    </View>

    <View style={{alignItems: "center", paddingTop: 30}}>

      <TouchableOpacity
        onPress={ () => {
          set_pickExerciseModal_visible(true);
        }}>
        <Plus
          width={30}
          height={30} />
      </TouchableOpacity>
    </View>

    <PickExerciseModal
      visible={pickExerciseModal_visible}
      workout_id={workout_id}
      onClose={() => set_pickExerciseModal_visible(false)}
      onSubmit={loadExercises}
    />
    </>
  );
};

export default ExerciseList;
