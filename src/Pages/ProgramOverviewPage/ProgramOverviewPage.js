import { View, Text, Button, ScrollView, TouchableOpacity } from 'react-native';
import { useSQLiteContext } from "expo-sqlite";
import { use, useState } from "react";
import { useNavigation } from "@react-navigation/native";

import styles from './ProgramOverviewPageStyle';
import Rm_List from './Components/rm_list/Rm_list';

import AddEstimatedSet from './Components/rm_list/Components/AddEstimatedSet/AddEstimatedSet';
import TodayShortcut from './Components/TodayShortcut/TodayShortcut';
import MesocycleList from '../MesocyclePage/Components/MesocycleList/MesocycleList';

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
    <ScrollView 
        style={styles.container}
        contentContainerStyle={{ paddingBottom: 50}}>

        <View style={[styles.day_container, styles.card]}>

            <View style={styles.container_header}>
                <Text> Today's Workout </Text>
            </View>

            <View style={styles.day_body}>    
                <TodayShortcut
                    program_id = {program_id}
                    style = {styles.day_touchable}/>
            </View>
        </View>


        <View style={[styles.rm_container, styles.card]}>
            
            <View style={styles.container_header}>
                <Text> Estimated 1 RM's </Text>
            </View>

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

        <TouchableOpacity
                style={[styles.mesocycle_container, styles.card]}
                onPress={() => {
                    navigation.navigate("MesocyclePage", {
                    program_id: program_id})
            }} >

            <View style={styles.container_header}>
                <Text> Mesocycle's </Text>
            </View>
            
            <MesocycleList 
                program_id = {program_id}/>

        </TouchableOpacity>


        <View style={[styles.pr_container, styles.card]}>
            <View style={styles.container_header}>
                <Text> Program PR's </Text>
            </View>

            <Text>
                coming soon...
            </Text>
        </View>


        <View style={[styles.delete_button_container, styles.card]}>
            <Button 
                title="Delete program"
                color="red"
                onPress={() => deleteProgram()}/>
        </View>
    </ScrollView>
  );
};

export default ProgramOverviewPage;