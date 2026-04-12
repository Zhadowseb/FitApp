import { StatusBar } from 'expo-status-bar';
import { useCallback, useState } from 'react';
import { ScrollView, TouchableOpacity, View, useColorScheme } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { useSQLiteContext } from "expo-sqlite";

import styles from './HomePageStyle';
import { Colors } from '../../Resources/GlobalStyling/colors';
import Male from '../../Resources/Icons/UI-icons/Male';
import FeedbackModal from './Components/FeedbackModal/FeedbackModal';
import TodayProgramsShortcut from './Components/TodayProgramsShortcut/TodayProgramsShortcut';
import {
  programService,
  weightliftingService,
} from "../../Services";

import { 
  ThemedView,  
  ThemedHeader,
  ThemedText,
  ThemedTitle,
} from "../../Resources/ThemedComponents";
import { useAuth } from '../../Contexts/AuthContext';

export default function App() {
  const db = useSQLiteContext();
  const [feedbackModalVisible, setFeedbackModalVisible] = useState(false);
  const [quickAccessStats, setQuickAccessStats] = useState({
    programCount: 0,
    completedProgramCount: 0,
    exerciseCount: 0,
  });
  const navigation = useNavigation();
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme] ?? Colors.light;
  const { user } = useAuth();
  const headerEyebrowColor = theme.quietText ?? theme.iconColor;
  const primaryColor = theme.primary ?? "#f7742e";
  const secondaryColor = theme.secondary ?? "#60daac";
  const cardSurface = theme.cardBackground ?? theme.background;
  const panelSurface = theme.uiBackground ?? cardSurface;
  const cardBorder = theme.cardBorder ?? theme.border ?? theme.iconColor ?? theme.text;
  const quietText = theme.quietText ?? theme.iconColor ?? theme.text;
  const titleColor = theme.title ?? theme.text;
  const cardTextColor = theme.cardBackground ?? theme.textInverted ?? "#1b1918";

  const loadQuickAccessStats = useCallback(async () => {
    try {
      const [programs, exerciseRows] = await Promise.all([
        programService.getProgramsOverview(db),
        weightliftingService.getExerciseStorage(db),
      ]);

      setQuickAccessStats({
        programCount: programs.length,
        completedProgramCount: programs.filter(
          (program) => program.status === "COMPLETE"
        ).length,
        exerciseCount: exerciseRows.length,
      });
    } catch (error) {
      console.error(error);
      setQuickAccessStats({
        programCount: 0,
        completedProgramCount: 0,
        exerciseCount: 0,
      });
    }
  }, [db]);

  useFocusEffect(
    useCallback(() => {
      loadQuickAccessStats();
    }, [loadQuickAccessStats])
  );

  const quickAccessCards = [
    {
      key: "programs",
      eyebrow: "PROGRAMS",
      title: "Manage your programs",
      description:
        "Create, edit and manage your programs, and keep your templates close as your library grows.",
      accent: primaryColor,
      accentSoft: theme.primaryLight ?? "rgba(247, 116, 46, 0.14)",
      onPress: () => navigation.navigate("ProgramPage"),
      metrics: [
        { label: "Total", value: quickAccessStats.programCount },
        { label: "Completed", value: quickAccessStats.completedProgramCount },
        { label: "Templates", value: 0 },
      ],
      footer: "Open programs",
    },
    {
      key: "exercise-library",
      eyebrow: "LIBRARY",
      title: "Browse your catalog",
      description:
        "Browse your exercise library, filter by muscle groups, explore what each movement trains, and create or manage your own exercises.",
      accent: secondaryColor,
      accentSoft: theme.secondaryLight ?? "rgba(96, 218, 172, 0.14)",
      onPress: () => navigation.navigate("ExerciseLibraryPage"),
      metrics: [
        { label: "Exercises", value: quickAccessStats.exerciseCount },
        { label: "Custom exercises", value: 0 },
      ],
      footer: "Open exercise library",
    },
  ];

  return (
    <ThemedView style={styles.container}>
      <ThemedHeader
        showBack={false}
        right={
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => navigation.navigate("ProfilePage")}
          >
            <View
              style={[
                styles.headerAvatar,
                {
                  backgroundColor: theme.uiBackground ?? theme.cardBackground,
                  borderColor: theme.cardBorder ?? theme.border,
                },
              ]}
            >
              <Male width={22} height={22} color={theme.primary} />
            </View>
          </TouchableOpacity>
        }
      >
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
            Home
          </ThemedTitle>
        </View>
      </ThemedHeader>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <TodayProgramsShortcut />

        <View style={styles.quickAccessSection}>
          <View style={styles.quickAccessGrid}>
            {quickAccessCards.map((card) => (
              <TouchableOpacity
                key={card.key}
                activeOpacity={0.92}
                onPress={card.onPress}
                style={[
                  styles.quickAccessCard,
                  {
                    backgroundColor: cardSurface,
                    borderColor: cardBorder,
                  },
                ]}
              >
                <View
                  pointerEvents="none"
                  style={[
                    styles.quickAccessAccent,
                    { backgroundColor: card.accent },
                  ]}
                />

                <View style={styles.quickAccessCardHeader}>
                  <View>
                    <ThemedText
                      style={styles.quickAccessCardEyebrow}
                      setColor={card.accent}
                    >
                      {card.eyebrow}
                    </ThemedText>
                    <ThemedTitle
                      type="h3"
                      style={[styles.quickAccessCardTitle, { color: titleColor }]}
                    >
                      {card.title}
                    </ThemedTitle>
                  </View>
                </View>

                <ThemedText
                  style={styles.quickAccessCardDescription}
                  setColor={quietText}
                >
                  {card.description}
                </ThemedText>

                <View style={styles.quickAccessMetricsRow}>
                  {card.metrics.map((metric) => (
                    <View
                      key={`${card.key}-${metric.label}`}
                      style={[
                        styles.quickAccessMetricCard,
                        {
                          backgroundColor: panelSurface,
                          borderColor: cardBorder,
                        },
                      ]}
                    >
                      <ThemedText
                        style={styles.quickAccessMetricValue}
                        setColor={titleColor}
                      >
                        {metric.value}
                      </ThemedText>
                      <ThemedText
                        style={styles.quickAccessMetricLabel}
                        setColor={card.accent}
                      >
                        {metric.label}
                      </ThemedText>
                    </View>
                  ))}
                </View>

                <View style={styles.quickAccessFooter}>
                  <ThemedText
                    style={styles.quickAccessFooterText}
                    setColor={cardTextColor}
                  >
                    {card.footer}
                  </ThemedText>
                  <View
                    style={[
                      styles.quickAccessFooterAccent,
                      { backgroundColor: card.accent },
                    ]}
                  />
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <TouchableOpacity
          activeOpacity={0.92}
          onPress={() => setFeedbackModalVisible(true)}
          style={[
            styles.feedbackPortal,
            {
              backgroundColor: cardSurface,
              borderColor: primaryColor,
            },
          ]}
        >
          <View
            pointerEvents="none"
            style={[
              styles.feedbackPortalGlowPrimary,
              { backgroundColor: primaryColor },
            ]}
          />
          <View
            pointerEvents="none"
            style={[
              styles.feedbackPortalGlowSecondary,
              { backgroundColor: secondaryColor },
            ]}
          />

          <View style={styles.feedbackPortalTopRow}>
            <View
              style={[
                styles.feedbackPortalSticker,
                {
                  backgroundColor:
                    theme.secondaryLight ?? "rgba(96, 218, 172, 0.16)",
                  borderColor: cardBorder,
                },
              ]}
            >
              <ThemedText
                style={styles.feedbackPortalStickerText}
                setColor={theme.secondaryDark ?? secondaryColor}
              >
                HELP US IMPROVE
              </ThemedText>
            </View>
          </View>

          <ThemedTitle
            type="h3"
            style={[styles.feedbackPortalTitle, { color: titleColor }]}
          >
            Send Feedback
          </ThemedTitle>

          <ThemedText
            style={styles.feedbackPortalDescription}
            setColor={quietText}
          >
            Report bugs, odd behavior, ideas or something you're missing.
          </ThemedText>

        </TouchableOpacity>
      </ScrollView>

      <FeedbackModal
        visible={feedbackModalVisible}
        onClose={() => setFeedbackModalVisible(false)}
        userId={user?.id ?? null}
      />

      <StatusBar style="auto" />
    </ThemedView>
  );
}
