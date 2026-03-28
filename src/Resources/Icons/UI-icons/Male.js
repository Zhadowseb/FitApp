import * as React from "react"
import Svg, { Path } from "react-native-svg"
import {useColorScheme} from "react-native"
import { Colors } from "../../GlobalStyling/colors"

function Male({width, height, color}) {

  const colorScheme = useColorScheme()
  const theme = Colors[colorScheme] ?? Colors.light
  const iconColor = color ? color : theme.primary

  return (
    <Svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width={width}
      height={height}
      color={iconColor}
      fill="none"
      stroke={iconColor}
      strokeWidth={1.5}
      strokeLinejoin="round"
    >
      <Path d="M14.5 16.5l3.716 1.118a4.072 4.072 0 012.76 2.892c.136.536-.327.99-.882.99H3.906c-.555 0-1.018-.454-.882-.99a4.072 4.072 0 012.76-2.892L9.5 16.5v-1.938c-1.78-1.393-3-3.062-3-6.645 0-3.59 1.955-5.417 4.992-5.417 2.151 0 3.046 1 3.046 1 2.539 0 2.962 2.097 2.962 4.417 0 3.583-1.22 5.252-3 6.645V16.5z" />
    </Svg>
  )
}

export default Male
