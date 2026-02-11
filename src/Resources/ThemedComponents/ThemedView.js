import { View, StyleSheet, useColorScheme } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Colors } from "../GlobalStyling/colors";

const ThemedView = ({
  style,
  safe = true,
  ...props
}) => {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme] ?? Colors.light;
  const insets = useSafeAreaInsets();

  const safeStyle = (() => {
    if (!safe) return null;

    if (safe === true) {
      return {
        paddingTop: insets.top,
        paddingBottom: insets.bottom,
        paddingLeft: insets.left,
        paddingRight: insets.right,
      };
    }

    if (Array.isArray(safe)) {
      return {
        paddingTop: safe.includes("top") ? insets.top : 0,
        paddingBottom: safe.includes("bottom") ? insets.bottom : 0,
        paddingLeft: safe.includes("left") ? insets.left : 0,
        paddingRight: safe.includes("right") ? insets.right : 0,
      };
    }

    if (typeof safe === "string") {
      return {
        [`padding${safe.charAt(0).toUpperCase() + safe.slice(1)}`]:
          insets[safe],
      };
    }

    return null;
  })();

  return (
    <View
      {...props}
      style={[
        styles.container,
        { backgroundColor: theme.background },
        safeStyle,
        style,
      ]}
    />
  );
};

export default ThemedView;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
