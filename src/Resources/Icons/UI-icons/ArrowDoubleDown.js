import * as React from "react"
import Svg, { Path } from "react-native-svg"
import {useColorScheme} from "react-native"
import { Colors } from "../../GlobalStyling/colors"

function ArrowDoubleDown({width, height, color}) {

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
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <Path d="M18 12.5s-4.42 6-6 6c-1.582 0-6-6-6-6M18 5.5s-4.42 6-6 6c-1.582 0-6-6-6-6" />
    </Svg>
  )
}

export default ArrowDoubleDown
