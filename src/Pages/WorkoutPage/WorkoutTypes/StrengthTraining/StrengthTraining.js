import { StatusBar } from 'expo-status-bar';
import { AppState, View, Button, ScrollView, Text, TouchableOpacity, Switch, Vibration } from 'react-native';
import { useState, useCallback, useEffect, useRef } from "react";
import { useSQLiteContext } from "expo-sqlite";
import { useFocusEffect } from "@react-navigation/native";

import ExerciseList from './Components/ExerciseList/ExerciseList';
import CircularProgression from '../../../../Resources/Components/CircularProgression';
import { useColorScheme } from "react-native";
import { Colors } from "../../../../Resources/GlobalStyling/colors";

import styles from "../../WorkoutPageStyle";
import { ThemedTitle, 
        ThemedCard, 
        ThemedBottomSheet,
        ThemedView, 
        ThemedText, 
        ThemedButton, 
        ThemedModal,
        ThemedHeader } 
  from "../../../../Resources/ThemedComponents";
import { formatTime, formatWorkoutStart } from '../../../../Utils/timeUtils';
import { weightliftingService, workoutService} from "../../../../Services";

//Icons:
import Filter from '../../../../Resources/Icons/UI-icons/Filter';
import Checkmark from '../../../../Resources/Icons/UI-icons/Checkmark';

