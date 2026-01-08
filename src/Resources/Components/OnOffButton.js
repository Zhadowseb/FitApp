import * as React from "react";
import Svg, { Path, Circle, Line } from "react-native-svg";
const SVGComponent = (props) => (
  <Svg
    id="Capa_1"
    xmlns="http://www.w3.org/2000/svg"
    xmlnsXlink="http://www.w3.org/1999/xlink"
    x="0px"
    y="0px"
    viewBox="0 0 58 58"
    style={{
      enableBackground: "new 0 0 58 58",
    }}
    xmlSpace="preserve"
    {...props}
  >
    <Path
      style={{
        fill: "#38454F",
      }}
      d="M41,46H17C7.65,46,0,38.35,0,29v0c0-9.35,7.65-17,17-17h24c9.35,0,17,7.65,17,17v0 C58,38.35,50.35,46,41,46z"
    />
    <Circle
      style={{
        fill: "#E0E1E2",
      }}
      cx={17}
      cy={29}
      r={12}
    />
    <Line
      style={{
        fill: "none",
        stroke: "#61B872",
        strokeWidth: 2,
        strokeLinecap: "round",
        strokeMiterlimit: 10,
      }}
      x1={36}
      y1={29}
      x2={40}
      y2={33}
    />
    <Line
      style={{
        fill: "none",
        stroke: "#61B872",
        strokeWidth: 2,
        strokeLinecap: "round",
        strokeMiterlimit: 10,
      }}
      x1={40}
      y1={33}
      x2={48}
      y2={25}
    />
  </Svg>
);
export default SVGComponent;
