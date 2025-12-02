import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import { View } from 'react-native';
import {  SQLiteProvider } from 'expo-sqlite';
import { initializeDatabase } from '../../Database/db';

import styles from '../../Style/AppStyle';
import AddExercise from '../../Components/AddExercise/AddExercise';
import ExerciseList from '../../Components/ExerciseList/ExerciseList';
import DeleteExercises from '../../Components/DeleteExercises/DeleteExercises';

export default function App() {

  return (
    <SQLiteProvider
      databaseName='datab.db'
      onInit={initializeDatabase}
      options={{ useNewConnection: false}}>
 

      <View style={styles.container}>

        <ExerciseList/>
        <AddExercise/>

        <StatusBar style="auto" />

      </View>

    </SQLiteProvider>
  );
}