const StrengthTraining = ({workout_id, date}) =>  {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme] ?? Colors.light;

  const db = useSQLiteContext();

  const [refreshing, set_refreshing] = useState(0);
  const [filterBottomsheetVisible, setFilterBottomsheetVisible] = useState(false);
  const [showCompletedExercises, setShowCompletedExercises] = useState(true);

  const [totalSets, set_totalSets] = useState(0);
  const [doneSets, set_doneSets] = useState(0);

  //Workout timer state:
  const [original_start_time, set_original_start_time] = useState(null);
  const [timer_start, set_timer_start] = useState(null);
  const [elapsed_time, set_elapsed_time] = useState(0);
  const [isDone, set_isDone] = useState(false);
  const [isRunning, set_isRunning] = useState(false);
  const timerStartRef = useRef(null);
  const elapsedTimeRef = useRef(0);

  const refresh = () => {
    set_refreshing(prev => prev + 1);
  }

  useEffect(() => {
    timerStartRef.current = timer_start;
  }, [timer_start]);

  useEffect(() => {
    elapsedTimeRef.current = elapsed_time;
  }, [elapsed_time]);

  const persistCurrentTimerState = useCallback(async () => {
    await workoutService.persistWorkoutTimerState(db, {
      workoutId: workout_id,
      timerStart: timerStartRef.current,
      elapsedTime: elapsedTimeRef.current,
    });
  }, [db, workout_id]);

  const loadTotalSets = async () => {
    try {
      const result =
        await weightliftingService.getStrengthWorkoutSummary(db, workout_id);
      set_totalSets(result.totalSets);
    } catch (err) {
      console.error("Failed to load the amount of sets to do for this workout:", err);
    }
  };

  const loadCompletedSets = async () => {
    try {
      const result =
        await weightliftingService.getStrengthWorkoutSummary(db, workout_id);
      set_doneSets(result.doneSets);
    } catch (err) {
      console.error("Failed to load the done sets for this workout:", err);
    }
  };

  //Focus coming back to the page
  useFocusEffect(
    useCallback(() => {
      
      loadTotalSets();
      loadCompletedSets();

      const reload = async () => {
          const row = await workoutService.getWorkoutTimerState(db, workout_id);
          const nextIsDone = Number(row.done) === 1;

          set_isRunning(row.timer_start !== null && !nextIsDone);
          set_isDone(nextIsDone);
          set_original_start_time(row.original_start_time);
          set_timer_start(row.timer_start);
          set_elapsed_time(row.elapsed_time);
      }
      reload();

    }, [workout_id])
  );  

  useEffect(() => {
    const subscription = AppState.addEventListener("change", (nextAppState) => {
      if (nextAppState === "inactive" || nextAppState === "background") {
        persistCurrentTimerState();
      }
    });

    return () => {
      subscription.remove();
    };
  }, [persistCurrentTimerState]);

  useEffect(() => {
    return () => {
      persistCurrentTimerState();
    };
  }, [persistCurrentTimerState]);

  useEffect(() => {
    loadCompletedSets();
    loadTotalSets();
  }, [refreshing]);

  //Time loop
  useEffect(() => {
    if(!isRunning) return;

    const interval = setInterval(() => {
      refresh()
    }, 1000);

    return () => clearInterval(interval);
  }, [isRunning, isRunning, timer_start]);

  const computeCurrentElapsed = () => {
      if (!timer_start) return 0;

      return Math.floor(
          (Date.now() - timer_start) / 1000
      );
  };

  const updateElapsed = async () => {
      const newElapsed = Math.floor(
          elapsed_time + computeCurrentElapsed()
      );
      
      await workoutService.persistWorkoutTimerState(db, {
          workoutId: workout_id,
          timerStart: null,
          elapsedTime: newElapsed,
      });

      elapsedTimeRef.current = newElapsed;
      timerStartRef.current = null;
      set_elapsed_time(newElapsed);
      return newElapsed;
  };

  const startWorkout = async () => {
    const row = await workoutService.getWorkoutOriginalStartTime(db, workout_id);

    //Miliseconds since 1. januar 1970 at 00:00:00 UTC
    const start_time = Date.now();

    if(row.original_start_time === null){
        set_original_start_time(start_time);
        await workoutService.setWorkoutOriginalStartTime(db, {
            workoutId: workout_id,
            startTime: start_time,
        });
    } 

    await workoutService.persistWorkoutTimerState(db, {
      workoutId: workout_id,
      timerStart: start_time,
      elapsedTime: elapsed_time,
    });

    timerStartRef.current = start_time;
    set_isRunning(true);
    set_timer_start(start_time);
    Vibration.vibrate(500);
  };

  const pauseWorkout = async () => {
      const newElapsed = await updateElapsed();
      set_isRunning(false);
      set_timer_start(null);
      set_elapsed_time(newElapsed);
      Vibration.vibrate([0, 100, 100, 100]);
  };

  const endWorkout = async () => {
    const finalElapsed = timer_start ? await updateElapsed() : elapsed_time;

    set_isRunning(false);
    set_isDone(true);
    set_timer_start(null);
    set_elapsed_time(finalElapsed);
    
    await workoutService.setWorkoutDone(db, {
      workoutId: workout_id,
      done: true,
    });
  };

  const restartWorkout = async () => {
    await workoutService.resetWorkoutState(db, workout_id);
    set_original_start_time(null);
    set_timer_start(null);
    set_elapsed_time(0);
    set_isRunning(false);
    set_isDone(false);
    refresh();
  }


  return (
    <ThemedView>

      <ScrollView>

        <View style={{ 
          justifyContent: "center",
          width: "95%"}}>


          <ThemedCard style={{
            alignItems: "center",
            justifyContent: "center",
            width: "100%",
            height: 200}}>

              {/*Buttons, Timer Info, Timer Display, Progression Circle */}
              <View style={{flexDirection: "column", alignItems: "center"}}>
                
                  {/* Timer Info, Timer display, Progression Circle*/}
                  <View style={{ 
                    alignItems: "center",
                    justifyContent: "space-between",
                    flex: 1,
                    flexDirection: "row"}}>
                      
                      {/*Workout timer info. */}
                      <View style={{
                        alignItems: "center",
                        width: "50%"}}>

                        {original_start_time !== null ? (
                          <View style={{height: 30}}> 
                              <ThemedText size={10} setColor={theme.quietText}>
                                  Workout started on:
                              </ThemedText>
                              <ThemedText size={10} setColor={theme.quietText}>
                                  {formatWorkoutStart(original_start_time)}
                              </ThemedText>
                          </View>
                        ) : (
                          <View style={{height: 30, justifyContent: "center"}}>
                            <ThemedText size={10} setColor={theme.quietText}>
                                Workout not started.
                            </ThemedText>
                          </View>
                        )}

                        {/* Actual time display */}
                        <ThemedText size={15}>
                            Elapsed time
                        </ThemedText>
                        <ThemedText size={30}>
                            {formatTime(elapsed_time + computeCurrentElapsed())}
                        </ThemedText>
                      </View>

                      {/* Set progression circle */}
                      <View style={{  
                        width: "50%",
                        alignItems: "center",
                        justifyContent: "center"}}>
                        <CircularProgression
                          size = {110}
                          strokeWidth = {12} 
                          text= {doneSets + "/" + totalSets}
                          textSize = {16}
                          progressPercent = {(doneSets/totalSets) * 100}
                        />
                      </View>
                  </View>

                  {/* Timer buttons */}
                  <View style={{
                    flexDirection: "row",
                    height: 50}}>

                      {!isRunning && !isDone && (
                      <View style={{paddingRight: 5}}>
                          <ThemedButton
                              title={
                                  (original_start_time !== null) ?
                                      "Continue"
                                      : "Start" }
                              onPress={startWorkout}
                              variant='secondary'
                              disabled={isDone || isRunning}>
                          </ThemedButton>
                      </View>
                      )}

                      {isRunning && (
                      <View>
                          <ThemedButton
                              title={"Pause"}
                              onPress={pauseWorkout}
                              variant='primary'
                              disabled={!isRunning || isDone}>
                          </ThemedButton>
                      </View>
                      )}

                      {!isRunning && !isDone && (original_start_time !== null) && (
                      <View style={{paddingLeft: 5}}>
                          <ThemedButton
                              title={"Finish"}
                              onPress={endWorkout}
                              variant='danger'
                              disabled={
                                  original_start_time === null ||
                                  isDone}>
                          </ThemedButton>
                      </View>
                      )}

                      {isDone && (
                          <View style={{paddingTop: 5}}>
                              <ThemedButton
                                  title={"Restart"}
                                  onPress={restartWorkout}
                                  variant='danger'
                                  disabled={
                                      original_start_time === null ||
                                      !isDone}>
                              </ThemedButton>
                          </View>
                      )}

                  </View>
              </View>
          </ThemedCard>
        </View>

        <TouchableOpacity
          style={{ alignSelf: "flex-end", marginRight: 8, marginBottom: 5 }}
          onPress={() => {
            setFilterBottomsheetVisible(true);
          }}
        >
          <Filter
            width={24}
            height={24}/>

        </TouchableOpacity>

        <View style={styles.working_sets}>

          <ExerciseList 
            workout_id = {workout_id}
            refreshing = {refreshing} 
            updateUI = {refresh}
            showCompletedExercises={showCompletedExercises}/>
        </View> 

      </ScrollView>

      <ThemedBottomSheet
        visible={filterBottomsheetVisible}
        onClose={() => setFilterBottomsheetVisible(false)}
      >
        <View style={styles.bottomsheetTitle}>
          <ThemedText>Filter exercises</ThemedText>
        </View>

        <View style={styles.bottomsheetBody}>
          <TouchableOpacity
            style={[styles.option, styles.filterOption]}
            onPress={() => {
              setShowCompletedExercises((prev) => !prev);
            }}
          >
            <ThemedText style={styles.filterOptionText}>
              Show completed exercises
            </ThemedText>

            {showCompletedExercises && (
              <Checkmark
                width={24}
                height={24}/>
            )}
          </TouchableOpacity>
        </View>
      </ThemedBottomSheet>
    </ThemedView>
  );
}

export default StrengthTraining;
