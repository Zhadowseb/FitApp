import { StatusBar } from "expo-status-bar";
import { View, useColorScheme } from "react-native";
import { useNavigation } from "@react-navigation/native";

import styles from "./RegisterPageStyle";
import { Colors } from "../../Resources/GlobalStyling/colors";
import {
  ThemedButton,
  ThemedCard,
  ThemedText,
  ThemedView,
} from "../../Resources/ThemedComponents";

export default function RegisterPage() {
  const navigation = useNavigation();
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme] ?? Colors.light;
  const titleColor = theme.title ?? theme.text;
  const quietText = theme.quietText ?? theme.iconColor ?? theme.text;
  const cardSurface = theme.cardBackground ?? theme.background;
  const cardBorder = theme.cardBorder ?? theme.iconColor ?? theme.text;

  return (
    <ThemedView style={styles.container}>
      <View
        pointerEvents="none"
        style={[
          styles.heroAccentPrimary,
          { backgroundColor: theme.secondary ?? theme.primary },
        ]}
      />
      <View
        pointerEvents="none"
        style={[
          styles.heroAccentSecondary,
          { backgroundColor: theme.primary ?? theme.iconColor },
        ]}
      />

      <View style={styles.content}>
        <View style={styles.heroBlock}>
          <ThemedText style={styles.eyebrow} setColor={quietText}>
            FitVen Cloud
          </ThemedText>
          <ThemedText style={styles.title} setColor={titleColor}>
            Register
          </ThemedText>
          <ThemedText style={styles.subtitle} setColor={quietText}>
            This page will be used to create a new cloud account.
          </ThemedText>
        </View>

        <ThemedCard
          style={[
            styles.registerCard,
            {
              backgroundColor: cardSurface,
              borderColor: cardBorder,
            },
          ]}
        >
          <ThemedText style={styles.cardLabel} setColor={quietText}>
            New account
          </ThemedText>
          <ThemedText style={styles.cardTitle} setColor={titleColor}>
            Registration form goes here
          </ThemedText>
          <ThemedText style={styles.cardBody} setColor={quietText}>
            We will add the actual Supabase sign-up flow here next.
          </ThemedText>
        </ThemedCard>

        <View style={styles.actions}>
          <ThemedButton
            title="Back to login"
            variant="secondary"
            onPress={() => navigation.goBack()}
            fullWidth
            style={styles.secondaryButton}
          />
        </View>
      </View>

      <StatusBar style={colorScheme === "dark" ? "light" : "dark"} />
    </ThemedView>
  );
}
