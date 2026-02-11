import { TextInput, StyleSheet } from "react-native";
import { useColorScheme } from "react-native";
import { useEffect, useState } from "react";
import { Colors } from "../GlobalStyling/colors";

const ThemedEditableCell = ({
  value,
  onCommit,
  keyboardType = "numeric",
  suffix = "",          // 👈 NY
  textAlign = "center",
}) => {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme] ?? Colors.light;

  const [localValue, setLocalValue] = useState(value);
  const [focused, setFocused] = useState(false);

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  return (
    <TextInput
      value={
        focused
          ? localValue
          : localValue
          ? `${localValue}${suffix}`
          : ""
      }
      onFocus={() => setFocused(true)}
      onBlur={() => {
        setFocused(false);
        if (localValue !== value) {
          onCommit?.(localValue);
        }
      }}
      onChangeText={setLocalValue}
      keyboardType={keyboardType}
      style={[
        styles.input,
        {
          color: theme.text,
          textAlign,
        },
      ]}
      selectionColor={theme.primary}
    />
  );
};

const styles = StyleSheet.create({
  input: {
    padding: 0,
    margin: 0,
    borderWidth: 0,
    backgroundColor: "transparent",
    fontSize: 14,
    fontWeight: "500",
    width: "100%",
    minHeight: 20,   
  },
});

export default ThemedEditableCell;
