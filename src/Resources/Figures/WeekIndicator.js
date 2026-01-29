import { View } from "react-native";
import Svg, {
  Circle,
  Line,
  Text as SvgText,
  TSpan,
  G
} from "react-native-svg";
import { useColorScheme } from "react-native";
import { Colors } from "../GlobalStyling/colors";

const WeekIndicator = ({
  days = [],   // [{ label: "Mon.", active: false }, ...]
  start,       // fx "01 Mar"
  end,         // fx "07 Mar"
}) => {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme] ?? Colors.light;

  /* ---------------- Layout config ---------------- */

  const spacing = 55;
  const baseRadius = 15;
  const activeRadius = 25;
  const maxRadius = Math.max(baseRadius, activeRadius);

  // Space reserved for top labels (start / end)
  const topLabelHeight = 26;
  const verticalPadding = 0;

  const width =
    (days.length - 1) * spacing + maxRadius * 2;

  const centerY =
    topLabelHeight + verticalPadding + maxRadius;

  const labelY = topLabelHeight;

  const height =
    topLabelHeight +
    verticalPadding +
    maxRadius * 2 +
    30;

  const firstX = maxRadius;
  const lastX = maxRadius + (days.length - 1) * spacing;

  /* ---------------- Render ---------------- */

  return (
    <View style={{ alignItems: "center" }}>
      <Svg width={width} height={height}>

        {/* Start / End labels */}
        {start && (
          <SvgText
            x={firstX + 10}
            y={labelY}
            textAnchor="middle"
            fontSize={20}
            fontWeight="600"
            fill={theme.text}
          >
            {start}
          </SvgText>
        )}

        {end && (
          <SvgText
            x={lastX - 15}
            y={labelY}
            textAnchor="middle"
            fontSize={20}
            fontWeight="600"
            fill={theme.text}
          >
            {end}
          </SvgText>
        )}

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

        {/* Circles + text */}
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

            {/* Label / Today */}
            <SvgText
                x={cx}
                y={centerY}
                textAnchor="middle"
                alignmentBaseline="middle"
                fill={theme.cardBackground}
            >
                {day.active ? (
                <TSpan fontSize={15} fontWeight="700">
                    Today
                </TSpan>
                ) : (
                <TSpan fontSize={11} fontWeight="500">
                    {day.label}
                </TSpan>
                )}
            </SvgText>

            {/* 🔥 ICON UNDER DAY */}
            {Icon && (
                <G
                x={cx - 10}
                y={centerY + r + 8}
                >
                <Icon
                    width={20}
                    height={20}
                    fill={theme.primary}
                    backgroundColor={theme.background}
                />
                </G>
            )}

                {/* MINI LABEL */}
                {day.iconLabel && (
                <SvgText
                    x={cx}
                    y={centerY + r + 35}
                    textAnchor="middle"
                    fontSize={9}          // 👈 MEGET lille
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
