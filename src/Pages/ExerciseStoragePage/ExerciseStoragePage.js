import { StatusBar } from "expo-status-bar";
import { ScrollView, View, useColorScheme } from "react-native";
import { useState, useCallback } from "react";
import { useFocusEffect } from "@react-navigation/native";

import styles from "./ExerciseStoragePageStyle";
import ExerciseStorageList from "./Components/ExerciseStorageList/ExerciseStorageList";
import { Colors } from "../../Resources/GlobalStyling/colors";
import {
  ThemedHeader,
  ThemedText,
  ThemedTitle,
  ThemedView,
} from "../../Resources/ThemedComponents";

const ExerciseStoragePage = () => {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme] ?? Colors.light;
  const [refreshKey, set_refreshKey] = useState(0);
  const quietText = theme.quietText ?? theme.iconColor ?? theme.text;

  const refresh = () => {
    set_refreshKey((prev) => prev + 1);
  };

  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [])
  );

  return (
    <ThemedView style={styles.container}>
      <ThemedHeader>
        <View style={styles.pageHeaderTitleGroup}>
          <ThemedText
            size={10}
            style={[
              styles.pageHeaderTitleEyebrow,
              { color: quietText },
            ]}
          >
            FitVen
          </ThemedText>

          <ThemedTitle
            type="h3"
            style={styles.pageHeaderTitleMain}
            numberOfLines={1}
          >
            Exercise Library
          </ThemedTitle>
        </View>
      </ThemedHeader>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <ExerciseStorageList refreshKey={refreshKey} />
      </ScrollView>

      <StatusBar style={colorScheme === "dark" ? "light" : "dark"} />
    </ThemedView>
  );
};

export default ExerciseStoragePage;
