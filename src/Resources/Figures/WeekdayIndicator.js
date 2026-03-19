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
  workoutCards = [],
}) => {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme] ?? Colors.light;
  const hasWorkoutCards = workoutCards.length > 0;
  const hasWorkout = hasWorkoutCards || Boolean(Icon || iconLabel);

  return (
    <View style={styles.container}>
      <View style={[styles.headerBadge, 
        { borderColor: completed ? theme.secondary : theme.iconColor }]}>
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

      {hasWorkoutCards && (
        <View style={styles.workoutCards}>
          {workoutCards.map((workoutCard, index) => {
            const WorkoutIcon = workoutCard.icon;

            return (
              <View
                key={workoutCard.key ?? `${workoutCard.iconLabel}-${index}`}
                style={[
                  styles.circle,
                  styles.multiWorkoutCard,
                  active && styles.activeCircle,
                  index < workoutCards.length - 1 && styles.workoutCardSpacing,
                  {
                    backgroundColor: workoutCard.completed
                      ? theme.secondary
                      : theme.primary,
                    borderColor: workoutCard.completed
                      ? theme.secondaryDark
                      : theme.primaryDark,
                  },
                ]}
              >
                {WorkoutIcon && (
                  <WorkoutIcon
                    width={active ? 22 : 28}
                    height={active ? 22 : 28}
                    color={theme.cardBackground}
                    fill={theme.cardBackground}
                    primaryColor={theme.cardBackground}
                    backgroundColor="transparent"
                  />
                )}

                {!WorkoutIcon && workoutCard.iconLabel && (
                  <Text
                    style={[
                      styles.iconLabel,
                      styles.iconLabelOnly,
                      { color: theme.cardBackground },
                    ]}
                  >
                    {workoutCard.iconLabel}
                  </Text>
                )}
              </View>
            );
          })}
        </View>
      )}

      {!hasWorkoutCards && hasWorkout && (
        <View
          style={[
            styles.circle,
            active && styles.activeCircle,
            {
              backgroundColor: completed ? theme.secondary : theme.primary,
              borderColor: completed ? theme.secondaryDark : theme.primaryDark,
            },
          ]}
        >
          {Icon && (
            <Icon
              width={active ? 22 : 28}
              height={active ? 22 : 28}
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
    borderWidth: 3,
    marginBottom: 10,
  },
  workoutCards: {
    alignItems: "center",
  },
  multiWorkoutCard: {
    marginBottom: 0,
  },
  workoutCardSpacing: {
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
