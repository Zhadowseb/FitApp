import React, { useState } from "react";
import { Modal, View } from "react-native";

import { ThemedModal } from "../../../../Resources/Components";
import { WORKOUT_ICONS } from "../../../../Resources/Icons/WorkoutLabels/index";

export default function AddProgram({ visible, onClose, onSubmit }) {

  const [selected_label, set_selected_label] = useState("");


  const handleSubmit = () => {
    onSubmit(0);
  };

  return (
    <ThemedModal
      visible={visible}
      transparent
      title="Create new workout:" >

        <ScrollView
            horizontal>
            {WORKOUT_ICONS.map(({ id, Icon }) => (
                <TouchableOpacity
                    key={id}
                    style={styles.icon}
                    onPress={() => {
                        set_selected_label(id);
                        //Set bagground to secondary color...
                    }}>

                    <ThemedText> {id} </ThemedText>

                    <Icon 
                        width={50}
                        height={50} />
                </TouchableOpacity>
            ))}
        </ScrollView>

        

    </ThemedModal>
  );
}
