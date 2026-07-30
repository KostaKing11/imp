import React, { useRef } from "react";
import { StyleSheet, View, ViewStyle } from "react-native";
import Svg, { Defs, LinearGradient, Rect, Stop } from "react-native-svg";

let nextId = 0;

type Props = {
  // Top-left colour to bottom-right colour. Either may be an rgba()
  // string — see splitAlpha.
  from: string;
  to: string;
  // 0 = left-to-right, 1 = top-to-bottom, anything between tilts it.
  angle?: number;
  style?: ViewStyle;
};

// SVG wants a colour and its opacity as two separate attributes. Android's
// react-native-svg silently drops the alpha channel of an "rgba(…)" string
// passed as stopColor, so a 6%-opacity wash renders as a solid slab — the
// bug that turned every scrim on this screen opaque in the release build
// while the browser showed it correctly. Splitting the two here means no
// caller can reintroduce it.
function splitAlpha(color: string): { color: string; opacity: number } {
  const match = color.match(/^rgba?\(\s*([\d.]+)[\s,]+([\d.]+)[\s,]+([\d.]+)(?:[\s,/]+([\d.]+))?\s*\)$/i);
  if (!match) return { color, opacity: 1 };
  const [r, g, b] = [match[1], match[2], match[3]].map((n) => Math.round(parseFloat(n)));
  const hex = (n: number) => Math.max(0, Math.min(255, n)).toString(16).padStart(2, "0");
  return {
    color: `#${hex(r)}${hex(g)}${hex(b)}`,
    opacity: match[4] === undefined ? 1 : parseFloat(match[4]),
  };
}

// Fills whatever it is dropped into with a linear gradient. Flat colour
// reads as a form control; a gradient reads as something you press.
export default function Gradient({ from, to, angle = 0.6, style }: Props) {
  // Every instance needs its own id — two gradients sharing one would
  // both take whichever definition rendered last.
  const id = useRef(`g${nextId++}`).current;
  const a = splitAlpha(from);
  const b = splitAlpha(to);

  return (
    <View style={[StyleSheet.absoluteFill, style]} pointerEvents="none">
      <Svg width="100%" height="100%">
        <Defs>
          <LinearGradient id={id} x1="0" y1="0" x2={String(1 - angle)} y2={String(angle)}>
            <Stop offset="0" stopColor={a.color} stopOpacity={a.opacity} />
            <Stop offset="1" stopColor={b.color} stopOpacity={b.opacity} />
          </LinearGradient>
        </Defs>
        <Rect x="0" y="0" width="100%" height="100%" fill={`url(#${id})`} />
      </Svg>
    </View>
  );
}
