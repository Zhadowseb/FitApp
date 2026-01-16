import * as React from "react"
import Svg, { Path } from "react-native-svg"
import {useColorScheme} from "react-native"
import { Colors } from "../../GlobalStyling/colors"

function SvgComponent({width, height, backgroundColor}) {

  const colorScheme = useColorScheme()
  const theme = Colors[colorScheme] ?? Colors.light
  return (
    <Svg
      width={width}
      height={height}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <Path fill={theme.cardBackground} d="M0 0H24V24H0z" />
      <Path
        d="M4 14.07c1.014 0 2.431-.302 3.32.35l1.762 1.29c.655.48 1.364.322 2.095.208.962-.151 1.823.67 1.823 1.738 0 .292-2.073 1.035-2.372 1.176a1.75 1.75 0 01-1.798-.182l-1.988-1.457"
        stroke={theme.primary}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M13 17l4.091-1.89a1.979 1.979 0 012.089.515l.67.701c.24.25.184.672-.113.844l-7.854 4.561a1.963 1.963 0 01-1.552.187L4 20.027M12.002 12s2.1-2.239 2.1-5-2.1-5-2.1-5-2.1 2.239-2.1 5 2.1 5 2.1 5zm0 0s3.067-.068 5-2.04c1.933-1.973 2-5.103 2-5.103s-1.27.028-2.69.574M12.002 12s-3.067-.068-5-2.04c-1.933-1.973-2-5.103-2-5.103s1.27.028 2.69.574"
        stroke={theme.primary}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  )
}

export default SvgComponent
