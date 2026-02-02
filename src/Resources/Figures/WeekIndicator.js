import { View } from "react-native";
import Svg, {
  Circle,
  Line,
  Text as SvgText,
  TSpan,
  G,
} from "react-native-svg";
import { useColorScheme } from "react-native";
import { Colors } from "../GlobalStyling/colors";

const WeekIndicator = ({
  days = [], // [{ label, dateLabel, active, icon, iconLabel }]
}) => {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme] ?? Colors.light;

  /* ---------------- Layout config ---------------- */

  const spacing = 52;
  const baseRadius = 20;
  const activeRadius = 25;
  const maxRadius = Math.max(baseRadius, activeRadius);

  const width =
    (days.length - 1) * spacing + maxRadius * 2;

  const centerY = maxRadius + 28; // plads til label over
  const height = centerY + maxRadius + 28; // plads til dato under

  /* ---------------- Render ---------------- */

  return (
    <View style={{ alignItems: "center" }}>
      <Svg width={width} height={height}>

        {days.map((day, i) => {
          const cx = maxRadius + i * spacing;
          const r = day.active ? activeRadius : baseRadius;
          const Icon = day.icon;

          return (
            <G key={`day-${i}`}>

              {/* Day label ABOVE circle */}
              <SvgText
                x={cx}
                y={centerY - r - 10}
                textAnchor="middle"
                fontSize={day.active ? 13 : 11}
                fontWeight={day.active ? "700" : "600"}
                fill={theme.text}
              >
                {day.active ? "Today" : day.label}
              </SvgText>

              {/* Circle */}
              <Circle
                cx={cx}
                cy={centerY}
                r={r}
                fill={day.active ? theme.secondary : theme.primary}
                stroke={day.active ? theme.secondary : theme.primary}
                strokeWidth={2}
              />

              {/* ICON inside circle */}
              {Icon && (
                <G
                  x={cx - 12}
                  y={centerY - 16}
                >
                  <Icon
                    width={24}
                    height={24}
                    fill={theme.cardBackground}
                    primaryColor={theme.cardBackground}
                    backgroundColor="transparent"
                  />
                </G>
              )}

              {/* ICON LABEL inside circle */}
              {day.iconLabel && (
                <SvgText
                  x={cx}
                  y={centerY + r / 1.5}
                  textAnchor="middle"
                  fontSize={8}
                  fill={theme.cardBackground}
                  opacity={0.85}
                >
                  {day.iconLabel}
                </SvgText>
              )}

              {/* DATE BELOW circle */}
              {day.dateLabel && (
                <SvgText
                  x={cx}
                  y={centerY + r + 16}
                  textAnchor="middle"
                  fontSize={9}
                  fill={theme.text}
                  opacity={0.7}
                >
                  {day.dateLabel}
                </SvgText>
              )}

            </G>
          );
        })}
      </Svg>
    </View>
  );
};

export default WeekIndicator;
