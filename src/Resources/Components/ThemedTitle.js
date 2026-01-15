import {Text, StyleSheet, useColorScheme} from "react-native"
import { Colors } from "../GlobalStyling/colors"
import { Typography } from "../GlobalStyling/typography"

const ThemedTitle = ( {type, style, ...props} ) => {

    const colorScheme = useColorScheme()
    const theme = Colors[colorScheme] ?? Colors.light

    const textStyle = Typography[type] ?? Typography.h1

    return (
        <Text 
            style={
                [textStyle, {color: theme.title},
                    style]
            }

            {...props}
        />
    )

}

export default ThemedTitle