import * as React from "react"
import Svg, { Circle, Path } from "react-native-svg"
import {useColorScheme} from "react-native"
import { Colors } from "../../GlobalStyling/colors"

function Amrap({width, height, color}) {

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
      stroke="#141B34"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <Circle cx={15.002} cy={16} r={6} />
      <Path d="M15.002 13.5V16l1.5 1M13.498 2h-5a1.5 1.5 0 100 3h5a1.5 1.5 0 100-3z" />
      <Path d="M14.998 3.5c1.554.047 2.48.22 3.121.861.572.572.772 1.371.842 2.639M6.998 3.5c-1.553.047-2.48.22-3.121.861-.879.879-.879 2.293-.879 5.122v6.516c0 2.829 0 4.243.879 5.122.641.641 1.568.814 3.121.861" />
    </Svg>
  )
}

export default Amrap
