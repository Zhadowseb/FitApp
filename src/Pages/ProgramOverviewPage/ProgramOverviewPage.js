import { View, Text, Button } from 'react-native';
import { useSQLiteContext } from "expo-sqlite";
import { use, useState } from "react";
import { useNavigation } from "@react-navigation/native";

import styles from './ProgramOverviewPageStyle';
import Rm_List from './Components/Rm_List/Rm_List';

import AddEstimatedSet from './Components/Rm_List/Components/AddEstimatedSet/AddEstimatedSet';
import TodayShortcut from './Components/TodayShortcut/TodayShortcut';

const ProgramOverviewPage = ( {route} ) => {
    const db = useSQLiteContext();
    const navigation = useNavigation();

    const program_id = route.params.program_id;

    const [addEstimatedSet_visible, set_AddEstimatedSet_visible] = useState(false);

    const handleAdd = async (data) => {
        try {
            await db.runAsync(
                `INSERT INTO Estimated_set (program_id, exercise_name, estimated_weight) VALUES (?, ?, ?);`,
                [program_id, 
                data.selectedExerciseName, 
                data.estimated_weight]
            );

            set_AddEstimatedSet_visible(false);
        } catch (error) {
            console.error(error);
        }
        set_AddEstimatedSet_visible(false);
    }

    const deleteProgram = async () => {
        try{
            await db.runAsync(
                `DELETE FROM Program WHERE program_id = ?;`,
                [program_id]
            );
        }catch (error) {
            console.error(error);
        }
        navigation.navigate("ProgramPage");
    }

  return (
    <View style={styles.container}>

        <View style={[styles.day_container, styles.card]}>
            <TodayShortcut
                program_id = {program_id}/>
        </View>

        <View style={[styles.rm_container, styles.card]}>
            <Text> Estimated 1 RM's </Text>
            <View style={styles.rm_body}>
                <Rm_List
                    program_id = {program_id} />
            </View>

            <View style={styles.rm_footer}>
                <Button 
                    title="Add 1 RM" 
                    onPress={() => set_AddEstimatedSet_visible(true)}/>

                <AddEstimatedSet 
                    visible={addEstimatedSet_visible}
                    onClose={() => set_AddEstimatedSet_visible(false)}
                    onSubmit={handleAdd}/>
            </View>

        </View>

        <View style={[styles.pr_container, styles.card]} >
            <Text> PR's during program </Text>

        </View>

        <View style={styles.delete_button_container}>
            <Button 
                title="Delete program"
                color="red"
                onPress={() => deleteProgram()}/>
        </View>
    </View>
  );
};

export default ProgramOverviewPage;