import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SQLiteProvider } from 'expo-sqlite';
import { initializeDatabase } from './src/Database/db';
import { useColorScheme, StatusBar } from "react-native"
import { SafeAreaProvider } from "react-native-safe-area-context";
import * as TaskManager from 'expo-task-manager';
import * as Location from 'expo-location';


import HomePage from './src/Pages/HomePage/HomePage';
import ProgramPage from './src/Pages/ProgramPage/ProgramPage';
import ProgramOverviewPage from './src/Pages/ProgramOverviewPage/ProgramOverviewPage';
import MesocyclePage from './src/Pages/MesocyclePage/MesocyclePage';
import MicrocyclePage from './src/Pages/MicrocyclePage/MicrocyclePage';
import WeekPage from './src/Pages/WeekPage/WeekPage';
import WorkoutPage from './src/Pages/WorkoutPage/WorkoutPage';
import SetPage from './src/Pages/SetPage/SetPage';
import ExerciseStoragePage from "./src/Pages/ExerciseStoragePage/ExerciseStoragePage";

import { Colors } from './src/Resources/GlobalStyling/colors';

import * as SQLite from 'expo-sqlite';

const LOCATION_TASK = 'background-location-task';
TaskManager.defineTask(LOCATION_TASK, async ({ data, error }) => {
  if (error) return;
  if (!data?.locations?.length) return;

  const db = await SQLite.openDatabaseAsync('datab.db');

  const workout = await db.getFirstAsync(
    `SELECT workout_id FROM Workout WHERE is_active = 1 LIMIT 1;`
  );

  if (!workout) return;

  
  for (const location of data.locations) {
    await db.runAsync(
      `INSERT INTO LocationLog 
       (workout_id, latitude, longitude, accuracy, timestamp)
       VALUES (?, ?, ?, ?, ?);`,
      [
        workout.workout_id,
        location.coords.latitude,
        location.coords.longitude,
        location.coords.accuracy,
        location.timestamp
      ]
    );
  } 

  console.log("inserted new location.");
});


const Stack = createNativeStackNavigator();
export default function App() {

  const colorScheme = useColorScheme()
  const theme = Colors[colorScheme] ?? Colors.light

  const navTheme =
    colorScheme === "dark"
      ? {
          ...DarkTheme,
          colors: {
            ...DarkTheme.colors,
            background: theme.background,
            card: theme.background,
            text: theme.text,
            border: theme.border,
          },
        }
      : {
          ...DefaultTheme,
          colors: {
            ...DefaultTheme.colors,
            background: theme.background,
            card: theme.background,
            text: theme.text,
            border: theme.border,
          },
        };
  
  return (
    <SafeAreaProvider>
      <SQLiteProvider
        databaseName="datab.db"
        onInit={initializeDatabase}
        options={{ useNewConnection: false }}>

        <NavigationContainer theme={navTheme}>
          <Stack.Navigator initialRouteName='HomePage'
            screenOptions={{ 
              headerShown: true,
              headerStyle: {
                backgroundColor: theme.background
              },
              contentStyle: {
                backgroundColor: theme.background
              }
            }}> 

            <Stack.Screen name="HomePage" component={HomePage} />
            <Stack.Screen name="ProgramPage" component={ProgramPage} />
            <Stack.Screen name="ProgramOverviewPage" component={ProgramOverviewPage} options={{headerShown: false}} />
            <Stack.Screen name="MesocyclePage" component={MesocyclePage} />
            <Stack.Screen name="MicrocyclePage" component={MicrocyclePage} options={{headerShown: false}} />
            <Stack.Screen name="WeekPage" component={WeekPage} options={{headerShown: false}} />
            <Stack.Screen name="WorkoutPage" component={WorkoutPage} options={{headerShown: false}} />
            <Stack.Screen name="SetPage" component={SetPage} />
            <Stack.Screen name="ExerciseStoragePage" component={ExerciseStoragePage} />

          </Stack.Navigator>
            
        </NavigationContainer>
      </SQLiteProvider>
    </SafeAreaProvider>
  );
}
