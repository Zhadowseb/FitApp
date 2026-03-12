import { useEffect, useState } from "react";
import { View, Text, FlatList, TouchableOpacity } from "react-native";
import { SQLiteDatabase, useSQLiteContext } from "expo-sqlite";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import PickWorkoutModal from "../../../WeekPage/Components/Day/Components/PickWorkoutModal/PickWorkoutModal";
import CircularProgression from "../../../../Resources/Components/CircularProgression";

import { getTodaysDate } from '../../../../Utils/dateUtils';
import { programRepository } from "../../../../Database/repository";

import styles from "./TodayShortcutStyle"
import { ThemedTitle, ThemedCard, ThemedView, ThemedText } 
  from "../../../../Resources/ThemedComponents";

const TodayShortcut = ( {program_id} ) => {
    const db = useSQLiteContext();
    const navigation = useNavigation();

    const [day, set_day] = useState(null);
    const date = getTodaysDate();
    const [workouts, set_workouts] = useState([]);
    const [counts, setCounts] = useState({ done: 0, total: 0 });
    const [progress, setProgress] = useState(0);

    const [pickWorkoutModal_visible, set_pickWorkoutModal_visible] = useState(false);
    
    const getToday = async () => {
        try{
            const snapshot = await programRepository.getTodayProgramSnapshot(db, {
                programId: program_id,
                date: getTodaysDate(),
            });

            if(!snapshot) return;

            set_day(snapshot.day);
            set_workouts(snapshot.workouts);

            if (snapshot.workouts.length === 0) {
                setCounts({ done: 0, total: 0 });
                setProgress(0);
                return;
            }

            const total = snapshot.counts.total;
            const done = snapshot.counts.done;
            const percent = total === 0 ? 0 : Math.round((done / total) * 100);

            setCounts({ done, total });
            setProgress(percent);

        }catch (error) {
            console.error(error);
        }
    }

    useEffect(() => {
        getToday();
    }, []);

    useEffect(() => {
        const unsubscribe = navigation.addListener("focus", getToday);
        return unsubscribe;
    }, [navigation]);

    // Label, Sets, show workouts.

    return (
        <>
        <ThemedTitle type="h2"> Today's Workout(s): {workouts.length} </ThemedTitle>
        <ThemedText size={12} style={{paddingLeft: 15}}> {date} </ThemedText>

        <ThemedCard style={styles.day_container}>
            <TouchableOpacity
                style={styles.container}
                onPress={() => {
                    if(workouts.length === 1){
                        navigation.navigate("WorkoutPage", {
                            workout_id: workouts[0].workout_id,
                            day: day.Weekday,
                            date: date,})   
                    } else if (workouts.length > 1){
                        set_pickWorkoutModal_visible(true);
                    }
                }}>

                <View style={styles.container}>

                    <View style={styles.container_left}>

                        <View style={styles.today}>
                            <ThemedText> Sets today </ThemedText>
                            <CircularProgression
                                size = {80}
                                strokeWidth = {8} 
                                text= {`${counts.done}/${counts.total}`}
                                textSize = {18}
                                progressPercent = {progress}
                            />
                        </View>

                    </View> 

                    <View style={styles.container_right}>


                    </View>


                </View>
            </TouchableOpacity>
        </ThemedCard>


        <PickWorkoutModal 
            workouts={workouts}
            visible={pickWorkoutModal_visible}
            onClose={() => set_pickWorkoutModal_visible(false)}
            onSubmit={(workout) => {

                navigation.navigate("ExercisePage", {
                    date: date,
                    day: day.Weekday,
                    workout_id: workout.workout_id,
                });

            }}
        />
        </>
    );
};

export default TodayShortcut;
