import { View, Text, ScrollView } from "react-native";
import { StyleSheet } from "react-native";
import { useColorScheme } from "react-native";
import { Colors } from "../../../../../../../../../Resources/GlobalStyling/colors";

import {ThemedCard,
        ThemedText} 
  from "../../../../../../../../../Resources/ThemedComponents";

import styles from "./SetListStyle";

const Title = ({visibleColumns}) => {

    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme] ?? Colors.light;

  return (
    <View style={styles.container}>

        {visibleColumns.rest && (
            <View style={[styles.pause, styles.override]}> 
            <ThemedText style={[styles.titleText, {color: theme.quietText}]}>Rest</ThemedText>
            </View>
        )}

        {visibleColumns.set && (
            <View style={[styles.set, styles.override]}> 
            <ThemedText style={[styles.titleText, {color: theme.quietText}]}>Set</ThemedText>
            </View>
        )}

        {visibleColumns.x && (
            <View style={[styles.x, styles.override]}> 
            <ThemedText style={[styles.titleText, {color: theme.quietText}]}> </ThemedText>
            </View>
        )}

        {visibleColumns.reps && (
            <View style={[styles.reps, styles.override]}> 
            <ThemedText style={[styles.titleText, {color: theme.quietText}]}>Reps</ThemedText>
            </View>
        )}

        {visibleColumns.rpe && (
            <View style={[styles.rpe, styles.override]}> 
            <ThemedText style={[styles.titleText, {color: theme.quietText}]}>RPE</ThemedText>
            </View>
        )}

        {visibleColumns.weight && (
            <View style={[styles.weight, styles.override]}> 
            <ThemedText style={[styles.titleText, {color: theme.quietText}]}>Weight</ThemedText>
            </View>
        )}

        {visibleColumns.done && (
            <View style={[styles.done, styles.override]}> 
            <ThemedText style={[styles.titleText, {color: theme.quietText}]}>Done</ThemedText>
            </View>
        )}
    </View>
  );
};

export default Title;

