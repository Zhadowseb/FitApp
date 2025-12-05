import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SQLiteProvider } from 'expo-sqlite';
import { initializeDatabase } from './src/Database/db';

import HomePage from './src/Pages/HomePage/HomePage';
import ExercisePage from './src/Pages/ExercisePage/ExercisePage';
import ProgramPage from './src/Pages/ProgramPage/ProgramPage';
import WeekPage from './src/Pages/WeekPage/WeekPage';
import DayPage from './src/Pages/DayPage/DayPage';

const Stack = createNativeStackNavigator();

export default function App() {

  return (
    <SQLiteProvider
      databaseName="datab.db"
      onInit={initializeDatabase}
      options={{ useNewConnection: false }}>

      <NavigationContainer>
        <Stack.Navigator initialRouteName='HomePage'> 

          <Stack.Screen name="HomePage" component={HomePage} />
          <Stack.Screen name="ExercisePage" component={ExercisePage} />
          <Stack.Screen name="ProgramPage" component={ProgramPage} />
          <Stack.Screen name="WeekPage" component={WeekPage} />
          <Stack.Screen name="DayPage" component={DayPage} />

        </Stack.Navigator>
          
      </NavigationContainer>
    </SQLiteProvider>
  );
}
