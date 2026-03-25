import { StatusBar } from "expo-status-bar";
import { View, useColorScheme } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useState } from "react";

import styles from "./RegisterPageStyle";
import { Colors } from "../../Resources/GlobalStyling/colors";
import { testSupabaseConnection } from "../../Database/supaBaseClient";
import {
  ThemedButton,
  ThemedCard,
  ThemedKeyboardProtection,
  ThemedText,
  ThemedTextInput,
  ThemedView,
} from "../../Resources/ThemedComponents";

export default function RegisterPage() {
  const navigation = useNavigation();
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme] ?? Colors.light;
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [retypePassword, setRetypePassword] = useState("");
  const [connectionState, setConnectionState] = useState({
    status: "idle",
    message: "",
  });
  const titleColor = theme.title ?? theme.text;
  const quietText = theme.quietText ?? theme.iconColor ?? theme.text;
  const cardSurface = theme.cardBackground ?? theme.background;
  const cardBorder = theme.cardBorder ?? theme.iconColor ?? theme.text;
  const passwordsMismatch =
    retypePassword.length > 0 && password !== retypePassword;
  const statusColor =
    connectionState.status === "success"
      ? theme.secondary ?? titleColor
      : connectionState.status === "error"
        ? theme.danger ?? titleColor
        : quietText;

  const handleTestConnection = async () => {
    setConnectionState({
      status: "loading",
      message: "Tester forbindelse til Supabase...",
    });

    try {
      const result = await testSupabaseConnection();
      setConnectionState({
        status: "success",
        message: `Forbindelse OK (${result.status}).`,
      });
    } catch (error) {
      setConnectionState({
        status: "error",
        message:
          error instanceof Error
            ? error.message
            : "Kunne ikke oprette forbindelse til Supabase.",
      });
    }
  };

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
        <ThemedKeyboardProtection scroll contentContainerStyle={styles.scrollContent}>
          <View style={styles.heroBlock}>
            <ThemedText style={styles.eyebrow} setColor={quietText}>
              FitVen Cloud
            </ThemedText>
            <ThemedText style={styles.title} setColor={titleColor}>
              Register
            </ThemedText>
            <ThemedText style={styles.subtitle} setColor={quietText}>
              Create a new cloud account for syncing programs and workouts.
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
              Account details
            </ThemedText>

            <View style={styles.formSection}>
              <ThemedText style={styles.inputLabel} setColor={quietText}>
                Email
              </ThemedText>
              <ThemedTextInput
                value={email}
                onChangeText={setEmail}
                placeholder="you@example.com"
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="email-address"
                style={styles.inputWrapper}
              />
            </View>

            <View style={styles.formSection}>
              <ThemedText style={styles.inputLabel} setColor={quietText}>
                Password
              </ThemedText>
              <ThemedTextInput
                value={password}
                onChangeText={setPassword}
                placeholder="Enter password"
                secureTextEntry
                autoCapitalize="none"
                autoCorrect={false}
                style={styles.inputWrapper}
              />
            </View>

            <View style={styles.formSection}>
              <ThemedText style={styles.inputLabel} setColor={quietText}>
                Retype password
              </ThemedText>
              <ThemedTextInput
                value={retypePassword}
                onChangeText={setRetypePassword}
                placeholder="Retype password"
                secureTextEntry
                autoCapitalize="none"
                autoCorrect={false}
                error={passwordsMismatch ? "Passwords do not match." : undefined}
                style={styles.inputWrapper}
              />
            </View>
          </ThemedCard>

          <View style={styles.actions}>
            <ThemedButton
              title={
                connectionState.status === "loading"
                  ? "Testing..."
                  : "Test Supabase connection"
              }
              onPress={handleTestConnection}
              fullWidth
              style={styles.primaryButton}
              disabled={connectionState.status === "loading"}
            />

            {connectionState.message ? (
              <ThemedText
                style={styles.connectionStatus}
                setColor={statusColor}
              >
                {connectionState.message}
              </ThemedText>
            ) : null}

            <ThemedButton
              title="Back to login"
              variant="secondary"
              onPress={() => navigation.goBack()}
              fullWidth
              style={styles.secondaryButton}
            />
          </View>
        </ThemedKeyboardProtection>
      </View>

      <StatusBar style={colorScheme === "dark" ? "light" : "dark"} />
    </ThemedView>
  );
}
