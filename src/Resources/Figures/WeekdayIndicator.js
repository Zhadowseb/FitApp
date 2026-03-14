import { StyleSheet, Text, View } from "react-native";
import { useColorScheme } from "react-native";

import { Colors } from "../GlobalStyling/colors";


const WeekdayIndicator = ({
  label,
  dateLabel,
  active,
  icon: Icon,
  iconLabel,
}) => {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme] ?? Colors.light;

  return (
    <View style={styles.container}>
      <Text
        style={[
          styles.label,
          active && styles.activeLabel,
          { color: theme.text },
        ]}
      >
        {active ? "Today" : label}
      </Text>

      {!!dateLabel && (
        <Text style={[styles.dateLabel, { color: theme.text }]}>
          {dateLabel}
        </Text>
      )}

      <View
        style={[
          styles.circle,
          active && styles.activeCircle,
          {
            backgroundColor: active ? theme.secondary : theme.primary,
            borderColor: active ? theme.secondary : theme.primary,
          },
        ]}
      >
        {Icon && (
          <Icon
            width={active ? 22 : 18}
            height={active ? 22 : 18}
            fill={theme.cardBackground}
            primaryColor={theme.cardBackground}
            backgroundColor="transparent"
          />
        )}

        {iconLabel && (
          <Text
            style={[
              styles.iconLabel,
              !Icon && styles.iconLabelOnly,
              { color: theme.cardBackground },
            ]}
          >
            {iconLabel}
          </Text>
        )}
      </View>
    </View>
  );
};

export default WeekdayIndicator;

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    width: "100%",
  },
  label: {
    fontSize: 10,
    fontWeight: "600",
  },
  activeLabel: {
    fontSize: 12,
    fontWeight: "700",
  },
  circle: {
    width: 40,
    height: 40,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    marginBottom: 10,
  },
  activeCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  iconLabel: {
    fontSize: 8,
    opacity: 0.85,
    marginTop: 1,
  },
  dateLabel: {
    fontSize: 9,
    opacity: 0.7,
    marginBottom: 2,
  },
});