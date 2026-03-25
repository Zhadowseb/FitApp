import { View, useColorScheme } from "react-native";
import { useState } from "react";

import styles from "./ProfilePageStyle";
import { Colors } from "../../Resources/GlobalStyling/colors";
import { logout } from "../../Database/supaBaseClient";
import { useAuth } from "../../Contexts/AuthContext";
import {
  ThemedButton,
  ThemedCard,
  ThemedHeader,
  ThemedText,
  ThemedTitle,
  ThemedView,
} from "../../Resources/ThemedComponents";

export default function ProfilePage() {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme] ?? Colors.light;
  const { user } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [logoutError, setLogoutError] = useState("");
  const headerEyebrowColor = theme.quietText ?? theme.iconColor;

  const handleLogout = async () => {
    setLogoutError("");
    setIsLoggingOut(true);

    try {
      await logout();
    } catch (error) {
      setLogoutError(
        error instanceof Error ? error.message : "Could not log out."
      );
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedHeader>
        <View style={styles.pageHeaderTitleGroup}>
          <ThemedText
            size={10}
            style={[
              styles.pageHeaderTitleEyebrow,
              { color: headerEyebrowColor },
            ]}
          >
            FitVen
          </ThemedText>

          <ThemedTitle
            type="h3"
            style={styles.pageHeaderTitleMain}
            numberOfLines={1}
          >
            Profile
          </ThemedTitle>
        </View>
      </ThemedHeader>

      <View style={styles.content}>
        <ThemedCard style={styles.profileCard}>
          <ThemedText
            size={12}
            style={styles.cardEyebrow}
            setColor={headerEyebrowColor}
          >
            Account
          </ThemedText>
          <ThemedTitle type="h3" style={styles.cardTitle}>
            Logged in
          </ThemedTitle>
          <ThemedText style={styles.accountValue}>
            {user?.email ?? "Unknown account"}
          </ThemedText>
          <ThemedText style={styles.cardBody} setColor={headerEyebrowColor}>
            You can log out here when you want to switch account.
          </ThemedText>

          <View style={styles.actions}>
            <ThemedButton
              title={isLoggingOut ? "Logging out..." : "Log out"}
              variant="danger"
              onPress={handleLogout}
              fullWidth
              disabled={isLoggingOut}
              style={styles.logoutButton}
            />

            {logoutError ? (
              <ThemedText style={styles.errorText} setColor={theme.danger}>
                {logoutError}
              </ThemedText>
            ) : null}
          </View>
        </ThemedCard>
      </View>
    </ThemedView>
  );
}
