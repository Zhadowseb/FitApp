import { ActivityIndicator, View, useColorScheme } from "react-native";
import { useCallback, useState } from "react";
import { useSQLiteContext } from "expo-sqlite";
import { useFocusEffect } from "@react-navigation/native";

import { programService } from "../../../../Services";
import { Colors } from "../../../../Resources/GlobalStyling/colors";
import { ThemedText, ThemedTitle } from "../../../../Resources/ThemedComponents";
import { getTodaysDate } from "../../../../Utils/dateUtils";
import TodayShortcut from "../../../ProgramOverviewPage/Components/TodayShortcut/TodayShortcut";
import styles from "./TodayProgramsShortcutStyle";

const TodayProgramsShortcut = () => {
  const db = useSQLiteContext();
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme] ?? Colors.light;
  const [programSnapshots, setProgramSnapshots] = useState([]);
  const [loading, setLoading] = useState(false);

  const date = getTodaysDate();

  const loadToday = useCallback(async () => {
    try {
      setLoading(true);
      const snapshots = await programService.getTodayProgramSnapshots(db, {
        date,
      });
      setProgramSnapshots(snapshots);
    } catch (error) {
      console.error(error);
      setProgramSnapshots([]);
    } finally {
      setLoading(false);
    }
  }, [db, date]);

  useFocusEffect(
    useCallback(() => {
      loadToday();
    }, [loadToday])
  );

  const quietText = theme.quietText ?? theme.iconColor ?? theme.text;
  const hasMultiplePrograms = programSnapshots.length > 1;

  return (
    <View style={styles.container}>
      {loading ? (
        <View style={styles.loadingState}>
          <ActivityIndicator size="small" color={theme.primary} />
          <ThemedText style={styles.loadingCopy} setColor={quietText}>
            Loading today&apos;s training...
          </ThemedText>
        </View>
      ) : programSnapshots.length === 0 ? (
        <View style={styles.emptyState}>
          <ThemedTitle type="h2">Today</ThemedTitle>
          <ThemedText style={styles.emptyCopy} setColor={quietText}>
            No workouts are scheduled today.
          </ThemedText>
        </View>
      ) : (
        programSnapshots.map((programSnapshot) => (
          <View
            key={programSnapshot.program.program_id}
            style={styles.programSection}
          >
            {hasMultiplePrograms ? (
              <View style={styles.programLabelGroup}>
                <ThemedText
                  style={styles.programLabelEyebrow}
                  setColor={quietText}
                >
                  Program
                </ThemedText>
                <ThemedTitle type="h3" style={styles.programLabelTitle}>
                  {programSnapshot.program.program_name || "Untitled program"}
                </ThemedTitle>
              </View>
            ) : null}

            <TodayShortcut program_id={programSnapshot.program.program_id} />
          </View>
        ))
      )}
    </View>
  );
};

export default TodayProgramsShortcut;
