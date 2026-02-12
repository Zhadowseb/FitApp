import React from "react";
import { View, TouchableOpacity, StyleSheet } from "react-native";
import { useColorScheme } from "react-native";
import { Colors } from "../GlobalStyling/colors";
import { ThemedText } from "./";

const ThemedSegmentedToggle = ({
  value,
  leftLabel,
  rightLabel,
  onChange,
}) => {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme] ?? Colors.light;

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.cardBackground,
          borderColor: theme.border,
        },
      ]}
    >
      {/* LEFT */}
      <TouchableOpacity
        style={[
          styles.segment,
          value === "left" && {
            backgroundColor: theme.secondary,
          },
        ]}
        onPress={() => onChange("left")}
        activeOpacity={0.8}
      >
        <ThemedText
          style={{
            color:
              value === "left"
                ? theme.cardBackground
                : theme.text,
            fontWeight: "600",
          }}
        >
          {leftLabel}
        </ThemedText>
      </TouchableOpacity>

      {/* DIVIDER */}
      <View
        style={[
          styles.divider,
          { backgroundColor: theme.border },
        ]}
      />

      {/* RIGHT */}
      <TouchableOpacity
        style={[
          styles.segment,
          value === "right" && {
            backgroundColor: theme.secondary,
          },
        ]}
        onPress={() => onChange("right")}
        activeOpacity={0.8}
      >
        <ThemedText
          style={{
            color:
              value === "right"
                ? theme.cardBackground
                : theme.text,
            fontWeight: "600",
          }}
        >
          {rightLabel}
        </ThemedText>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    borderWidth: 1,
    borderRadius: 10,
    overflow: "hidden",
    height: 44,
  },
  segment: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  divider: {
    width: 1,
  },
});

export default ThemedSegmentedToggle;
