import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import HomePage from './src/Pages/HomePage/HomePage';

const Stack = createNativeStackNavigator();

export default function App() {

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName='Home'> 

        <Stack.Screen name="Home" component={HomePage} />

      </Stack.Navigator>
        
    </NavigationContainer>
  );
}
