import { StatusBar } from 'expo-status-bar';
import { View, Button } from 'react-native';
import { useState } from "react";
import { useSQLiteContext } from "expo-sqlite";

import ProgramList from './Components/ProgramList/ProgramList';
import AddProgram from './Components/AddProgram/AddProgram';
import { formatDate } from '../../Utils/dateUtils';

import styles from './ProgramPageStyle';

export default function App() {
  const db = useSQLiteContext();

  const [addProgram_Visible, set_addProgram_Visible] = useState(false);
  const [refreshKey, set_refreshKey] = useState(0);

  const refresh = () => {
      set_refreshKey(prev => prev + 1);
  }

  const handleAdd = async (data) => {
    try {
      await db.runAsync(
        `INSERT INTO Program (program_name, start_date, status) VALUES (?, ?, ?);`,
        [data.program_name, 
          formatDate(data.start_date), 
          data.status]
      );

      set_addProgram_Visible(false);
      refresh();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <View style={styles.container}>

      <ProgramList
        refreshKey={refreshKey}/>

      <Button 
        title="Create new program" 
        onPress={() => set_addProgram_Visible(true)}/>

      <AddProgram 
        visible={addProgram_Visible}
        onClose={() => set_addProgram_Visible(false)}
        onSubmit={handleAdd}/>


      <StatusBar style="auto" />

    </View>
  );
}
