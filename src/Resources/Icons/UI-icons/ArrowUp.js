import * as React from "react"
import Svg, { Path } from "react-native-svg"

function ArrowUp({width, height}) {
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
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <Path d="M15.544 11.5H15v6c0 .932 0 1.398-.152 1.765a2 2 0 01-1.083 1.083c-.367.152-.833.152-1.765.152-.932 0-1.398 0-1.765-.152a2 2 0 01-1.083-1.083C9 18.898 9 18.432 9 17.5v-6h-.544c-2.083 0-3.124 0-3.398-.6s.44-1.318 1.867-2.754l3.544-3.563C11.187 3.86 11.546 3.5 12 3.5c.454 0 .813.36 1.531 1.083l3.544 3.563c1.428 1.436 2.141 2.153 1.867 2.754-.274.6-1.315.6-3.398.6z" />
    </Svg>
  )
}

export default ArrowUp
