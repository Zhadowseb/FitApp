import {Switch, StyleSheet, useColorScheme} from "react-native"
import { Colors } from "../GlobalStyling/colors"

const ThemedSwitch = ( {style, ...props} ) => {

    const colorScheme = useColorScheme()
    const theme = Colors[colorScheme] ?? Colors.light

    return (
        <Switch 
            thumbColor={props.value ? theme.secondary : theme.primary}
            trackColor={{
                true: theme.secondaryLight, 
                false: theme.primaryLight
            }}
            style={
                [{
                    
                },
                    style]
            }
            {...props}
        />
    )

}

export default ThemedSwitch

/*


              <Switch
                value={editMode}
                onValueChange={set_editMode} 
                thumbColor = "#e20e0e" 
                trackColor= {{true: "red", false: "blue"}}/>

*/