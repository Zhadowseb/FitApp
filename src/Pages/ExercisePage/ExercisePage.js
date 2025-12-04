import { StatusBar } from 'expo-status-bar';
import { View } from 'react-native';

import styles from './ExercisePageStyle';
import AddExercise from './Components/AddExercise/AddExercise';
import ExerciseList from './Components/ExerciseList/ExerciseList';

const ExercisePage = ({route}) =>  {

  const program_id = route.params.program_id;
  return (
    <View style={styles.container}>

      <ExerciseList program_id ={program_id} />
      <AddExercise program_id ={program_id} />

      <StatusBar style="auto" />

    </View>
  );
}

export default ExercisePage;
