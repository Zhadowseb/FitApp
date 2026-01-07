import * as React from "react"
import Svg, { Path } from "react-native-svg"

function LegMuscle({width, height, backgroundColor}) {
  return (
    <Svg
      width={width}
      height={height}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <Path fill={backgroundColor} d="M0 0H24V24H0z" />
      <Path
        d="M5.002 2c2.691.314 8.897 1.896 11.64 5.746.337.47.69.804 1.27.95.724.18 1.324.666 1.542 1.4.232.798.66 1.64.524 2.494-.052.327-.212.628-.532 1.23L15.099 22"
        stroke="#141B34"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M4.002 12c1 1.726 4.164 2.596 8 1.726a10.08 10.08 0 00-2.685 2.225c-.559.646-.797 1.544-.836 2.452-.052 1.212-.232 2.53-.854 3.597M5.002 7s1.959.29 3.5 1.5c1 .786 2.916 1.31 3.5 1.5"
        stroke="#141B34"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  )
}

export default LegMuscle
