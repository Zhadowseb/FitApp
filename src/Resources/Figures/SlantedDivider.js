import * as React from "react"
import Svg, {Polygon, Defs, LinearGradient, Stop} from "react-native-svg"

function SlantedDivider({style}) {
    return (
        <Svg 
            style={style}
            width={150} 
            height="100%"  
            viewBox="0 0 24 100"
            pointerEvents="none" >
            <Defs>
                <LinearGradient id="grad" x1="0" y1="0" x2="1" y2="0">
                    <Stop offset="0%" stopColor="#929292ff" />
                    <Stop offset="100%" stopColor="#ffffffff" />
                </LinearGradient>
            </Defs>

            <Polygon
                points="-40,0 24,0  6,100 -40,100"
                fill="url(#grad)"
            />
        </Svg>
    );
}

export default SlantedDivider;
