import { StatusBar } from 'expo-status-bar';
import React, { use, useState } from 'react';
import { View, Button } from 'react-native';
import {  SQLiteProvider } from 'expo-sqlite';
import { initializeDatabase } from '../../Database/db';
import { useNavigation } from '@react-navigation/native';
import DeleteExercises from '../../Components/DeleteExercises/DeleteExercises';

import styles from './HomePageStyle';

export default function App() {

  const navigation = useNavigation();
  return (
    <SQLiteProvider
      databaseName='datab.db'
      onInit={initializeDatabase}
      options={{ useNewConnection: false}}>
 

      <View style={styles.container}>

        <View style={styles.button_spacing}>
          <Button 
            title = "Go to Exercise Page"
            onPress={() => navigation.navigate('ExercisePage')} 
            style={styles.button_spacing} />
        </View>

        <View style={styles.button_spacing}> 
          <Button 
            title = "Go to Program Page"
            onPress={() => navigation.navigate('ProgramPage')} 
            style={styles.button_spacing} />
        </View>

        <DeleteExercises/>

        <StatusBar style="auto" />

      </View>

    </SQLiteProvider>
  );
}
