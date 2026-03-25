import { View, useColorScheme } from "react-native";

import styles from "./ProfilePageStyle";
import { Colors } from "../../Resources/GlobalStyling/colors";
import {
  ThemedCard,
  ThemedHeader,
  ThemedText,
  ThemedTitle,
  ThemedView,
} from "../../Resources/ThemedComponents";

export default function ProfilePage() {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme] ?? Colors.light;
  const headerEyebrowColor = theme.quietText ?? theme.iconColor;

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
          <ThemedText size={12} style={styles.cardEyebrow} setColor={headerEyebrowColor}>
            Account
          </ThemedText>
          <ThemedTitle type="h3" style={styles.cardTitle}>
            Profile page
          </ThemedTitle>
          <ThemedText style={styles.cardBody} setColor={headerEyebrowColor}>
            This is where the profile view will live.
          </ThemedText>
        </ThemedCard>
      </View>
    </ThemedView>
  );
}
