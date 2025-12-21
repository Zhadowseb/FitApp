import { StatusBar } from 'expo-status-bar';
import { View, Text } from 'react-native';
import { useSQLiteContext } from "expo-sqlite";

import styles from './ProgramOverviewPageStyle';

const ProgramOverviewPage = () => {
    const db = useSQLiteContext();;

  return (
    <View style={styles.container}>

            <Text> New page created! </Text>

    </View>
  );
};

export default ProgramOverviewPage;