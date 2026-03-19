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
      <View style={[styles.headerBadge, { borderColor: theme.iconColor }]}>
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
      </View>

      {hasWorkout && (
        <View
          style={[
            styles.circle,
            active && styles.activeCircle,
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
  headerBadge: {
    minWidth: 44,
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderWidth: 1,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 4,
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
  iconLabel: {
    fontSize: 8,
    opacity: 0.85,
    marginTop: 1,
  },
  iconLabelOnly: {
    fontSize: 9,
    marginTop: 0,
  },
  dateLabel: {
    fontSize: 9,
    opacity: 0.7,
    textAlign: "center",
  },
});
