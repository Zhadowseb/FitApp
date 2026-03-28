import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { TouchableOpacity, View, useColorScheme } from 'react-native';
import { useNavigation } from '@react-navigation/native';

import styles from './HomePageStyle';
import { Colors } from '../../Resources/GlobalStyling/colors';
import Male from '../../Resources/Icons/UI-icons/Male';
import FeedbackModal from './Components/FeedbackModal/FeedbackModal';

import { 
  ThemedView,  
  ThemedButton,
  ThemedHeader,
  ThemedText,
  ThemedTitle,
} from "../../Resources/ThemedComponents";
import { useAuth } from '../../Contexts/AuthContext';

export default function App() {
  const [feedbackModalVisible, setFeedbackModalVisible] = useState(false);
  const navigation = useNavigation();
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme] ?? Colors.light;
  const { user } = useAuth();
  const headerEyebrowColor = theme.quietText ?? theme.iconColor;
  const primaryColor = theme.primary ?? "#f7742e";
  const secondaryColor = theme.secondary ?? "#60daac";
  const cardSurface = theme.cardBackground ?? theme.background;
  const innerSurface = theme.uiBackground ?? cardSurface;
  const cardBorder = theme.cardBorder ?? theme.border ?? theme.iconColor ?? theme.text;
  const quietText = theme.quietText ?? theme.iconColor ?? theme.text;
  const titleColor = theme.title ?? theme.text;

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

      <View style={styles.content}>
        <View style={styles.button_spacing}> 
          <ThemedButton 
            title="Go to Program Page"
            onPress={() => navigation.navigate('ProgramPage')}  
          />
        </View>

        <View style={styles.button_spacing}>
          <ThemedButton
            title="Exercise Library"
            onPress={() => navigation.navigate("ExerciseLibraryPage")}
          />
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
      </View>

      <FeedbackModal
        visible={feedbackModalVisible}
        onClose={() => setFeedbackModalVisible(false)}
        userId={user?.id ?? null}
      />

      <StatusBar style="auto" />
    </ThemedView>
  );
}
