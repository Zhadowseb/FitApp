import { View, Text, ScrollView } from "react-native";
import styles from "./TitleStyle";


import {ThemedCard,
        ThemedText} 
  from "../../../../../../../../Resources/Components";

const Title = () => {
  return (
    <View style={styles.container}>
        <View style={[styles.pause, styles.text, styles.override]}> 
        <ThemedText> Pause </ThemedText>
        </View>

        <View style={[styles.set, styles.text, styles.override]}> 
        <ThemedText> Set </ThemedText>
        </View>

        <View style={[styles.x, styles.text, styles.override]}> 
        <ThemedText> x </ThemedText>
        </View>

        <View style={[styles.reps, styles.text, styles.override]}> 
        <ThemedText> Reps </ThemedText>
        </View>

        <View style={[styles.rpe, styles.text, styles.override]}> 
        <ThemedText> RPE </ThemedText>
        </View>

        <View style={[styles.weight, styles.text, styles.override]}> 
        <ThemedText> Weight </ThemedText>
        </View>

        <View style={[styles.done, styles.text, styles.override]}> 
        <ThemedText> Done </ThemedText>
        </View>
    </View>
  );
};

export default Title;
