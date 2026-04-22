import React, { useState } from "react";
import { Pressable, ScrollView, View, useColorScheme } from "react-native";

import styles from "./AddProgramStyle";
import Calender from "../../../../Resources/Icons/UI-icons/Calender";
import { Colors } from "../../../../Resources/GlobalStyling/colors";
import { formatDate } from "../../../../Utils/dateUtils";
import {
  ThemedButton,
  ThemedModal,
  ThemedText,
  ThemedTextInput,
  ThemedTitle,
} from "../../../../Resources/ThemedComponents";

const MS_PER_DAY = 24 * 60 * 60 * 1000;

const getWeekStart = (date) => {
  const weekStart = new Date(date);
  weekStart.setHours(0, 0, 0, 0);

  const day = weekStart.getDay();
  const daysFromMonday = day === 0 ? 6 : day - 1;
  weekStart.setDate(weekStart.getDate() - daysFromMonday);

  return weekStart;
};

const addWeeks = (date, weekOffset) => {
  const nextDate = new Date(date);
  nextDate.setDate(nextDate.getDate() + weekOffset * 7);
  return getWeekStart(nextDate);
};

const getWeekEnd = (weekStart) => {
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 6);
  return weekEnd;
};

const getIsoWeekStart = (year, weekNumber) => {
  const firstIsoWeekStart = getWeekStart(new Date(year, 0, 4));
  return addWeeks(firstIsoWeekStart, weekNumber - 1);
};

const getIsoWeekInfo = (date) => {
  const utcDate = new Date(Date.UTC(
    date.getFullYear(),
    date.getMonth(),
    date.getDate()
  ));
  const utcDay = utcDate.getUTCDay() || 7;
  utcDate.setUTCDate(utcDate.getUTCDate() + 4 - utcDay);

  const yearStart = new Date(Date.UTC(utcDate.getUTCFullYear(), 0, 1));
  const weekNumber = Math.ceil(((utcDate - yearStart) / MS_PER_DAY + 1) / 7);

  return {
    weekNumber,
    weekYear: utcDate.getUTCFullYear(),
  };
};

const getWeeksInIsoYear = (year) =>
  getIsoWeekInfo(new Date(year, 11, 28)).weekNumber;

const buildWeekOptions = (year) => {
  const weeksInYear = getWeeksInIsoYear(year);

  return Array.from({ length: weeksInYear }, (_, index) => {
    const weekNumber = index + 1;
    const weekStart = getIsoWeekStart(year, weekNumber);

    return {
      weekNumber,
      weekStart,
      weekEnd: getWeekEnd(weekStart),
    };
  });
};

