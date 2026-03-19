import { StyleSheet, Text, View } from "react-native";
import { useColorScheme } from "react-native";

import { Colors } from "../GlobalStyling/colors";


const WeekdayIndicator = ({
  label,
  dateLabel,
  active,
  completed,
  icon: Icon,
  iconLabel,
}) => {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme] ?? Colors.light;
  const hasWorkout = Boolean(Icon || iconLabel);

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
          !hasWorkout && styles.emptyCircle,
          {
            backgroundColor: completed ? theme.secondary : theme.primary,
          },
        ]}
      >
        {Icon && (
          <Icon
            width={active ? 22 : 24}
            height={active ? 22 : 24}
            color={theme.cardBackground}
            fill={theme.cardBackground}
            primaryColor={theme.cardBackground}
            backgroundColor="transparent"
          />
        )}

        {!Icon && iconLabel && (
          <Text
            style={[
              styles.iconLabel,
              styles.iconLabelOnly,
              { color: theme.cardBackground },
            ]}
          >
            {iconLabel}
          </Text>
        )}
      </View>

      {Icon && iconLabel && (
        <Text
          style={[
            styles.iconLabelBelow,
            { color: theme.text },
          ]}
        >
          {iconLabel}
        </Text>
      )}
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
    borderWidth: 5,
    borderColor: "rgb(216, 111, 51)",
    marginBottom: 4,
  },
  activeCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  emptyCircle: {
    opacity: 0.5,
    borderWidth: 0,
  },
  iconLabel: {
    fontSize: 8,
    opacity: 0.85,
    marginTop: 1,
  },
  iconLabelOnly: {
    fontSize: 9,
    marginTop: 0,
  },
  iconLabelBelow: {
    fontSize: 7.5,
    lineHeight: 8,
    opacity: 0.85,
    width: 40,
    maxWidth: 40,
    minHeight: 16,
    textAlign: "center",
    marginBottom: 6,
  },
  dateLabel: {
    fontSize: 9,
    opacity: 0.7,
    marginBottom: 2,
  },
});
