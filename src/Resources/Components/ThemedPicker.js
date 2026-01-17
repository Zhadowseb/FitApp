import { useState } from "react";
import { View, StyleSheet, Pressable, ScrollView } from "react-native";
import { useColorScheme } from "react-native";

import { Colors } from "../GlobalStyling/colors";
import ThemedText from "./ThemedText";
import ThemedModal from "./ThemedModal";

const ThemedPicker = ({
  value,
  items = [],
  onChange,
  placeholder = "Select",
  style,
}) => {
  const [open, setOpen] = useState(false);
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme] ?? Colors.light;

  const selectedLabel =
    items.find(i => i.value === value)?.label ?? placeholder;

  return (
    <>
      {/* Closed state */}
      <Pressable
        onPress={() => setOpen(true)}
        style={[
          styles.input,
          {
            backgroundColor: theme.uiBackground,
            borderColor: theme.cardBorder,
          },
          style,
        ]}
      >
        <ThemedText>
          {selectedLabel}
        </ThemedText>
      </Pressable>

      {/* Modal */}
      <ThemedModal
        visible={open}
        onClose={() => setOpen(false)}
        title="Select exercise"
      >

        <ScrollView style={styles.scrollview}>
            {items.map(item => (
            <Pressable
                key={item.value}
                onPress={() => {
                onChange?.(item.value);
                setOpen(false);
                }}
                style={styles.option}
            >
                <ThemedText>{item.label}</ThemedText>
            </Pressable>
            ))}
        </ScrollView>
      </ThemedModal>
    </>
  );
};

export default ThemedPicker;

const styles = StyleSheet.create({
  input: {
    borderWidth: 1,
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 14,
  },

  option: {
    paddingVertical: 14,
  },

  scrollview: {
    maxHeight: 320,
  }
});
