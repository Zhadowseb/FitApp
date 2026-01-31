import {Text, StyleSheet, useColorScheme} from "react-native"
import { Colors } from "../GlobalStyling/colors"

const ThemedText = ( {size, style, ...props} ) => {

    const colorScheme = useColorScheme()
    const theme = Colors[colorScheme] ?? Colors.light

    return (
        <Text 
            style={
                [{
                    color: theme.text,
                    fontSize: size,
                },
                    style]
            }
            {...props}
        />
    )

}

export default ThemedText
