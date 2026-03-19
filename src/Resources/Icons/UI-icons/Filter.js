import * as React from "react"
import Svg, { Path } from "react-native-svg"
import {useColorScheme} from "react-native"
import { Colors } from "../../GlobalStyling/colors"

function Filter({width, height, color}) {

  const colorScheme = useColorScheme()
  const theme = Colors[colorScheme] ?? Colors.light

  return (
    <Svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width={width}
      height={height}
      color={color ? color : theme.primary}
      fill="none"
      stroke={color ? color : theme.primary}
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <Path d="M8.857 12.506C6.37 10.646 4.596 8.6 3.627 7.45c-.3-.356-.398-.617-.457-1.076-.202-1.572-.303-2.358.158-2.866C3.788 3 4.604 3 6.234 3h11.532c1.63 0 2.445 0 2.906.507.461.508.36 1.294.158 2.866-.06.459-.158.72-.457 1.076-.97 1.152-2.747 3.202-5.24 5.065a1.05 1.05 0 00-.402.747c-.247 2.731-.475 4.227-.617 4.983-.229 1.222-1.96 1.957-2.888 2.612-.552.39-1.222-.074-1.293-.678a196.402 196.402 0 01-.674-6.917 1.049 1.049 0 00-.402-.755z" />
    </Svg>
  )
}

export default Filter
