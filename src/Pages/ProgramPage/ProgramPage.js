import { StatusBar } from 'expo-status-bar';
import { View } from 'react-native';

import ProgramList from './Components/ProgramList/ProgramList';
import AddProgram from './Components/AddProgram/AddProgram';

import styles from './ProgramPageStyle';

export default function App() {

  return (
    <View style={styles.container}>

      <ProgramList/>
      <AddProgram />


      <StatusBar style="auto" />

    </View>
  );
}
