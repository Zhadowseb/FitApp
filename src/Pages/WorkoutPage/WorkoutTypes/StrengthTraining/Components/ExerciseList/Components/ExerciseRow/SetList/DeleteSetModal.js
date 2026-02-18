import { View } from "react-native";

import { 
    ThemedButton, 
    ThemedModal } 
    from "../../../../../../../../../Resources/ThemedComponents";

export default function PanelSettingsModal({ visible, onClose, onSubmit }) {

  const handleClose = () => {
    onClose();
  };

  const handleSubmit = () => {
    onSubmit();    
  }

  return (
    <ThemedModal
      style={{maxHeight: 450}}
      visible={visible}
      onClose={handleClose}
      title="Are you sure you want to delete the set?" >


        <View style={{alignItems: "center", flexDirection: "row", justifyContent: "center"}}>
            <View style={{paddingRight: 10}}>
                <ThemedButton
                    title={"Delete"}
                    variant="danger"
                    style={{width: 100}}
                    onPress={handleSubmit}/>
            </View>

            <View>
                <ThemedButton
                    title={"Close"}
                    variant="primary"
                    style={{width: 100}}
                    onPress={handleClose}/>
            </View>

        </View>

    </ThemedModal>
  );
}

