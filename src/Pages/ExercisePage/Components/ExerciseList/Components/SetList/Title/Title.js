import { View, Text, ScrollView } from "react-native";
import styles from "./TitleStyle";

const Title = () => {
  return (
    <View style={styles.container}>
        <View style={[styles.pause, styles.text, styles.override]}> 
        <Text> Pause </Text>
        </View>

        <View style={[styles.set, styles.text, styles.override]}> 
        <Text> Set </Text>
        </View>

        <View style={[styles.x, styles.text, styles.override]}> 
        <Text> x </Text>
        </View>

        <View style={[styles.reps, styles.text, styles.override]}> 
        <Text> Reps </Text>
        </View>

        <View style={[styles.rpe, styles.text, styles.override]}> 
        <Text> RPE </Text>
        </View>

        <View style={[styles.weight, styles.text, styles.override]}> 
        <Text> Weight </Text>
        </View>

        <View style={[styles.done, styles.text, styles.override]}> 
        <Text> Done </Text>
        </View>
    </View>
  );
};

export default Title;
