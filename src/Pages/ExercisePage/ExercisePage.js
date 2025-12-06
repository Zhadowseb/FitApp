import { StatusBar } from 'expo-status-bar';
import { View } from 'react-native';

import styles from './ExercisePageStyle';
import AddExercise from './Components/AddExercise/AddExercise';
import ExerciseList from './Components/ExerciseList/ExerciseList';

const ExercisePage = ({route}) =>  {

  const {workout_id, date} = route.params;
  return (
    <View style={styles.container}>

      <ExerciseList 
        workout_id = {workout_id} />
      <AddExercise 
        workout_id = {workout_id} />

      <StatusBar style="auto" />

    </View>
  );
}

export default ExercisePage;
