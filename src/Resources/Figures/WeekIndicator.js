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

  const spacing = 50;
  const baseRadius = 20;
  const activeRadius = 25;
  const maxRadius = Math.max(baseRadius, activeRadius);

  const width =
    (days.length - 1) * spacing + maxRadius * 2;

  const centerY = maxRadius + 5;

  const height =
    maxRadius * 2 +
    55; // plads til ikon + mini-label

  /* ---------------- Render ---------------- */

  return (
    <View style={{ alignItems: "center" }}>
      <Svg width={width} height={height}>

        {/* Connecting lines */}
        {days.slice(0, -1).map((_, i) => (
          <Line
            key={`line-${i}`}
            x1={maxRadius + i * spacing}
            y1={centerY}
            x2={maxRadius + (i + 1) * spacing}
            y2={centerY}
            stroke={theme.primary}
            strokeWidth={2}
          />
        ))}

        {/* Days */}
        {days.map((day, i) => {
          const cx = maxRadius + i * spacing;
          const r = day.active ? activeRadius : baseRadius;
          const Icon = day.icon;

          return (
            <G key={`day-${i}`}>

              {/* Circle */}
              <Circle
                cx={cx}
                cy={centerY}
                r={r}
                fill={day.active ? theme.secondary : theme.primary}
                stroke={day.active ? theme.secondary : theme.primary}
                strokeWidth={2}
              />

              {/* Day label + date */}
              <SvgText
                x={cx}
                y={centerY - 6}
                textAnchor="middle"
                alignmentBaseline="middle"
                fill={theme.cardBackground}
              >
                {day.active ? (
                  <TSpan fontSize={14} fontWeight="700">
                    Today
                  </TSpan>
                ) : (
                  <TSpan fontSize={11} fontWeight="600">
                    {day.label}
                  </TSpan>
                )}
              </SvgText>

              {/* Date inside circle */}
              {day.dateLabel && (
                <SvgText
                  x={cx}
                  y={centerY + 10}
                  textAnchor="middle"
                  fontSize={9}
                  fill={theme.cardBackground}
                  opacity={0.9}
                >
                  {day.dateLabel}
                </SvgText>
              )}

              {/* Icon under circle */}
              {Icon && (
                <G
                  x={cx - 10}
                  y={centerY + r + 8}
                >
                  <Icon
                    width={20}
                    height={20}
                    fill={theme.primary}
                    backgroundColor={theme.cardBackground}
                  />
                </G>
              )}

              {/* Mini label under icon */}
              {day.iconLabel && (
                <SvgText
                  x={cx}
                  y={centerY + r + 38}
                  textAnchor="middle"
                  fontSize={9}
                  fill={theme.text}
                  opacity={0.7}
                >
                  {day.iconLabel}
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
