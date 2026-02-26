import { StatusBar } from 'expo-status-bar';
import { View, useColorScheme } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import * as Location from 'expo-location';

import styles from './HomePageStyle';

//Custom themed components
import { 
  ThemedTitle, 
  ThemedCard, 
  ThemedView, 
  ThemedText, 
  ThemedButton, 
  ThemedBouncyCheckbox 
} from "../../Resources/ThemedComponents";

export default function App() {

  const navigation = useNavigation();

  const logCurrentLocation = async () => {
    try {
      // Request permission
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.log("Permission denied");
        return;
      }

      // Get location
      const location = await Location.getCurrentPositionAsync({});
      console.log("My location:", location);
    } catch (err) {
      console.log("Location error:", err);
    }
  };

  return (

    <ThemedView style={styles.container}>

      <View style={styles.button_spacing}> 
        <ThemedButton 
          title="Go to Program Page"
          onPress={() => navigation.navigate('ProgramPage')}  
        />
      </View>

      <View style={styles.button_spacing}>
        <ThemedButton
          title="Edit Exercise Choices" 
          onPress={() => navigation.navigate("ExerciseStoragePage")}
        />
      </View>

      {/* 👇 NEW BUTTON */}
      <View style={styles.button_spacing}>
        <ThemedButton
          title="Log My Location"
          onPress={logCurrentLocation}
        />
      </View>

      <StatusBar style="auto" />

    </ThemedView>
  );
}