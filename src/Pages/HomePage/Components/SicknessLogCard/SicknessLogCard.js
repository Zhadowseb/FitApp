import { useState } from "react";
import { View, useColorScheme } from "react-native";

import styles from "./SicknessLogCardStyle";
import HomeImageShortcutCard from "../HomeImageShortcutCard/HomeImageShortcutCard";
import { Colors } from "../../../../Resources/GlobalStyling/colors";
import {
  ThemedButton,
  ThemedModal,
  ThemedText,
} from "../../../../Resources/ThemedComponents";

const sicknessDarkImage = require("../../../../Resources/Images/DarkVersion/sickness dark.png");

const symptomPreviewItems = ["Fever", "Cold", "Fatigue", "Pain"];

export default function SicknessLogCard() {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme] ?? Colors.light;
  const [modalVisible, setModalVisible] = useState(false);
  const [isLogged, setIsLogged] = useState(false);

  const primaryColor = theme.primary ?? "#f7742e";
  const cardBorder = theme.cardBorder ?? theme.border ?? theme.iconColor ?? theme.text;
  const innerSurface = theme.uiBackground ?? theme.cardBackground ?? theme.background;
  const quietText = theme.quietText ?? theme.iconColor ?? theme.text;

  const handleLogDraft = () => {
    setIsLogged(true);
    setModalVisible(false);
  };

  return (
    <>
      <HomeImageShortcutCard
        accessibilityLabel="Log sickness"
        imageSource={sicknessDarkImage}
        onPress={() => setModalVisible(true)}
        title="Log sickness"
      />

      <ThemedModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        title="Log sickness"
        style={styles.modal}
        contentStyle={styles.modalContent}
      >
        <View
          style={[
            styles.modalSummary,
            {
              backgroundColor: innerSurface,
              borderColor: cardBorder,
            },
          ]}
        >
          <ThemedText style={styles.modalEyebrow} setColor={primaryColor}>
            TODAY
          </ThemedText>
          <ThemedText style={styles.modalCopy} setColor={quietText}>
            Mark today as sickness-related rest and add symptoms to explain missed or adjusted training.
          </ThemedText>
        </View>

        <View style={styles.symptomGrid}>
          {symptomPreviewItems.map((label) => (
            <View
              key={label}
              style={[
                styles.symptomChip,
                {
                  backgroundColor: innerSurface,
                  borderColor: cardBorder,
                },
              ]}
            >
              <ThemedText style={styles.symptomChipText} setColor={quietText}>
                {label}
              </ThemedText>
            </View>
          ))}
        </View>

        <View style={styles.modalButtonRow}>
          <ThemedButton
            title="Close"
            variant="secondary"
            onPress={() => setModalVisible(false)}
            style={styles.modalButton}
          />
          <ThemedButton
            title={isLogged ? "Logged" : "Mark sick"}
            variant="primary"
            onPress={handleLogDraft}
            style={[styles.modalButton, { backgroundColor: primaryColor }]}
          />
        </View>
      </ThemedModal>
    </>
  );
}
