import { StatusBar } from 'expo-status-bar';
import { View, useColorScheme } from 'react-native';
import { useNavigation } from '@react-navigation/native';

import styles from './HomePageStyle';
import { Colors } from '../../Resources/GlobalStyling/colors';

import { 
  ThemedView,  
  ThemedButton,
  ThemedHeader,
  ThemedText,
  ThemedTitle,
} from "../../Resources/ThemedComponents";

export default function App() {

  const navigation = useNavigation();
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme] ?? Colors.light;
  const headerEyebrowColor = theme.quietText ?? theme.iconColor;

  return (
    <ThemedView style={styles.container}>
      <ThemedHeader showBack={false}>
        <View style={styles.pageHeaderTitleGroup}>
          <ThemedText
            size={10}
            style={[
              styles.pageHeaderTitleEyebrow,
              { color: headerEyebrowColor },
            ]}
          >
            FitVen
          </ThemedText>

          <ThemedTitle
            type="h3"
            style={styles.pageHeaderTitleMain}
            numberOfLines={1}
          >
            Home
          </ThemedTitle>
        </View>
      </ThemedHeader>

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

      <StatusBar style="auto" />
    </ThemedView>
  );
}
