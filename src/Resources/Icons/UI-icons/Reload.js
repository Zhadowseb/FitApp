import * as React from "react"
import Svg, { Path } from "react-native-svg"
import {useColorScheme} from "react-native"
import { Colors } from "../../GlobalStyling/colors"

function Reload({width, height, color}) {

  const colorScheme = useColorScheme()
  const theme = Colors[colorScheme] ?? Colors.light

  return (
    <Svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width={width || 24}
      height={height || 24}
      color={color ? color : theme.primary}
      fill="none"
      stroke={color ? color : theme.primary}
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <Path d="M15.167 1l.598 1.118c.404.755.606 1.133.472 1.295-.133.162-.573.031-1.454-.23A9.766 9.766 0 0012 2.78C6.753 2.78 2.5 6.908 2.5 12a8.97 8.97 0 001.27 4.61M8.834 23l-.598-1.118c-.404-.756-.606-1.134-.472-1.295.133-.162.573-.032 1.454.23.88.261 1.815.402 2.783.402 5.247 0 9.5-4.128 9.5-9.22a8.97 8.97 0 00-1.27-4.609" />
    </Svg>
  )
}

export default Reload
