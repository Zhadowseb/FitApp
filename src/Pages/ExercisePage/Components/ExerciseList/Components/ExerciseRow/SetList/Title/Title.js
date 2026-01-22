import { View, Text, ScrollView } from "react-native";
import styles from "./TitleStyle";
import { useColorScheme } from "react-native";
import { Colors } from "../../../../../../../../Resources/GlobalStyling/colors";

import {ThemedCard,
        ThemedText} 
  from "../../../../../../../../Resources/Components";

const Title = () => {

    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme] ?? Colors.light;

  return (
    <View style={styles.container}>
        <View style={[styles.pause, styles.override]}> 
        <ThemedText style={[styles.text, {color: theme.quietText}]}> Rest </ThemedText>
        </View>

        <View style={[styles.set, styles.override]}> 
        <ThemedText style={[styles.text, {color: theme.quietText}]}> Set </ThemedText>
        </View>

        <View style={[styles.x, styles.override]}> 
        <ThemedText style={[styles.text, {color: theme.quietText}]}>  </ThemedText>
        </View>

        <View style={[styles.reps, styles.override]}> 
        <ThemedText style={[styles.text, {color: theme.quietText}]}> Reps </ThemedText>
        </View>

        <View style={[styles.rpe, styles.override]}> 
        <ThemedText style={[styles.text, {color: theme.quietText}]}> RPE </ThemedText>
        </View>

        <View style={[styles.weight, styles.override]}> 
        <ThemedText style={[styles.text, {color: theme.quietText}]}> Weight </ThemedText>
        </View>

        <View style={[styles.done, styles.override]}> 
        <ThemedText style={[styles.text, {color: theme.quietText}]}> Done </ThemedText>
        </View>
    </View>
  );
};

export default Title;
