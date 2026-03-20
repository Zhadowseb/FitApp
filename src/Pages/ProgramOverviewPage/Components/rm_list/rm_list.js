import { useState, useEffect } from "react";
import {
  View,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  useColorScheme,
} from "react-native";
import { useSQLiteContext } from "expo-sqlite";
import { Colors } from "../../../../Resources/GlobalStyling/colors";

import styles from "./Rm_listStyle";
import { weightliftingService } from "../../../../Services";
import EditEstimatedSet from "./Components/EditEstimatedSet/EditEstimatedSet";

import { ThemedText } from "../../../../Resources/ThemedComponents";

function formatWeight(value) {
  const parsedValue = Number(value);

  if (!Number.isFinite(parsedValue)) {
    return "--";
  }

  return Number.isInteger(parsedValue) ? `${parsedValue}` : parsedValue.toFixed(1);
}

const RmList = ({ program_id, refreshKey, refresh }) => {
  const db = useSQLiteContext();
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme] ?? Colors.light;

  const [loading, setLoading] = useState(false);
  const [editEstimatedSet_visible, set_editEstimatedSet_visible] = useState(false);
  const [estimated_sets, setEstimated_sets] = useState([]);
  const [selectedSet, setSelectedSet] = useState(null);

  const accentSoft = theme.primaryLight ?? "rgba(247, 116, 46, 0.18)";
  const successSoft = theme.secondaryLight ?? "rgba(96, 218, 172, 0.18)";
  const badgeBackground = theme.cardBackground ?? theme.uiBackground ?? "#1b1918";
  const badgeTextColor = theme.text ?? "#d4d4d4";
  const quietText = theme.quietText ?? theme.iconColor ?? "#9591a5";
  const tileTextColor = theme.cardBackground ?? theme.textInverted ?? "#201e2b";
  const emptyBackground = theme.uiBackground ?? "rgba(255, 255, 255, 0.04)";
  const emptyBorder = theme.cardBorder ?? theme.iconColor ?? "#383838";

  const loadEstimatedSets = async () => {
    try {
      setLoading(true);
      const nextEstimatedSets = await weightliftingService.getEstimatedSets(
        db,
        program_id
      );
      setEstimated_sets(nextEstimatedSets);
    } catch (error) {
      console.error("Error loading estimated sets", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (data) => {
    try {
      await weightliftingService.updateEstimatedSetWeight(db, {
        estimatedSetId: data.id,
        estimatedWeight: data.estimated_weight,
      });
      refresh();
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (data) => {
    try {
      await weightliftingService.deleteEstimatedSet(db, data.id);
      refresh();
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEstimatedSets();
  }, [program_id, refreshKey]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        nestedScrollEnabled
        style={styles.wrapper}
        contentContainerStyle={styles.list}
      >
        {estimated_sets.length > 0 && (
          <View style={styles.metaRow}>
            <ThemedText size={12} setColor={quietText}>
              {estimated_sets.length} estimated lifts
            </ThemedText>
            <ThemedText size={11} style={styles.metaHint} setColor={quietText}>
              Tap a row to edit
            </ThemedText>
          </View>
        )}

        {estimated_sets.length === 0 && (
          <View
            style={[
              styles.emptyState,
              {
                backgroundColor: emptyBackground,
                borderColor: emptyBorder,
              },
            ]}
          >
            <ThemedText style={styles.emptyText}>
              No 1 RM have been set.
            </ThemedText>
            <ThemedText
              size={12}
              style={styles.emptyHint}
              setColor={quietText}
            >
              Add your first estimate below to start using weight targets.
            </ThemedText>
          </View>
        )}

        {estimated_sets.map((item, index) => {
          const tileBackground = index % 2 === 0 ? accentSoft : successSoft;

          return (
            <TouchableOpacity
              key={item.estimated_set_id}
              style={[
                styles.estimateTile,
                { backgroundColor: tileBackground },
              ]}
              activeOpacity={0.88}
              onPress={() => {
                setSelectedSet(item);
                set_editEstimatedSet_visible(true);
              }}
            >
              <View style={styles.estimateContent}>
                <ThemedText
                  size={10}
                  style={styles.estimateEyebrow}
                  setColor={quietText}
                >
                  Exercise
                </ThemedText>
                <ThemedText
                  size={18}
                  style={styles.estimateExerciseName}
                  setColor={tileTextColor}
                >
                  {item.exercise_name}
                </ThemedText>
                <ThemedText
                  size={11}
                  style={styles.estimateHint}
                  setColor={quietText}
                >
                  Estimated one rep max
                </ThemedText>
              </View>

              <View
                style={[
                  styles.weightBadge,
                  { backgroundColor: badgeBackground },
                ]}
              >
                <ThemedText
                  size={24}
                  style={styles.weightValue}
                  setColor={badgeTextColor}
                >
                  {formatWeight(item.estimated_weight)}
                </ThemedText>
                <ThemedText
                  size={10}
                  style={styles.weightLabel}
                  setColor={badgeTextColor}
                >
                  kg
                </ThemedText>
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <EditEstimatedSet
        visible={editEstimatedSet_visible}
        estimatedSet={selectedSet}
        onClose={() => set_editEstimatedSet_visible(false)}
        onSubmit={handleSubmit}
        onDelete={handleDelete}
        refreshKey={refreshKey}
      />
    </View>
  );
};

export default RmList;
