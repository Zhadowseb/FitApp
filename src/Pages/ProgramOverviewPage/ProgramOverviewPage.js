import { View, ScrollView, TouchableOpacity } from 'react-native';
import { useSQLiteContext } from "expo-sqlite";
import { useState } from "react";
import { useNavigation } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useFocusEffect } from "@react-navigation/native";
import { useCallback } from "react";
import { useColorScheme } from "react-native";
import { Colors } from "../../Resources/GlobalStyling/colors";

import styles from './ProgramOverviewPageStyle';
import {
  programService,
  weightliftingService,
} from "../../Services";
import Rm_List from './Components/rm_list/rm_list';

import AddEstimatedSet from './Components/rm_list/Components/AddEstimatedSet/AddEstimatedSet';
import TodayShortcut from './Components/TodayShortcut/TodayShortcut';
import MesocycleList from "./Components/MesocycleList/MesocycleList";
import ThreeDots from "../../Resources/Icons/UI-icons/ThreeDots"

import { ThemedTitle, 
        ThemedCard, 
        ThemedView, 
        ThemedText, 
        ThemedButton, 
        ThemedHeader,
        ThemedBottomSheet, 
        ThemedEditableCell} 
  from "../../Resources/ThemedComponents";
import Delete from '../../Resources/Icons/UI-icons/Delete';
import { formatDate, parseCustomDate } from '../../Utils/dateUtils';

