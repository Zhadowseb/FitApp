// src/Components/ExerciseList/ExerciseList.js
import { useState } from "react";
import { View, TouchableOpacity } from "react-native";
import { useSQLiteContext } from "expo-sqlite";
import { useEffect } from "react";
import { useNavigation } from "@react-navigation/native";

import styles from "./ExerciseListStyle";
import { weightliftingService as weightliftingRepository } from "../../../../../../Services";

import ExerciseRow from "./Components/ExerciseRow/ExerciseRow"
import Plus from "../../../../../../Resources/Icons/UI-icons/Plus";
import PickExerciseModal from "./Components/PickExerciseModal";

const ExerciseList = ({
  workout_id,
  refreshing,
  updateUI,
  showCompletedExercises = false,
  expansionAction,
}) => {
  const [exercises, setExercises] = useState([]);
  const [expandedExercises, setExpandedExercises] = useState({});
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
      setExpandedExercises((prev) => {
        const nextExpandedExercises = {};

        for (const exercise of exercises) {
          nextExpandedExercises[exercise.exercise_id] =
            prev[exercise.exercise_id] ?? false;
        }

        return nextExpandedExercises;
      });

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

  useEffect(() => {
    if (!expansionAction?.type) {
      return;
    }

    setExpandedExercises((prev) => {
      const nextExpandedExercises = { ...prev };

      for (const exercise of exercises) {
        nextExpandedExercises[exercise.exercise_id] =
          expansionAction.type === "expand";
      }

      return nextExpandedExercises;
    });
  }, [expansionAction]);

  const toggleExpanded = (exerciseId) => {
    setExpandedExercises((prev) => ({
      ...prev,
      [exerciseId]: !prev[exerciseId],
    }));
  };

  const renderItem = (item) => (
    <View key={item.exercise_id}>

      <ExerciseRow 
        exercise={item}
        isExpanded={Boolean(expandedExercises[item.exercise_id])}
        onToggleExpanded={() => toggleExpanded(item.exercise_id)}
        updateUI={updateUI}
        onToggleSet={updateSetDone}
        refreshing={refreshing}/>
    </View>
  );

  return (
    <>
    <View>
      {exercises
        .filter((item) => showCompletedExercises || Number(item.done) !== 1)
        .map((item) => renderItem(item))}
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
