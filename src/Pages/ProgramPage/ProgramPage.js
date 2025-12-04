import { StatusBar } from 'expo-status-bar';
import React, { use, useState } from 'react';
import { View, Button } from 'react-native';
import {  SQLiteProvider } from 'expo-sqlite';
import { initializeDatabase } from '../../Database/db';
import { useNavigation } from '@react-navigation/native';

import ProgramList from '../../Components/ProgramList/ProgramList';
import AddProgram from '../../Components/AddProgram/AddProgram';

import styles from './ProgramPageStyle';

export default function App() {

  const navigation = useNavigation();
  return (
    <SQLiteProvider
      databaseName='datab.db'
      onInit={initializeDatabase}
      options={{ useNewConnection: false}}>
 

      <View style={styles.container}>

        <ProgramList/>
        <AddProgram />


        <StatusBar style="auto" />

      </View>

    </SQLiteProvider>
  );
}
