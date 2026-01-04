import { View, Text, ScrollView } from "react-native";
import styles from "./TitleStyle";

const Title = ({exercises,loading,editMode,renderItem}) => {
  return (
    <ScrollView style={styles.wrapper}>

      {exercises.length > 0 && (
        <View style={styles.headerRow}>
          <Text style={[styles.exercise_name, styles.headerText]}>
            Exercise
          </Text>

          <Text style={[styles.exercise_sets, styles.headerText]}>
            Sets
          </Text>

          <Text style={[styles.exercise_x, styles.headerText]} />

          <Text style={[styles.exercise_reps, styles.headerText]}>
            Reps
          </Text>

          <Text style={[styles.exercise_weight, styles.headerText]}>
            Weight
          </Text>

          {!editMode && (
            <Text style={[styles.headerText]}>Done</Text>
          )}

          {editMode && (
            <Text style={[styles.headerText]}>Delete</Text>
          )}
        </View>
      )}

      {exercises.length === 0 && !loading && (
        <Text>Ingen exercises fundet.</Text>
      )}

      {exercises.map(renderItem)}

    </ScrollView>
  );
};

export default Title;
