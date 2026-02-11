import React, { useState } from "react";
import { Modal, View, TouchableOpacity,Text, Button, ScrollView } from "react-native";
import { WORKOUT_ICONS } from "../../Icons/WorkoutLabels/index";

import styles from "./WorkoutLabelStyle";


import {ThemedButton, ThemedModal, ThemedText} 
  from "../../ThemedComponents";

export default function AddProgram({ visible, onClose, onSubmit }) {
    
    const handleSubmit = (id) => {
        onSubmit({ id });
        onClose();
    };

    return (
        <ThemedModal
            visible={visible}
            title="Give your workout a label!">

            <ScrollView
                horizontal>
                {WORKOUT_ICONS.map(({ id, Icon }) => (
                    <TouchableOpacity
                        key={id}
                        style={styles.icon}
                        onPress={() => handleSubmit(id)}>

                        <ThemedText> {id} </ThemedText>

                        <Icon 
                            width={50}
                            height={50} />
                    </TouchableOpacity>
                ))}
            </ScrollView>

            <ThemedButton 
                title="Cancel" 
                variant="danger"
                width={100} 
                onPress={onClose} />

        </ThemedModal>
    );
}
