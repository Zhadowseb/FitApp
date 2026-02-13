import { View, Text, ScrollView } from "react-native";
import { StyleSheet } from "react-native";
import { useColorScheme } from "react-native";
import { Colors } from "../../../../../../../../../Resources/GlobalStyling/colors";

import {ThemedCard,
        ThemedText} 
  from "../../../../../../../../../Resources/ThemedComponents";

const Title = () => {

    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme] ?? Colors.light;

  return (
    <View style={styles.container}>
        <View style={[styles.pause, styles.override]}> 
        <ThemedText style={[styles.text, {color: theme.quietText}]}>Rest</ThemedText>
        </View>

        <View style={[styles.set, styles.override]}> 
        <ThemedText style={[styles.text, {color: theme.quietText}]}>Set</ThemedText>
        </View>

        <View style={[styles.x, styles.override]}> 
        <ThemedText style={[styles.text, {color: theme.quietText}]}> </ThemedText>
        </View>

        <View style={[styles.reps, styles.override]}> 
        <ThemedText style={[styles.text, {color: theme.quietText}]}>Reps</ThemedText>
        </View>

        <View style={[styles.rpe, styles.override]}> 
        <ThemedText style={[styles.text, {color: theme.quietText}]}>RPE</ThemedText>
        </View>

        <View style={[styles.weight, styles.override]}> 
        <ThemedText style={[styles.text, {color: theme.quietText}]}>Weight</ThemedText>
        </View>

        <View style={[styles.done, styles.override]}> 
        <ThemedText style={[styles.text, {color: theme.quietText}]}>Done</ThemedText>
        </View>
    </View>
  );
};

export default Title;

const styles = StyleSheet.create({

    container: {
        flexDirection: "row",
        flex: 1,
        width: "100%",
    },

    pause:  {width: "15%"},
    set:    {width: "10%"},
    x:      {width: "5%"},
    reps:   {width: "17%"},
    weight: {width: "20%"},
    rpe:    {width: "17%"},
    done:   {width: "15%"},  

    override: {
        borderLeftWidth: 0,
        borderBottomColor: "#555555ff",
        borderBottomWidth: 1,
        justifyContent: "center",
        alignItems: "center",
    },

    text: {
        fontWeight: "bold",
        fontSize: 10,
    },


});
