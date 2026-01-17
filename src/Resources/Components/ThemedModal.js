// src/Resources/Components/ThemedModal.js
import { Modal, View, StyleSheet, Pressable, useColorScheme } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Colors } from "../GlobalStyling/colors";
import ThemedText from "./ThemedText";
import ThemedButton from "./ThemedButton";

const ThemedModal = ({
  visible,
  onClose,
  title,
  children,
  style,
  contentStyle,
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
            contentStyle,
          ]}
        >
          {title && (
            <ThemedText style={styles.title}>
              {title}
            </ThemedText>
          )}

          <View style={styles.body}>
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
