import React, { useState } from "react";
import { Modal, View, TouchableOpacity,Text, Button } from "react-native";
import { WORKOUT_ICONS } from "../../Icons/WorkoutLabels/index";

import styles from "./WorkoutLabelStyle";

export default function AddProgram({ visible, onClose, onSubmit }) {
    
    const handleSubmit = (id) => {
        onSubmit({ id });
        onClose();
    };

    return (
        <Modal
        visible={visible}
        transparent
        animationType="fade">
            

            <View style={styles.overlay}>
                <View style={styles.modalBox}>

                    <Text style={{paddingBottom: 20}}>
                        Give your workout a label!
                    </Text>

                    <View style={{flexDirection: "row"}}>
                        {WORKOUT_ICONS.map(({ id, Icon }) => (
                            <TouchableOpacity
                                key={id}
                                style={styles.icon}
                                onPress={() => handleSubmit(id)}>

                                <Text> {id} </Text>

                                <Icon 
                                    width={50}
                                    height={50}
                                    backgroundColor={"#fff"} />
                            </TouchableOpacity>
                        ))}
                    </View>

                    <View style={styles.button_container}>
                        <Button 
                            title="Cancel" 
                            color="red" 
                            onPress={onClose} />
                    </View>

                </View>
            </View>

        </Modal>
    );
}
