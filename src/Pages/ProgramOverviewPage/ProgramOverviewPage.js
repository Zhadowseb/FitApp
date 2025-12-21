import { View, Text } from 'react-native';
import { useSQLiteContext } from "expo-sqlite";

import styles from './ProgramOverviewPageStyle';
import Rm_List from './Components/Rm_List/Rm_List';

const ProgramOverviewPage = ( {route} ) => {
    const db = useSQLiteContext();

    const program_id = route.params.program_id;

  return (
    <View style={styles.container}>

        <Text> Estimated 1 RM's </Text>
        <View style={styles.rm_container}>

            <Rm_List
                program_id = {program_id} />



        </View>

        <Text> PR's during program </Text>
        <View style={styles.pr_container} >

        </View>

    </View>
  );
};

export default ProgramOverviewPage;