import React, { useRef, useEffect } from "react";
import {
  Modal,
  View,
  StyleSheet,
  Pressable,
  useColorScheme,
  Animated,
  PanResponder,
  Dimensions,
  ScrollView,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Colors } from "../GlobalStyling/colors";

const SCREEN_HEIGHT = Dimensions.get("window").height;

// Sheet size
const SHEET_HEIGHT = SCREEN_HEIGHT * 0.95;

// Snap positions (translateY)
const SNAP_EXPANDED = SCREEN_HEIGHT * 0.05; // næsten top
const SNAP_COLLAPSED = SCREEN_HEIGHT * 0.4; // ~60% synlig

const ThemedBottomSheet = ({ visible, onClose, children }) => {
  const scheme = useColorScheme();
  const theme = Colors[scheme] ?? Colors.light;
  const insets = useSafeAreaInsets();

  const translateY = useRef(new Animated.Value(SNAP_COLLAPSED)).current;

  // Reset position when opened
  useEffect(() => {
    if (visible) {
      translateY.setValue(SNAP_COLLAPSED);
    }
  }, [visible]);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, g) => Math.abs(g.dy) > 5,

      onPanResponderMove: (_, g) => {
        const nextY = SNAP_COLLAPSED + g.dy;

        if (nextY >= SNAP_EXPANDED && nextY <= SNAP_COLLAPSED) {
          translateY.setValue(nextY);
        }
      },

      onPanResponderRelease: (_, g) => {
        // Swipe down → close
        if (g.dy > 140) {
          onClose();
          return;
        }

        // Snap logic
        const shouldExpand = g.dy < -60;

        Animated.spring(translateY, {
          toValue: shouldExpand ? SNAP_EXPANDED : SNAP_COLLAPSED,
          useNativeDriver: true,
        }).start();
      },
    })
  ).current;

  if (!visible) return null;

  return (
    <Modal transparent animationType="fade" visible={visible}>
      {/* Overlay */}
      <Pressable style={styles.overlay} onPress={onClose} />

      {/* Bottom Sheet */}
      <Animated.View
        style={[
          styles.sheet,
          {
            height: SHEET_HEIGHT,
            backgroundColor: theme.cardBackground,
            paddingBottom: insets.bottom + 12,
            transform: [{ translateY }],
          },
        ]}
      >
        {/* Drag handle */}
        <View {...panResponder.panHandlers} style={styles.dragZone}>
          <View style={styles.handle} />
        </View>

        {/* Scrollable content */}
        <ScrollView
          contentContainerStyle={{ paddingBottom: 24 }}
          showsVerticalScrollIndicator={false}
          nestedScrollEnabled
        >
          {children}
        </ScrollView>
      </Animated.View>
    </Modal>
  );
};

export default ThemedBottomSheet;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
  },

  sheet: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 16,
    paddingTop: 8,
  },

  dragZone: {
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },

  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#888",
  },
});