const ProgramOverviewPage = ( {route} ) => {
    const db = useSQLiteContext();
    const navigation = useNavigation();
    const insets = useSafeAreaInsets();
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme] ?? Colors.light;

    const program_id = route.params.program_id;
    const start_date = route.params.start_date;

    const [addEstimatedSet_visible, set_AddEstimatedSet_visible] = useState(false);
    const [refreshKey, set_refreshKey] = useState(0);
    const [status, set_status] = useState("NOT_STARTET");
    const [program_name, set_program_name] = useState("");
    const [end_date, set_end_date] = useState("");

    const [OptionsBottomsheet_visible, set_OptionsBottomsheet_visible] = useState(false);

    const refresh = () => {
        set_refreshKey(prev => prev + 1);
    }

    //Coming to page
    useFocusEffect(
        useCallback(() => {
            const loadOverview = async () => {
                refresh();
                await Promise.all([
                    getStatus(),
                    getName(),
                ]);
                const nextEndDate = await calculateEndDay();
                set_end_date(nextEndDate);
            };

            loadOverview();
        }, [])
    );

    const handleAdd = async (data) => {
        try {
            await weightliftingService.createEstimatedSet(db, {
                programId: program_id,
                exerciseName: data.selectedExerciseName,
                estimatedWeight: data.estimated_weight,
            });

            refresh();
            set_AddEstimatedSet_visible(false);
        } catch (error) {
            console.error(error);
        }
        set_AddEstimatedSet_visible(false);
    }

    const getStatus = async () => {
        try {
            const new_status = await programService.getProgramStatus(db, program_id);
            set_status(new_status.status);

        } catch (error) {
            console.error(error);
        }
    }

    const getName = async () => {
        try {
            const name = await programService.getProgramName(db, program_id);
            set_program_name(name.program_name);

        } catch (error) {
            console.error(error);
        }
    }

    const deleteProgram = async () => {
        try {
            await programService.deleteProgram(db, program_id);
        } catch (e) {
            throw e;
        }

        navigation.navigate("ProgramPage");
    };

    const changeStatus = async (new_status) => {
        await programService.updateProgramStatus(db, {
            programId: program_id,
            status: new_status,
        });
        set_status(new_status);
    }

    const calculateEndDay = async () => {
        const result = await programService.getProgramDayCount(db, program_id);

        const start = parseCustomDate(start_date);
        const end = new Date(start);
        end.setDate(end.getDate() + result.total_days);
        return formatDate(end)
    }

  return (
    <>
    <ThemedView>
        <ThemedHeader
            right={
                <TouchableOpacity onPress={() => {
                    set_OptionsBottomsheet_visible(true) }}>
                    <ThreeDots width={20} height={20} />
                </TouchableOpacity> } >
            
            <ThemedText size={18}> Program Overview  </ThemedText>
            <ThemedText size={10}> {start_date} - {end_date}  </ThemedText>
        
        </ThemedHeader>

        <ScrollView 
            style={styles.container}
            contentContainerStyle={{ paddingBottom: insets.bottom + 15}}>

            {/* Workout shortcut */}
            <View style={styles.day_body}>    
                <TodayShortcut
                    program_id = {program_id}
                    style = {styles.day_touchable}/>
            </View>

            {/* Mesocycle list */}
            <ThemedTitle type="h2"> Mesocycle's </ThemedTitle>
            <ThemedView style={styles.mesocycle_container}>
                    <MesocycleList 
                        program_id = {program_id}
                        start_date={start_date}
                        refreshKey= {refreshKey} 
                        refresh={refresh}/>
            </ThemedView>

            {/* Program PR's */}
            <ThemedTitle type="h2"> New Bests </ThemedTitle>
            <ThemedCard style={styles.pr_container}>

                <ThemedText>
                    coming soon...
                </ThemedText>
            </ThemedCard>

            {/* 1 rm estimates. */}
            <ThemedTitle type="h2"> Estimated 1 RM's </ThemedTitle>
            <ThemedCard style={styles.rm_container}>

                <View style={styles.rm_body}>
                    <Rm_List
                        program_id = {program_id}
                        refreshKey = {refreshKey}
                        refresh = {refresh} />
                </View>

                <View style={styles.rm_footer}>
                    <ThemedButton 
                        title="Add 1 RM" 
                        onPress={() => set_AddEstimatedSet_visible(true)}/>

                    <AddEstimatedSet 
                        visible={addEstimatedSet_visible}
                        onClose={() => set_AddEstimatedSet_visible(false)}
                        onSubmit={handleAdd}/>
                </View>
            </ThemedCard>

            {/* Program setting and status */}
            <ThemedTitle type="h2"> Settings </ThemedTitle>
            <ThemedCard>

                {/* Change status of the program */}
                <View style={{alignItems: "center", paddingBottom: 10}}>
                    <ThemedText>
                        Program status
                    </ThemedText>
                </View>

                <View style={{flexDirection: "row", flex: 1}}>
                    
                    <View style={{flex: 1,
                        opacity: status === "COMPLETE" ? 1 : 0.2}}>
                        <ThemedButton
                            title="COMPLETE"
                            style={{backgroundColor: theme.COMPLETE}}
                            width={80}
                            textSize={8} 
                            onPress={ () => {
                                changeStatus("COMPLETE") }}/>
                    </View>

                    <View style={{flex: 1,
                        opacity: status === "ACTIVE" ? 1 : 0.2}}>
                        <ThemedButton
                            title="ACTIVE"
                            style={{backgroundColor: theme.ACTIVE}}
                            width={80}
                            textSize={8}
                            onPress={ () => {
                                changeStatus("ACTIVE") }} />
                    </View>


                    <View style={{flex: 1, 
                        opacity: status === "NOT_STARTED" ? 1 : 0.2}}>
                        <ThemedButton
                            title="NOT STARTED"
                            style={{backgroundColor: theme.NOT_STARTED}}
                            width={80}
                            textSize={8} 
                            onPress={ () => {
                                changeStatus("NOT_STARTED") }}/>
                    </View>
                </View>

                {/* Change program name */}
                <View style={{
                    alignItems: "center", 
                    paddingBottom: 10,
                    paddingTop: 10}}>
                    <ThemedText>
                        Program name
                    </ThemedText>
                </View>

                <View style={{
                    flexDirection: "row",
                    alignItems: "center",}}>
                    <ThemedText> Current name: </ThemedText>
                    
                    <View style={{
                        borderWidth: 1,
                        borderColor: "#525252",
                        padding: 10,
                        borderRadius: 5,
                    }}>
                        <ThemedEditableCell
                            value={program_name ?? ""}
                            onCommit={async (v) => {
                                await programService.updateProgramName(db, {
                                    programId: program_id,
                                    programName: v,
                                });
                            }}/>
                    </View>
                </View>

            </ThemedCard>

            
        </ScrollView>
    </ThemedView>

        <ThemedBottomSheet
            visible={OptionsBottomsheet_visible}
            onClose={() => set_OptionsBottomsheet_visible(false)} >

            <View style={styles.bottomsheet_title}>
                <ThemedTitle type={"h3"} style={{flex: 10}}> 
                    test 
                </ThemedTitle>


            </View>

            <View style={styles.bottomsheet_body}>
                
                {/* Delete Program */}
                <TouchableOpacity 
                    style={styles.option}
                    onPress={async () => {
                        deleteProgram();
                    }}>

                    <Delete
                        width={24}
                        height={24}/>
                    <ThemedText style={styles.option_text}> 
                        Delete program.
                    </ThemedText>

                </TouchableOpacity>
            </View>


        </ThemedBottomSheet>
        </>
  );
};

export default ProgramOverviewPage;