export default function AddProgram({ visible, onClose, onSubmit }) {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme] ?? Colors.light;
    
  const [program_name, set_Program_name] = useState("");
  const [start_date, set_Start_date] = useState(() => getWeekStart(new Date()));
  const [weekPicker_visible, set_WeekPicker_visible] = useState(false);
  const [pickerYear, set_PickerYear] = useState(
    () => getIsoWeekInfo(getWeekStart(new Date())).weekYear
  );

  const titleColor = theme.title ?? theme.text;
  const quietText = theme.quietText ?? theme.iconColor ?? theme.text;
  const cardBorder = theme.cardBorder ?? theme.iconColor ?? theme.text;
  const innerSurface = theme.uiBackground ?? theme.cardBackground ?? theme.background;
  const accentColor = theme.primary ?? "#f7742e";
  const weekEnd = getWeekEnd(start_date);
  const { weekNumber, weekYear } = getIsoWeekInfo(start_date);
  const weekOptions = buildWeekOptions(pickerYear);

  const handleSubmit = () => {
    onSubmit({ program_name, start_date, status: "NOT_STARTED" });
    set_Program_name("");
    set_Start_date(getWeekStart(new Date()));
  };

  const openWeekPicker = () => {
    set_PickerYear(weekYear);
    set_WeekPicker_visible(true);
  };

  return (
    <>
      <ThemedModal
        visible={visible}
        onClose={onClose}
        style={styles.modal}
        contentStyle={styles.content}
      >
        <View style={styles.hero}>
          <ThemedText style={styles.eyebrow} setColor={accentColor}>
            New program
          </ThemedText>

          <ThemedTitle type="h3" style={styles.title}>
            Create a training plan
          </ThemedTitle>

          <ThemedText style={styles.description} setColor={quietText}>
            Choose a name and start week. Programs always begin on the Monday of
            the selected week.
          </ThemedText>
        </View>

        <View style={styles.fieldGroup}>
          <ThemedText style={styles.label} setColor={quietText}>
            Program name
          </ThemedText>

          <ThemedTextInput
            placeholder="Example: Spring strength block"
            value={program_name}
            onChangeText={set_Program_name}
            inputStyle={styles.input}
          />
        </View>

        <View style={styles.fieldGroup}>
          <ThemedText style={styles.label} setColor={quietText}>
            Start week
          </ThemedText>

          <Pressable
            onPress={openWeekPicker}
            style={[
              styles.weekCard,
              {
                backgroundColor: innerSurface,
                borderColor: cardBorder,
              },
            ]}
          >
            <View style={styles.dateContent}>
              <ThemedText style={styles.dateLabel} setColor={quietText}>
                Selected week
              </ThemedText>

              <ThemedText style={styles.dateValue} setColor={titleColor}>
                Week {weekNumber}, {weekYear}
              </ThemedText>

              <ThemedText style={styles.weekRange} setColor={quietText}>
                {formatDate(start_date)} - {formatDate(weekEnd)}
              </ThemedText>
            </View>

            <View
              style={[
                styles.calendarBadge,
                { backgroundColor: theme.primaryLight ?? accentColor },
              ]}
            >
              <Calender width={22} height={22} />
            </View>
          </Pressable>
        </View>

        <View style={styles.row}>
          <Pressable
            onPress={onClose}
            style={[
              styles.actionButton,
              styles.cancelButton,
              {
                backgroundColor: innerSurface,
                borderColor: cardBorder,
              },
            ]}
          >
            <ThemedText style={styles.cancelButtonText} setColor={titleColor}>
              Cancel
            </ThemedText>
          </Pressable>

          <ThemedButton
            title="Create"
            variant="primary"
            onPress={handleSubmit}
            style={[styles.actionButton, { backgroundColor: accentColor }]}
          />
        </View>
      </ThemedModal>

      <ThemedModal
        visible={weekPicker_visible}
        onClose={() => set_WeekPicker_visible(false)}
        title="Choose start week"
        style={styles.weekPickerModal}
        contentStyle={styles.weekPickerContent}
      >
        <View style={styles.weekPickerHeader}>
          <Pressable
            onPress={() => set_PickerYear((currentYear) => currentYear - 1)}
            style={[
              styles.yearButton,
              {
                backgroundColor: innerSurface,
                borderColor: cardBorder,
              },
            ]}
          >
            <ThemedText style={styles.yearButtonText} setColor={accentColor}>
              Previous year
            </ThemedText>
          </Pressable>

          <ThemedTitle type="h3" style={styles.yearTitle}>
            {pickerYear}
          </ThemedTitle>

          <Pressable
            onPress={() => set_PickerYear((currentYear) => currentYear + 1)}
            style={[
              styles.yearButton,
              {
                backgroundColor: innerSurface,
                borderColor: cardBorder,
              },
            ]}
          >
            <ThemedText style={styles.yearButtonText} setColor={accentColor}>
              Next year
            </ThemedText>
          </Pressable>
        </View>

        <ScrollView style={styles.weekOptionList}>
          {weekOptions.map((option) => {
            const selected =
              option.weekNumber === weekNumber && pickerYear === weekYear;

            return (
              <Pressable
                key={`${pickerYear}-${option.weekNumber}`}
                onPress={() => {
                  set_Start_date(option.weekStart);
                  set_WeekPicker_visible(false);
                }}
                style={[
                  styles.weekOption,
                  {
                    backgroundColor: selected
                      ? theme.primaryLight ?? innerSurface
                      : innerSurface,
                    borderColor: selected ? accentColor : cardBorder,
                  },
                ]}
              >
                <View style={styles.weekOptionTextContent}>
                  <ThemedText
                    style={styles.weekOptionTitle}
                    setColor={selected ? accentColor : titleColor}
                  >
                    Week {option.weekNumber}
                  </ThemedText>

                  <ThemedText style={styles.weekOptionRange} setColor={quietText}>
                    {formatDate(option.weekStart)} - {formatDate(option.weekEnd)}
                  </ThemedText>
                </View>

                <View
                  style={[
                    styles.statusDot,
                    {
                      borderColor: selected ? accentColor : cardBorder,
                      backgroundColor: selected ? accentColor : "transparent",
                    },
                  ]}
                />
              </Pressable>
            );
          })}
        </ScrollView>

        <ThemedButton
          title="Use current week"
          variant="primary"
          onPress={() => {
            set_Start_date(getWeekStart(new Date()));
            set_WeekPicker_visible(false);
          }}
          style={[styles.fullWidthButton, { backgroundColor: accentColor }]}
        />
      </ThemedModal>
    </>
  );
}
