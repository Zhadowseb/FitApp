import { Pressable, TextInput, StyleSheet } from "react-native";
import { useColorScheme } from "react-native";
import { useEffect, useRef, useState } from "react";
import { Colors } from "../GlobalStyling/colors";
import ThemedText from "./ThemedText";

const ThemedEditableCell = ({
  value,
  onCommit,
  keyboardType = "numeric",
  suffix = "",
  suffixFormatter,
  displayFormatter,
  showSuffixWhenEmpty = false,
  textAlign = "center",
}) => {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme] ?? Colors.light;

  const inputRef = useRef(null);
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
    suffixFormatter
      ? suffixFormatter(localValue ?? "")
      : suffix;

  const hasDisplayValue =
    localValue !== "" && localValue !== null && localValue !== undefined;
  const shouldShowSuffix =
    !focused && Boolean(displaySuffix) && (showSuffixWhenEmpty || hasDisplayValue);

  return (
    <Pressable
      style={styles.wrapper}
      onPress={() => inputRef.current?.focus()}
    >
      <TextInput
        ref={inputRef}
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

      {shouldShowSuffix && (
        <ThemedText
          style={[
            styles.suffix,
            { color: theme.text },
          ]}
        >
          {displaySuffix}
        </ThemedText>
      )}
    </Pressable>
  );

};

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    width: "100%",
    height: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  input: {
    flexShrink: 1,
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
