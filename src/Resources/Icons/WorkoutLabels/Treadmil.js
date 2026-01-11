import * as React from "react"
import Svg, { Path } from "react-native-svg"

function Treadmil({width, height, backgroundColor}) {
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
        d="M20.191 21H2.931c-.578 0-.895-.479-.928-.985-.032-.493.204-1.012.73-1.14l15.215-3.769C22.205 14.068 23.364 21 20.191 21z"
        stroke="#141B34"
        strokeWidth={1.5}
        strokeLinejoin="round"
      />
      <Path
        d="M19 18h.009M22 2c-.3.902-.483 2.149-1.167 2.833-.334.334-.8.49-1.73.8L15 7"
        stroke="#141B34"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M15 16l5-10.5"
        stroke="#141B34"
        strokeWidth={1.5}
        strokeLinejoin="round"
      />
      <Path
        d="M6 21l-1 1M18 21v1"
        stroke="#141B34"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  )
}

export default Treadmil
