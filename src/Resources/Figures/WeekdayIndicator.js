import { Pressable, StyleSheet, Text, TouchableOpacity, View } from "react-native";
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
  onWorkoutPress,
  onDayLongPress,
}) => {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme] ?? Colors.light;
  const hasWorkoutCards = workoutCards.length > 0;
  const hasWorkout = hasWorkoutCards || Boolean(Icon || iconLabel);
  const [dayNumber, monthNumber] = (dateLabel ?? "").split(".");
  const quietText = theme.quietText ?? theme.iconColor ?? theme.text;
  const titleColor = theme.title ?? theme.text;
  const surfaceColor = theme.uiBackground ?? theme.cardBackground ?? theme.background;
  const activeSurface = theme.primaryLight ?? surfaceColor;
  const completedSurface = theme.secondary ?? surfaceColor;
  const cardBorder = theme.cardBorder ?? theme.iconColor ?? theme.text;
  const activeBorder = theme.primary ?? cardBorder;
  const completedBorder = theme.secondary ?? cardBorder;
  const activeText = theme.primaryDark ?? titleColor;
  const completedText = theme.cardBackground ?? theme.background ?? titleColor;
  const badgeBackgroundColor = active
    ? activeSurface
    : completed
      ? completedSurface
      : surfaceColor;
  const badgeBorderColor = active
    ? activeBorder
    : completed
      ? completedBorder
      : cardBorder;
  const badgeLabelColor = active
    ? activeText
    : completed
      ? completedText
      : quietText;
  const badgeDateColor = active
    ? activeText
    : completed
      ? completedText
      : titleColor;
  const weekdayTextColor = completed
    ? completedText
    : theme.title ?? "#fff";

  return (
    <View style={styles.container}>
      <Pressable
        delayLongPress={600}
        onLongPress={onDayLongPress}
        style={[
          styles.headerBadge,
          {
            backgroundColor: badgeBackgroundColor,
            borderColor: badgeBorderColor,
          },
        ]}
      >
        <Text
          style={[
            styles.weekdayLabel,
            active && styles.weekdayLabelActive,
            { color: weekdayTextColor },
          ]}
        >
          {active ? "Today" : label}
        </Text>

        {!!dateLabel && (
          <View style={styles.dateRow}>
            <Text style={[styles.dateNumber, { color: badgeDateColor }]}>
              {dayNumber ?? dateLabel}
            </Text>

            {!!monthNumber && (
              <Text style={[styles.dateMonth, { color: badgeLabelColor }]}>
                .{monthNumber}
              </Text>
            )}
          </View>
        )}
      </Pressable>

      {hasWorkoutCards && (
        <View style={styles.workoutCards}>
          {workoutCards.map((workoutCard, index) => {
            const WorkoutIcon = workoutCard.icon;

            return (
              <TouchableOpacity
                key={workoutCard.key ?? `${workoutCard.iconLabel}-${index}`}
                activeOpacity={0.85}
                delayLongPress={600}
                onPress={() => onWorkoutPress?.(workoutCard.workout)}
                onLongPress={onDayLongPress}
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
              </TouchableOpacity>
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
    minWidth: 42,
    minHeight: 50,
    paddingHorizontal: 4,
    paddingVertical: 6,
    borderWidth: 1,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 6,
  },
  weekdayLabel: {
    fontSize: 9,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.7,
  },
  weekdayLabelActive: {
    fontSize: 9,
    letterSpacing: 0.8,
  },
  dateRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "center",
    marginTop: 2,
  },
  dateNumber: {
    fontSize: 15,
    fontWeight: "700",
    lineHeight: 16,
  },
  dateMonth: {
    fontSize: 9,
    fontWeight: "700",
    marginLeft: 1,
    marginBottom: 1,
    opacity: 0.8,
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
});
