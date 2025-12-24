import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SQLiteProvider } from 'expo-sqlite';
import { initializeDatabase } from './src/Database/db';

import HomePage from './src/Pages/HomePage/HomePage';
import ProgramPage from './src/Pages/ProgramPage/ProgramPage';
import ProgramOverviewPage from './src/Pages/ProgramOverviewPage/ProgramOverviewPage';
import MesocyclePage from './src/Pages/MesocyclePage/MesocyclePage';
import MicrocyclePage from './src/Pages/MicrocyclePage/MicrocyclePage';
import WeekPage from './src/Pages/WeekPage/WeekPage';
import DayPage from './src/Pages/DayPage/DayPage';
import ExercisePage from './src/Pages/ExercisePage/ExercisePage';
import SetPage from './src/Pages/SetPage/SetPage';

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
          <Stack.Screen name="ProgramPage" component={ProgramPage} />
          <Stack.Screen name="ProgramOverviewPage" component={ProgramOverviewPage} />
          <Stack.Screen name="MesocyclePage" component={MesocyclePage} />
          <Stack.Screen name="MicrocyclePage" component={MicrocyclePage} />
          <Stack.Screen name="WeekPage" component={WeekPage} />
          <Stack.Screen name="DayPage" component={DayPage} />
          <Stack.Screen name="ExercisePage" component={ExercisePage} />
          <Stack.Screen name="SetPage" component={SetPage} />

        </Stack.Navigator>
          
      </NavigationContainer>
    </SQLiteProvider>
  );
}
