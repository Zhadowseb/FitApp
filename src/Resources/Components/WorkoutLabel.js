import React from "react";
import { ScrollView, StyleSheet, TouchableOpacity, View, useColorScheme } from "react-native";
import { SELECTABLE_WORKOUT_ICONS } from "../Icons/WorkoutLabels/index";
import { Colors } from "../GlobalStyling/colors";


import {ThemedButton, ThemedText, ThemedWorkoutModal} 
  from "../ThemedComponents";

export default function AddProgram({ visible, onClose, onSubmit }) {
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme] ?? Colors.light;
    
    const handleSubmit = (id) => {
        onSubmit({ id });
        onClose();
    };

    return (
        <ThemedWorkoutModal
            visible={visible}
            onClose={onClose}
            title="Choose a workout type">

            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.list}>
                {SELECTABLE_WORKOUT_ICONS.map(({ id, Icon }) => (
                    <TouchableOpacity
                        key={id}
                        style={styles.option}
                        onPress={() => handleSubmit(id)}>

                        <View
                            style={[
                              styles.iconBox,
                              {
                                backgroundColor: theme.primary,
                                borderColor: theme.iconColor,
                              },
                            ]}
                        >
                            <Icon
                                width={72}
                                height={72}
                                color={theme.cardBackground}
                                primaryColor={theme.cardBackground}
                                backgroundColor="transparent"
                            />
                        </View>

                        <ThemedText style={styles.label}>{id}</ThemedText>
                    </TouchableOpacity>
                ))}
            </ScrollView>

            <ThemedButton 
                title="Cancel" 
                variant="danger"
                width={100} 
                onPress={onClose} />

        </ThemedWorkoutModal>
    );
}

const styles = StyleSheet.create({
    list: {
        paddingVertical: 4,
        paddingHorizontal: 4,
    },
    option: {
        width: 120,
        alignItems: "center",
    },
    iconBox: {
        width: 90,
        height: 90,
        borderRadius: 10,
        borderWidth: 1,
        padding: 12,
        justifyContent: "center",
        alignItems: "center",
    },
    label: {
        textAlign: "center",
        paddingTop: 8,
    },
});
