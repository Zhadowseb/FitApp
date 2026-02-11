import { View, Text, ScrollView } from "react-native";
import styles from "./TitleStyle";

import {ThemedText} 
  from "../../../../../../../../Resources/ThemedComponents";

const Title = ({exercises,loading,editMode,renderItem}) => {
  return (
    <ScrollView style={styles.wrapper}>

      {exercises.length > 0 && (
        <View style={styles.headerRow}>
          <ThemedText style={[styles.exercise_name, styles.headerText]}>
            Exercise
          </ThemedText>

          <ThemedText style={[styles.exercise_sets, styles.headerText]}>
            Sets
          </ThemedText>

          <ThemedText style={[styles.exercise_x, styles.headerText]} />

          <ThemedText style={[styles.exercise_reps, styles.headerText]}>
            Reps
          </ThemedText>

          <ThemedText style={[styles.exercise_weight, styles.headerText]}>
            Weight
          </ThemedText>

          {!editMode && (
            <ThemedText style={[styles.headerText]}>Done</ThemedText>
          )}

          {editMode && (
            <ThemedText style={[styles.headerText]}>Delete</ThemedText>
          )}
        </View>
      )}

      {exercises.length === 0 && !loading && (
        <ThemedText>Ingen exercises fundet.</ThemedText>
      )}

      {exercises.map(renderItem)}

    </ScrollView>
  );
};

export default Title;
