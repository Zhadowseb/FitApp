import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import { View } from 'react-native';
import {  SQLiteProvider } from 'expo-sqlite';
import { initializeDatabase } from '../../Database/db';

import styles from './ExercisePageStyle';
import AddExercise from '../../Components/AddExercise/AddExercise';
import ExerciseList from '../../Components/ExerciseList/ExerciseList';

const ExercisePage = ({route}) =>  {

  const program_id = route.params.program_id;
  return (

    <SQLiteProvider
      databaseName='datab.db'
      onInit={initializeDatabase}
      options={{ useNewConnection: false}}>
 

      <View style={styles.container}>

        <ExerciseList program_id ={program_id} />
        <AddExercise program_id ={program_id} />

        <StatusBar style="auto" />

      </View>

    </SQLiteProvider>
  );
}

export default ExercisePage;
