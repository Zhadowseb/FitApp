import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SQLiteProvider } from 'expo-sqlite';
import { initializeDatabase } from './src/Database/db';
import { useColorScheme, StatusBar } from "react-native"
import { SafeAreaProvider } from "react-native-safe-area-context";
import * as TaskManager from 'expo-task-manager';


import LoginPage from './src/Pages/LoginPage/LoginPage';
import RegisterPage from './src/Pages/RegisterPage/RegisterPage';
import HomePage from './src/Pages/HomePage/HomePage';
import ProfilePage from './src/Pages/ProfilePage/ProfilePage';
import ProgramPage from './src/Pages/ProgramPage/ProgramPage';
import ProgramOverviewPage from './src/Pages/ProgramOverviewPage/ProgramOverviewPage';
import MicrocyclePage from './src/Pages/MicrocyclePage/MicrocyclePage';
import WeekPage from './src/Pages/WeekPage/WeekPage';
import WorkoutPage from './src/Pages/WorkoutPage/WorkoutPage';
import SetPage from './src/Pages/SetPage/SetPage';
import ExerciseLibraryPage from "./src/Pages/ExerciseLibraryPage/ExerciseLibraryPage";

import { Colors } from './src/Resources/GlobalStyling/colors';
import { ThemedText, ThemedView } from './src/Resources/ThemedComponents';
import { locationService } from "./src/Services";
import { AuthProvider, useAuth } from './src/Contexts/AuthContext';
import ExerciseLibrarySync from "./src/Sync/ExerciseLibrarySync";

import * as SQLite from 'expo-sqlite';

TaskManager.defineTask(locationService.RUN_LOCATION_TASK, async ({ data, error }) => {
  if (error) return;
  if (!data?.locations?.length) return;

  const db = await SQLite.openDatabaseAsync('datab.db');
  await locationService.recordTrackedLocations(db, data.locations);
});


const Stack = createNativeStackNavigator();
function RootNavigator() {
  const colorScheme = useColorScheme()
  const theme = Colors[colorScheme] ?? Colors.light
  const { isAuthenticated, isAuthLoading } = useAuth();

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

  if (isAuthLoading) {
    return (
      <ThemedView style={{ alignItems: "center", justifyContent: "center" }}>
        <ThemedText setColor={theme.quietText ?? theme.iconColor}>
          Restoring session...
        </ThemedText>
      </ThemedView>
    );
  }
  
  return (
    <NavigationContainer theme={navTheme}>
      <Stack.Navigator
            key={isAuthenticated ? "app" : "auth"}
            initialRouteName={isAuthenticated ? 'HomePage' : 'LoginPage'}
            screenOptions={{ 
              headerShown: true,
              headerStyle: {
                backgroundColor: theme.background
              },
              contentStyle: {
                backgroundColor: theme.background
              }
            }}>
        {isAuthenticated ? (
          <>
            <Stack.Screen name="HomePage" component={HomePage} options={{ headerShown: false }} />
            <Stack.Screen name="ProfilePage" component={ProfilePage} options={{ headerShown: false }} />
            <Stack.Screen name="ProgramPage" component={ProgramPage} options={{headerShown: false}} />
            <Stack.Screen name="ProgramOverviewPage" component={ProgramOverviewPage} options={{headerShown: false}} />
            <Stack.Screen name="MicrocyclePage" component={MicrocyclePage} options={{headerShown: false}} />
            <Stack.Screen name="WeekPage" component={WeekPage} options={{headerShown: false}} />
            <Stack.Screen name="WorkoutPage" component={WorkoutPage} options={{headerShown: false}} />
            <Stack.Screen name="SetPage" component={SetPage} />
            <Stack.Screen name="ExerciseLibraryPage" component={ExerciseLibraryPage} options={{ headerShown: false }} />
          </>
        ) : (
          <>
            <Stack.Screen name="LoginPage" component={LoginPage} options={{ headerShown: false }} />
            <Stack.Screen name="RegisterPage" component={RegisterPage} options={{ headerShown: false }} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <SQLiteProvider
        databaseName="datab.db"
        onInit={initializeDatabase}
        options={{ useNewConnection: false }}>
        <AuthProvider>
          <ExerciseLibrarySync />
          <RootNavigator />
        </AuthProvider>
      </SQLiteProvider>
    </SafeAreaProvider>
  );
}
