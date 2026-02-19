import React, { useState, useEffect } from "react";
import { Modal, View, Text, TextInput, Button, Touchable, TouchableOpacity, ScrollView } from "react-native";
import { useColorScheme, StyleSheet } from "react-native";
import { Colors } from "../../../../../../../../Resources/GlobalStyling/colors";

import { ThemedTextInput, 
  ThemedCard, 
  ThemedView, 
  ThemedText, 
  ThemedButton, 
  ThemedModal,
  ThemedSegmentedToggle } 
  from "../../../../../../../../Resources/ThemedComponents";

export default function PanelSettingsModal({ visible, onClose, currentColumns  }) {
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme] ?? Colors.light;

  const handleClose = () => {
    onClose(columns);
  };

    useEffect(() => {
        if (visible) {
            setColumns(currentColumns);
        }
    }, [visible, currentColumns]);

    const [columns, setColumns] = useState(currentColumns);

    const columnConfig = [
        { key: "rest", label: "Rest" },
        { key: "set", label: "Set" },
        { key: "x", label: "x" },
        { key: "reps", label: "Reps" },
        { key: "rpe", label: "RPE" },
        { key: "weight", label: "Weight" },
        { key: "done", label: "Done" },
    ];

    const toggleColumn = (key) => {
        setColumns(prev => ({
            ...prev,
            [key]: !prev[key],
        }));
    };

  return (
    <ThemedModal
      style={{maxHeight: 450}}
      visible={visible}
      onClose={handleClose}
      title="Enable/Disable panels" >

        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {columnConfig.map(col => {
                const isActive = columns[col.key];

                return (
                <TouchableOpacity
                    key={col.key}
                    onPress={() => toggleColumn(col.key)}>

                    <ThemedCard
                        style={[styles.themedCardChanges,
                            {backgroundColor: isActive ? theme.secondary : theme.cardBackground}, 
                            {borderWidth: 1},
                            {borderColor: isActive ? theme.cardBackground : theme.secondary} ]}>
                        
                        <ThemedText 
                            textcolor={isActive ? theme.background : theme.text}
                            size={10}>
                            {col.label}
                        </ThemedText>

                    </ThemedCard>
                </TouchableOpacity>
                );
            })}
        </ScrollView>

        <View style={{alignItems: "center"}}>
            <ThemedButton
                title={"Close"}
                variant="danger"
                style={{width: 100}}
                onPress={handleClose}/>
        </View>




    </ThemedModal>
  );
}

const styles = StyleSheet.create({
    themedCardChanges: {
        justifyContent: "center",
        alignItems: "center",
        width: 42,
        marginRight: 0,
        marginLeft: 0,
        borderRadius: 6,
        padding: 2,
        paddingTop: 10,
        paddingBottom: 10,
    }
})
