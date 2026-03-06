import {Text, StyleSheet, useColorScheme} from "react-native"
import { Colors } from "../GlobalStyling/colors"

const ThemedText = ( {size, textcolor, style, ...props} ) => {

    const colorScheme = useColorScheme()
    const theme = Colors[colorScheme] ?? Colors.light

    return (
        <Text 
            style={
                [{
                    color: textcolor ? textcolor : theme.text,
                    fontSize: size,
                },
                    style]
            }
            {...props}
        />
    )

}

export default ThemedText
