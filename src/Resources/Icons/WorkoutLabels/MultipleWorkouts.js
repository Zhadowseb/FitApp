import * as React from "react"
import Svg, { Circle, Path } from "react-native-svg"

function MultipleWorkouts({width, height, backgroundColor}) {
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
      <Circle cx={17} cy={17} r={5} />
      <Path d="M7.5 13H6.4c-2.074 0-3.111 0-3.756-.644C2 11.71 2 10.674 2 8.6V6.4c0-2.074 0-3.111.644-3.756C3.29 2 4.326 2 6.4 2h2.2c2.074 0 3.111 0 3.756.644C13 3.29 13 4.326 13 6.4v1.1" />
      <Path d="M12.035 19a6.043 6.043 0 011.007-12A6.043 6.043 0 0119 12.035" />
    </Svg>
  )
}

export default MultipleWorkouts
