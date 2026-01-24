import { StatusBar } from 'expo-status-bar';
import { View, Button, useColorScheme } from 'react-native';
import { useNavigation } from '@react-navigation/native';


import styles from './HomePageStyle';

//Custom themed components
import { ThemedTitle, ThemedCard, ThemedView, ThemedText, ThemedButton, ThemedBouncyCheckbox } 
  from "../../Resources/Components";

export default function App() {

  const navigation = useNavigation();
  return (

    <ThemedView style={styles.container}>

      <View style={styles.button_spacing}> 
        <ThemedButton 
          title = "Go to Program Page"
          onPress={() => navigation.navigate('ProgramPage')}  />
      </View>

      <View style={styles.button_spacing}>
        <ThemedButton
          title = "Edit Exercise Choices" 
          onPress={() => navigation.navigate("ExerciseStoragePage")}/>
      </View>

      <StatusBar style="auto" />

    </ThemedView>
  );
}
