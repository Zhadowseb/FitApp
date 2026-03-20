// src/Resources/Components/ThemedTextInput.js
import { TextInput, View, StyleSheet, useColorScheme } from "react-native";
import { useRef } from "react";
import { Colors } from "../GlobalStyling/colors";
import ThemedText from "./ThemedText";
import { useThemedKeyboardProtection } from "./ThemedKeyboardProtection";

const ThemedTextInput = ({
  value,
  onChangeText,
  placeholder,
  style,
  inputStyle,
  error,
  onFocus,
  ...props
}) => {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme] ?? Colors.light;
  const inputRef = useRef(null);
  const { requestScrollToInput } = useThemedKeyboardProtection();

  return (
    <View style={style}>
      <TextInput
        ref={inputRef}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={theme.iconColor}
        onFocus={(event) => {
          requestScrollToInput(inputRef.current);
          onFocus?.(event);
        }}
        style={[
          styles.input,
          {
            backgroundColor: theme.uiBackground,
            color: theme.text,
            borderColor: error ? theme.danger : theme.cardBorder,
          },
          inputStyle,
        ]}
        {...props}
      />

      {error && (
        <ThemedText style={[styles.error, { color: theme.danger }]}>
          {error}
        </ThemedText>
      )}
    </View>
  );
};

export default ThemedTextInput;

const styles = StyleSheet.create({
  input: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
  },

  error: {
    marginTop: 6,
    fontSize: 12,
  },
});
