import { View } from "react-native";
import { useColorScheme } from "react-native";
import { Colors } from "../../../../Resources/GlobalStyling/colors";
import { ThemedText } from "../../../../Resources/Components/";

/**
 * ListHeader
 *
 * Renders column headers for run sets
 */
const ListHeader = ({ styles }) => {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme] ?? Colors.light;

  return (
    <View style={{ flexDirection: "row" }}>
      <View style={[styles.set, styles.sharedGrid, styles.title]}>
        <ThemedText size={10} style={{ color: theme.quietText }}>
          Set
        </ThemedText>
      </View>

      <View style={[styles.distance, styles.sharedGrid, styles.title]}>
        <ThemedText size={10} style={{ color: theme.quietText }}>
          Distance
        </ThemedText>
      </View>

      <View style={[styles.pace, styles.sharedGrid, styles.title]}>
        <ThemedText size={10} style={{ color: theme.quietText }}>
          Pace
        </ThemedText>
      </View>

      <View style={[styles.time, styles.sharedGrid, styles.title]}>
        <ThemedText size={10} style={{ color: theme.quietText }}>
          Time
        </ThemedText>
      </View>

      <View style={[styles.zone, styles.sharedGrid, styles.title]}>
        <ThemedText size={10} style={{ color: theme.quietText }}>
          Zone
        </ThemedText>
      </View>
    </View>
  );
};

export default ListHeader;
