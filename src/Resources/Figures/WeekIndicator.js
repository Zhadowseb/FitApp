import { View } from "react-native";
import Svg, {
  Circle,
  Line,
  Text as SvgText,
  TSpan,
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
  const verticalPadding = 10;

  const width =
    (days.length - 1) * spacing + maxRadius * 2;

  const centerY =
    topLabelHeight + verticalPadding + maxRadius;

  const labelY = topLabelHeight;

  const height =
    topLabelHeight +
    verticalPadding +
    maxRadius * 2 +
    20;

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

          return (
            <SvgText key={`day-${i}`}>
              <Circle
                cx={cx}
                cy={centerY}
                r={r}
                fill={day.active ? theme.secondary : theme.primary}
                stroke={day.active ? theme.secondary : theme.primary}
                strokeWidth={2}
              />

              <SvgText
                x={cx}
                y={centerY}
                textAnchor="middle"
                alignmentBaseline="middle"
                fill={theme.cardBackground}
              >
                {day.active && (
                  <TSpan
                    x={cx}
                    fontSize={15}
                    fontWeight="700"
                  >
                    Today
                  </TSpan>
                )}
                {!day.active && (                
                <TSpan
                  x={cx}
                  dy={day.active ? 14 : 0}
                  fontSize={11}
                  fontWeight="500"
                >
                  {day.label}
                </TSpan>)}

              </SvgText>
            </SvgText>
          );
        })}
      </Svg>
    </View>
  );
};

export default WeekIndicator;
