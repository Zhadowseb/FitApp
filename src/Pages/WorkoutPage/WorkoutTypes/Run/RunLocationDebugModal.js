import { ScrollView, View, useColorScheme } from "react-native";

import { Colors } from "../../../../Resources/GlobalStyling/colors";
import {
  ThemedButton,
  ThemedModal,
  ThemedText,
  ThemedTitle,
} from "../../../../Resources/ThemedComponents";
import styles from "./RunLocationDebugModalStyle";

const REJECTION_LABELS = {
  accuracy: "Accuracy",
  too_short: "Too short",
  too_fast: "Too fast",
  invalid_time: "Bad time",
};

function formatClock(timestamp) {
  if (!Number.isFinite(Number(timestamp))) {
    return "--:--:--";
  }

  const date = new Date(Number(timestamp));
  const pad = (value) => String(value).padStart(2, "0");

  return `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
}

function formatMeters(value) {
  return Number.isFinite(Number(value)) ? `${Number(value).toFixed(1)} m` : "--";
}

function formatSeconds(value) {
  return Number.isFinite(Number(value)) ? `${Number(value).toFixed(1)} s` : "--";
}

function formatSpeed(value) {
  return Number.isFinite(Number(value)) ? `${Number(value).toFixed(2)} m/s` : "--";
}

function formatAccuracy(value) {
  return Number.isFinite(Number(value)) ? `${Math.round(Number(value))} m` : "--";
}

function formatCoordinate(value) {
  return Number.isFinite(Number(value)) ? Number(value).toFixed(5) : "--";
}

export default function RunLocationDebugModal({
  visible,
  onClose,
  report,
  hasWorkoutStarted = false,
}) {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme] ?? Colors.light;

  const summary = report?.summary ?? {
    totalCallbacks: 0,
    acceptedCount: 0,
    rejectedCount: 0,
    accuracyRejections: 0,
    shortDistanceRejections: 0,
    tooFastRejections: 0,
    invalidTimeRejections: 0,
  };
  const rows = report?.rows ?? [];

  return (
    <ThemedModal
      visible={visible}
      onClose={onClose}
      title="GPS Debug"
      style={styles.modal}
      contentStyle={styles.content}
    >
      <ThemedText
        style={styles.subtitle}
        setColor={theme.quietText ?? theme.iconColor ?? theme.text}
      >
        Raw location callbacks from Expo before distance filtering.
      </ThemedText>

      <View style={styles.summaryGrid}>
        <View
          style={[
            styles.summaryCard,
            {
              backgroundColor: theme.uiBackground ?? theme.background,
              borderColor: theme.cardBorder ?? theme.iconColor ?? theme.text,
            },
          ]}
        >
          <ThemedText
            style={styles.summaryLabel}
            setColor={theme.quietText ?? theme.iconColor ?? theme.text}
          >
            Raw callbacks
          </ThemedText>
          <ThemedText style={styles.summaryValue}>{summary.totalCallbacks}</ThemedText>
        </View>

        <View
          style={[
            styles.summaryCard,
            {
              backgroundColor:
                theme.secondaryLight ?? "rgba(96, 218, 172, 0.14)",
              borderColor: theme.secondary ?? theme.text,
            },
          ]}
        >
          <ThemedText
            style={styles.summaryLabel}
            setColor={theme.secondaryDark ?? theme.secondary ?? theme.text}
          >
            Accepted
          </ThemedText>
          <ThemedText
            style={styles.summaryValue}
            setColor={theme.secondaryDark ?? theme.secondary ?? theme.text}
          >
            {summary.acceptedCount}
          </ThemedText>
        </View>

        <View
          style={[
            styles.summaryCard,
            {
              backgroundColor: theme.primaryLight ?? "rgba(247, 116, 46, 0.12)",
              borderColor: theme.primary ?? theme.text,
            },
          ]}
        >
          <ThemedText
            style={styles.summaryLabel}
            setColor={theme.primaryDark ?? theme.primary ?? theme.text}
          >
            Rejected
          </ThemedText>
          <ThemedText
            style={styles.summaryValue}
            setColor={theme.primaryDark ?? theme.primary ?? theme.text}
          >
            {summary.rejectedCount}
          </ThemedText>
        </View>
      </View>

      <View style={styles.breakdownRow}>
        {[
          ["Accuracy", summary.accuracyRejections],
          ["Too short", summary.shortDistanceRejections],
          ["Too fast", summary.tooFastRejections],
          ["Bad time", summary.invalidTimeRejections],
        ].map(([label, value]) => (
          <View
            key={label}
            style={[
              styles.breakdownBadge,
              {
                backgroundColor: theme.uiBackground ?? theme.background,
                borderColor: theme.cardBorder ?? theme.iconColor ?? theme.text,
              },
            ]}
          >
            <ThemedText style={styles.breakdownText}>
              {label}: {value}
            </ThemedText>
          </View>
        ))}
      </View>

      {rows.length === 0 ? (
        <View style={styles.emptyState}>
          <ThemedTitle type="h3" style={styles.emptyTitle}>
            No GPS callbacks yet
          </ThemedTitle>
          <ThemedText
            style={styles.emptyText}
            setColor={theme.quietText ?? theme.iconColor ?? theme.text}
          >
            {hasWorkoutStarted
              ? "The workout has started, but no location callbacks have been written yet."
              : "Start the run to begin logging raw GPS callbacks here."}
          </ThemedText>
        </View>
      ) : (
        <ScrollView
          style={styles.list}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        >
          {rows.map((row) => {
            const isAccepted = row.accepted;
            const statusLabel = isAccepted
              ? "Accepted"
              : REJECTION_LABELS[row.rejection_reason] ?? "Rejected";

            return (
              <View
                key={row.id}
                style={[
                  styles.logRow,
                  {
                    backgroundColor: theme.uiBackground ?? theme.background,
                    borderColor:
                      isAccepted
                        ? theme.secondary ?? theme.text
                        : theme.cardBorder ?? theme.iconColor ?? theme.text,
                  },
                ]}
              >
                <View style={styles.logRowTop}>
                  <View style={styles.logRowCopy}>
                    <ThemedText style={styles.logTime}>
                      {formatClock(row.timestamp)}
                    </ThemedText>
                    <ThemedText
                      style={styles.logMeta}
                      setColor={theme.quietText ?? theme.iconColor ?? theme.text}
                    >
                      Accuracy {formatAccuracy(row.accuracy)}
                    </ThemedText>
                  </View>

                  <View
                    style={[
                      styles.statusBadge,
                      {
                        backgroundColor: isAccepted
                          ? theme.secondaryLight ?? "rgba(96, 218, 172, 0.14)"
                          : theme.primaryLight ?? "rgba(247, 116, 46, 0.12)",
                      },
                    ]}
                  >
                    <ThemedText
                      style={styles.statusText}
                      setColor={
                        isAccepted
                          ? theme.secondaryDark ?? theme.secondary ?? theme.text
                          : theme.primaryDark ?? theme.primary ?? theme.text
                      }
                    >
                      {statusLabel}
                    </ThemedText>
                  </View>
                </View>

                <View style={styles.metricRow}>
                  <View
                    style={[
                      styles.metricBadge,
                      {
                        borderColor: theme.cardBorder ?? theme.iconColor ?? theme.text,
                      },
                    ]}
                  >
                    <ThemedText style={styles.metricText}>
                      Dist {formatMeters(row.distance_meters)}
                    </ThemedText>
                  </View>

                  <View
                    style={[
                      styles.metricBadge,
                      {
                        borderColor: theme.cardBorder ?? theme.iconColor ?? theme.text,
                      },
                    ]}
                  >
                    <ThemedText style={styles.metricText}>
                      Gap {formatSeconds(row.time_diff_seconds)}
                    </ThemedText>
                  </View>

                  <View
                    style={[
                      styles.metricBadge,
                      {
                        borderColor: theme.cardBorder ?? theme.iconColor ?? theme.text,
                      },
                    ]}
                  >
                    <ThemedText style={styles.metricText}>
                      Speed {formatSpeed(row.speed_meters_per_second)}
                    </ThemedText>
                  </View>
                </View>

                <ThemedText
                  style={styles.coordinateText}
                  setColor={theme.quietText ?? theme.iconColor ?? theme.text}
                >
                  Lat {formatCoordinate(row.latitude)} | Lon{" "}
                  {formatCoordinate(row.longitude)}
                </ThemedText>
              </View>
            );
          })}
        </ScrollView>
      )}

      <View style={styles.buttonRow}>
        <ThemedButton title="Close" variant="secondary" onPress={onClose} />
      </View>
    </ThemedModal>
  );
}
