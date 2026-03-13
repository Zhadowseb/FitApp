import { View, TouchableOpacity } from 'react-native';
import { useState } from "react";
import { useSQLiteContext } from "expo-sqlite";

import ProgramList from './Components/ProgramList/ProgramList';
import AddProgram from './Components/AddProgram/AddProgram';
import { formatDate } from '../../Utils/dateUtils';
import { programService } from "../../Services";
import ThreeDots from "../../Resources/Icons/UI-icons/ThreeDots";
import Plus from "../../Resources/Icons/UI-icons/Plus";

import {
  ThemedView,
  ThemedText,
  ThemedHeader,
  ThemedBottomSheet,
  ThemedTitle,
} from "../../Resources/ThemedComponents";

import styles from './ProgramPageStyle';


export default function App() {
  const db = useSQLiteContext();

  const [addProgram_Visible, set_addProgram_Visible] = useState(false);
  const [refreshKey, set_refreshKey] = useState(0);
  const [optionsBottomSheetVisible, setOptionsBottomSheetVisible] = useState(false);

  const refresh = () => {
      set_refreshKey(prev => prev + 1);
  }

  //Add in a new program
  const handleAdd = async (data) => {
    try {
      await programService.createProgram(db, {
        programName: data.program_name,
        startDate: formatDate(data.start_date),
        status: data.status,
      });

      set_addProgram_Visible(false);
      refresh();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <>
    <ThemedView>

      <ThemedHeader
        right={
          <TouchableOpacity onPress={() => setOptionsBottomSheetVisible(true)}>
            <ThreeDots width={20} height={20} />
          </TouchableOpacity>
        }>
        <ThemedText size={18}>Programs</ThemedText>
      </ThemedHeader>

      <ProgramList
        refreshKey={refreshKey}/>

      <AddProgram 
        visible={addProgram_Visible}
        onClose={() => set_addProgram_Visible(false)}
        onSubmit={handleAdd}/>

    </ThemedView>

    <ThemedBottomSheet
      visible={optionsBottomSheetVisible}
      onClose={() => setOptionsBottomSheetVisible(false)}>

      <View style={styles.bottomsheet_title}>
        <ThemedTitle type="h3" style={{ flex: 10 }}>
          Program options
        </ThemedTitle>
      </View>

      <View style={styles.bottomsheet_body}>
        <TouchableOpacity
          style={styles.option}
          onPress={() => {
            setOptionsBottomSheetVisible(false);
            set_addProgram_Visible(true);
          }}>
          <Plus width={24} height={24} />
          <ThemedText style={styles.option_text}>
            Create new program.
          </ThemedText>
        </TouchableOpacity>
      </View>

    </ThemedBottomSheet>
    </>
  );
}
