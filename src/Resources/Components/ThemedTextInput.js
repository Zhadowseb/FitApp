// src/Resources/Components/ThemedTextInput.js
import { TextInput, View, StyleSheet, useColorScheme } from "react-native";
import { Colors } from "../GlobalStyling/colors";
import ThemedText from "./ThemedText";

const ThemedTextInput = ({
  value,
  onChangeText,
  placeholder,
  style,
  inputStyle,
  error,
  ...props
}) => {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme] ?? Colors.light;

  return (
    <View style={style}>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={theme.iconColor}
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
