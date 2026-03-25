import { StatusBar } from "expo-status-bar";

import styles from "./LoginPageStyle";
import { ThemedView } from "../../Resources/ThemedComponents";

export default function LoginPage() {
  return (
    <ThemedView style={styles.container}>
      <StatusBar style="auto" />
    </ThemedView>
  );
}
