// src/Components/ExerciseList/ExerciseList.js
import { use, useState } from "react";
import { View, Text, ScrollView } from "react-native";
import { SQLiteDatabase, useSQLiteContext } from "expo-sqlite";
import { useEffect } from "react";
import { useNavigation } from "@react-navigation/native";

import {ThemedTitle} 
  from "../../../../Resources/Components";

const WarmupSetList = ( {} ) => {

  const db = useSQLiteContext();
  const navigation = useNavigation();

  const loadWarmupSets = async () => {

  };

  const renderItem = (item) => (
    <>
    </>
  );

  return (
    <>
    </>
  );
};

export default WarmupSetList;
