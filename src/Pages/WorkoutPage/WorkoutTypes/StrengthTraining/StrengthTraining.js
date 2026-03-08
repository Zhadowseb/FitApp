import { StatusBar } from 'expo-status-bar';
import { View, Button, ScrollView, Text, TouchableOpacity, Switch } from 'react-native';
import { useState, useCallback, useEffect } from "react";
import { useSQLiteContext } from "expo-sqlite";
import { useFocusEffect } from "@react-navigation/native";

import ExerciseList from './Components/ExerciseList/ExerciseList';
import CircularProgression from '../../../../Resources/Components/CircularProgression';
import { useColorScheme } from "react-native";
import { Colors } from "../../../../Resources/GlobalStyling/colors";

import styles from "../../WorkoutPageStyle";
import { ThemedTitle, 
        ThemedCard, 
        ThemedView, 
        ThemedText, 
        ThemedButton, 
        ThemedModal,
        ThemedHeader } 
  from "../../../../Resources/ThemedComponents";
import { formatTime, formatWorkoutStart } from '../../../../Utils/timeUtils';

const StrengthTraining = ({workout_id, date}) =>  {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme] ?? Colors.light;

  const db = useSQLiteContext();

  const [refreshing, set_refreshing] = useState(0);

  const [totalSets, set_totalSets] = useState(0);
  const [doneSets, set_doneSets] = useState(0);

  //Workout timer state:
  const [original_start_time, set_original_start_time] = useState(null);
  const [timer_start, set_timer_start] = useState(null);
  const [elapsed_time, set_elapsed_time] = useState(0);
  const [isDone, set_isDone] = useState(false);
  const [isRunning, set_isRunning] = useState(false);

  const refresh = () => {
    set_refreshing(prev => prev + 1);
  }

  const loadTotalSets = async () => {
    try {
      const result = await db.getFirstAsync(
        `SELECT SUM(sets) AS count FROM Exercise WHERE workout_id = ?`,
        [workout_id]
      );
      set_totalSets(result.count);
    } catch (err) {
      console.error("Failed to load the amount of sets to do for this workout:", err);
    }
  };

  const loadCompletedSets = async () => {
    try {
      const result = await db.getFirstAsync(
        `SELECT COUNT(*) AS done_sets
          FROM Sets s
          JOIN Exercise e ON e.exercise_id = s.exercise_id
          WHERE e.workout_id = ?
            AND s.done = 1; 
          `, [workout_id]);
      set_doneSets(result.done_sets);
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
          const row = await db.getFirstAsync(
              `SELECT 
                  done,
                  original_start_time,
                  timer_start, 
                  elapsed_time FROM Workout 
              WHERE workout_id = ?;`,
              [workout_id]
          );

          if(row.timer_start !== null){
              set_isRunning(true);
          }
          set_isDone(Number(row.done) === 1);
          set_original_start_time(row.original_start_time);
          set_timer_start(row.timer_start);
          set_elapsed_time(row.elapsed_time);
      }
      reload();

    }, [workout_id])
  );  

  //Save leaving page
  useFocusEffect(
      useCallback(() => {
          return () => {
              
              const saveState = async () => {
                  await db.getFirstAsync(
                      `UPDATE Workout
                          SET timer_start = ?, 
                          elapsed_time = ?
                          WHERE workout_id = ?;`,
                      [timer_start, elapsed_time, workout_id]
                  );  
              }
              saveState();
          };

      }, [timer_start, elapsed_time])
  );

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
      
      await db.runAsync(
          `UPDATE Workout
              SET elapsed_time = ?
              WHERE workout_id = ?;`,
          [newElapsed, workout_id]
      );  

      set_elapsed_time(newElapsed);
  };

  const startWorkout = async () => {
    set_isRunning(true);

    const row = await db.getFirstAsync(
        `SELECT original_start_time FROM Workout 
        WHERE workout_id = ?;`,
        [workout_id]
    );

    //Miliseconds since 1. januar 1970 at 00:00:00 UTC
    const start_time = Date.now();
    set_timer_start(start_time);

    if(row.original_start_time === null){
        set_original_start_time(start_time);
        await db.runAsync(
            `UPDATE Workout SET original_start_time = ? 
            WHERE workout_id = ?;`,
            [start_time, workout_id]
        );
    } 
    Vibration.vibrate(500);
  };

  const pauseWorkout = async () => {
      updateElapsed();
      set_isRunning(false);
      set_timer_start(null);
      Vibration.vibrate([0, 100, 100, 100]);
  };

  const endWorkout = async () => {
    set_isRunning(false);
    set_isDone(true);
    set_timer_start(null);
    
    //Set workout done
    await db.runAsync(
        `UPDATE Workout SET done = 1
        WHERE workout_id = ?;`,
        [workout_id]
    );
  };

  const restartWorkout = async () => {
    await db.runAsync(
        `UPDATE Workout SET 
            done = 0,
            original_start_time = NULL,
            timer_start = NULL, 
            elapsed_time = 0
            WHERE workout_id = ?;`,
        [workout_id]
    );
    set_original_start_time(null);
    set_timer_start(null);
    set_elapsed_time(0);
    set_isRunning(false);
    set_isDone(false);
    triggerReload();
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

        <View style={styles.working_sets}>

          <ExerciseList 
            workout_id = {workout_id}
            refreshing = {refreshing} 
            updateUI = {refresh}/>
        </View> 

      </ScrollView>
    </ThemedView>
  );
}

export default StrengthTraining;