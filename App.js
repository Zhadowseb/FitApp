import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import HomePage from './src/Pages/HomePage/HomePage';
import ExercisePage from './src/Pages/ExercisePage/ExercisePage';
import ProgramPage from './src/Pages/ProgramPage/ProgramPage';

const Stack = createNativeStackNavigator();

export default function App() {

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName='Home'> 

        <Stack.Screen name="Home" component={HomePage} />
        <Stack.Screen name="Exercise" component={ExercisePage} />
        <Stack.Screen name="Program" component={ProgramPage} />

      </Stack.Navigator>
        
    </NavigationContainer>
  );
}
