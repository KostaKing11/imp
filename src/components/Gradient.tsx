import React, { useRef } from "react";
import { StyleSheet, View, ViewStyle } from "react-native";
import Svg, { Defs, LinearGradient, Rect, Stop } from "react-native-svg";

let nextId = 0;

type Props = {
  // Top-left colour to bottom-right colour.
  from: string;
  to: string;
  // 0 = left-to-right, 1 = top-to-bottom, anything between tilts it.
  angle?: number;
  style?: ViewStyle;
};

// Fills whatever it is dropped into with a linear gradient. Flat colour
// reads as a form control; a gradient reads as something you press.
export default function Gradient({ from, to, angle = 0.6, style }: Props) {
  // Every instance needs its own id — two gradients sharing one would
  // both take whichever definition rendered last.
  const id = useRef(`g${nextId++}`).current;

  return (
    <View style={[StyleSheet.absoluteFill, style]} pointerEvents="none">
      <Svg width="100%" height="100%">
        <Defs>
          <LinearGradient id={id} x1="0" y1="0" x2={String(1 - angle)} y2={String(angle)}>
            <Stop offset="0" stopColor={from} />
            <Stop offset="1" stopColor={to} />
          </LinearGradient>
        </Defs>
        <Rect x="0" y="0" width="100%" height="100%" fill={`url(#${id})`} />
      </Svg>
    </View>
  );
}
