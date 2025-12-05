import { StatusBar } from 'expo-status-bar';
import { View, Button } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import DeleteExercises from '../../Components/DeleteExercises/DeleteExercises';

import styles from './HomePageStyle';

export default function App() {

  const navigation = useNavigation();
  return (

    <View style={styles.container}>

      <View style={styles.button_spacing}> 
        <Button 
          title = "Go to Program Page"
          onPress={() => navigation.navigate('ProgramPage')} 
          style={styles.button_spacing} />
      </View>

      <DeleteExercises/>

      <StatusBar style="auto" />

    </View>
  );
}
