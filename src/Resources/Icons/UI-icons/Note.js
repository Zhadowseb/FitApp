import * as React from "react"
import Svg, { Path } from "react-native-svg"
import {useColorScheme} from "react-native"
import { Colors } from "../../GlobalStyling/colors"

function Note({width, height, color, thickness}) {

  const colorScheme = useColorScheme()
  const theme = Colors[colorScheme] ?? Colors.light

  return (
    <Svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width={width}
      height={height}
      color={color ? color : theme.iconColor}
      fill="none"
      stroke={color ? color : theme.iconColor}
      strokeWidth={thickness ? thickness : 1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <Path d="M15.5 2v3m-9-3v3M11 2v3M19 12v-1.5c0-3.3 0-4.95-1.025-5.975C16.95 3.5 15.3 3.5 12 3.5h-2c-3.3 0-4.95 0-5.975 1.025C3 5.55 3 7.2 3 10.5V15c0 3.3 0 4.95 1.025 5.975C5.05 22 6.7 22 10 22h1M7 15h4m-4-4h8M15.737 21.653L14 22l.347-1.737c.07-.352.244-.676.499-.93l4.065-4.066a.911.911 0 011.288 0l.534.534a.911.911 0 010 1.288l-4.065 4.065a1.823 1.823 0 01-.931.499z" />
    </Svg>
  )
}

export default Note
