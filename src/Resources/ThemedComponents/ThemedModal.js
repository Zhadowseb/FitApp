// src/Resources/Components/ThemedModal.js
import { Modal, View, StyleSheet, Pressable, useColorScheme } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Colors } from "../GlobalStyling/colors";
import ThemedText from "./ThemedText";

const ThemedModal = ({
  visible,
  onClose,
  title,
  children,
  style,               // ✅ used now (outer modal container)
  contentStyle,        // ✅ used now (inner body)
  dismissOnBackdropPress = true,
}) => {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme] ?? Colors.light;
  const insets = useSafeAreaInsets();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <Pressable
          style={StyleSheet.absoluteFill}
          onPress={dismissOnBackdropPress ? onClose : undefined}
        />

        <View
          style={[
            styles.modal,
            {
              backgroundColor: theme.cardBackground,
              paddingBottom: insets.bottom + 16,
            },
            style, // ✅ apply custom modal style overrides here
          ]}
        >
          {title && (
            <ThemedText style={styles.title}>
              {title}
            </ThemedText>
          )}

          <View style={[styles.body, contentStyle]}>
            {children}
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default ThemedModal;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },

  modal: {
    width: "90%",
    borderRadius: 16,
    padding: 20,
    maxHeight: 400,
  },

  title: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 12,
    textAlign: "center",
  },

  body: {
    gap: 12,
  },
});
