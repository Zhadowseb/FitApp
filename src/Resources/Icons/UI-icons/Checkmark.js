import * as React from "react"
import Svg, { Path } from "react-native-svg"

function SvgComponent({width, height, color, thickness}) {
  return (
    <Svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width={width}
      height={height}
      color="currentColor"
      fill="none"
      stroke={color}
      strokeWidth={thickness}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <Path d="M5 14.5s1.5 0 3.5 3.5c0 0 5.559-9.167 10.5-11" />
    </Svg>
  )
}

export default SvgComponent
