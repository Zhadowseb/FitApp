import { TextInput, StyleSheet, View } from "react-native";
import { useColorScheme } from "react-native";
import { useEffect, useState } from "react";
import { Colors } from "../GlobalStyling/colors";
import ThemedText from "./ThemedText";

const ThemedEditableCell = ({
  value,
  onCommit,
  keyboardType = "numeric",
  suffix = "",
  suffixFormatter,
  displayFormatter,
  textAlign = "center",
}) => {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme] ?? Colors.light;

  const [localValue, setLocalValue] = useState(value);
  const [focused, setFocused] = useState(false);

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const displayValue =
    focused || !displayFormatter
      ? localValue ?? ""
      : displayFormatter(localValue ?? "");

  const displaySuffix =
    localValue === ""
      ? ""
      : suffixFormatter
        ? suffixFormatter(localValue ?? "")
        : suffix;

  return (
    <View style={styles.wrapper}>
      <TextInput
        value={displayValue ?? ""}
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

      {!focused && displaySuffix && (
        <ThemedText
          style={[
            styles.suffix,
            { color: theme.text },
          ]}
        >
          {displaySuffix}
        </ThemedText>
      )}
    </View>
  );

};

const styles = StyleSheet.create({
  wrapper: {
    flexDirection: "row",
    alignItems: "baseline",
    justifyContent: "center",
  },
  input: {
    padding: 0,
    margin: 0,
    borderWidth: 0,
    backgroundColor: "transparent",
    fontSize: 14,
    fontWeight: "500",
    minWidth: 20,
  },
  suffix: {
    fontSize: 8,
    marginLeft: 2,
  },
});

export default ThemedEditableCell;
