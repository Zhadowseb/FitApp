import * as React from "react"
import Svg, { Path } from "react-native-svg"

function ArrowDown({width, height}) {
  return (
    <Svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width={width}
      height={height}
      color="currentColor"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <Path d="M15.544 12.5H15v-6c0-.932 0-1.398-.152-1.765a2 2 0 00-1.083-1.083C13.398 3.5 12.932 3.5 12 3.5c-.932 0-1.398 0-1.765.152a2 2 0 00-1.083 1.083C9 5.102 9 5.568 9 6.5v6h-.544c-2.083 0-3.124 0-3.398.6s.44 1.318 1.867 2.754l3.544 3.563c.718.722 1.077 1.083 1.531 1.083.454 0 .813-.361 1.531-1.083l3.544-3.564c1.428-1.435 2.141-2.152 1.867-2.753-.274-.6-1.315-.6-3.398-.6z" />
    </Svg>
  )
}

export default ArrowDown
