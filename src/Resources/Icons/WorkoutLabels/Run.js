import * as React from "react"
import Svg, { Path } from "react-native-svg"
import {useColorScheme} from "react-native"
import { Colors } from "../../GlobalStyling/colors"

function Run({width, height, backgroundColor, primaryColor}) {


  const colorScheme = useColorScheme()
  const theme = Colors[colorScheme] ?? Colors.light

  return (
    <Svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width={width}
      height={height}
      color="currentColor"
      fill="none"
      stroke={primaryColor ? primaryColor : theme.primary}
      strokeWidth={1.5}
    >
      <Path d="M17 4.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 21l-.664-2.615a4.905 4.905 0 00-1.315-2.288L11.5 14.6M6 11.153c1-1.97 2.538-3.11 6-3.152m0 0c.219-.002.544-.003.87-.003.505 0 .757 0 .958.094.201.094.408.34.82.833.118.142.24.268.352.352m-3-1.276L10.73 9.96c-.697 1.076-1.046 1.614-1.06 2.18a2 2 0 00.123.738c.195.531.7.928 1.707 1.722M15 9.277c1.155.866 2.963 1.215 5-1.078m-5 1.078L11.5 14.6M4 17.73l.678.162C6.407 18.302 8.203 17.516 9 16" />
    </Svg>
  )
}

export default Run
