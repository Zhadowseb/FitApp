import * as React from "react"
import Svg, { Path } from "react-native-svg"

function ThreeDots({width, height}) {
  return (
    <Svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width={width}
      height={height}
      color="currentColor"
      fill="none"
      stroke="#141B34"
      strokeWidth={1.5}
    >
      <Path d="M15.5 6.5a3.5 3.5 0 11-7 0 3.5 3.5 0 017 0zM22 17.5a3.5 3.5 0 11-7 0 3.5 3.5 0 017 0zM9 17.5a3.5 3.5 0 11-7 0 3.5 3.5 0 017 0z" />
    </Svg>
  )
}

export default ThreeDots
