import React from "react";
import Svg, { Circle, Line, Path } from "react-native-svg";
import { colors } from "../theme";
import { hsvToHex } from "../utils";

// Small rainbow wheel used on the "open the color wheel" square.
export function WheelIcon({ size = 24 }: { size?: number }) {
  const R = size / 2;
  const wedges: { d: string; fill: string }[] = [];
  for (let i = 0; i < 12; i++) {
    const a0 = (i * 30 * Math.PI) / 180;
    const a1 = ((i * 30 + 31) * Math.PI) / 180;
    wedges.push({
      d: `M${R},${R} L${R + R * Math.cos(a0)},${R + R * Math.sin(a0)} A${R},${R} 0 0 1 ${
        R + R * Math.cos(a1)
      },${R + R * Math.sin(a1)} Z`,
      fill: hsvToHex(i * 30, 1, 1),
    });
  }
  return (
    <Svg width={size} height={size}>
      {wedges.map((w, i) => (
        <Path key={i} d={w.d} fill={w.fill} />
      ))}
    </Svg>
  );
}

// Clean "sliders" settings icon (three lines with knobs).
export function SlidersIcon({ size = 24, color = colors.text }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Line x1="3" y1="6" x2="21" y2="6" stroke={color} strokeWidth="2" strokeLinecap="round" />
      <Circle cx="9" cy="6" r="3" fill={colors.bg} stroke={color} strokeWidth="2" />
      <Line x1="3" y1="12" x2="21" y2="12" stroke={color} strokeWidth="2" strokeLinecap="round" />
      <Circle cx="15" cy="12" r="3" fill={colors.bg} stroke={color} strokeWidth="2" />
      <Line x1="3" y1="18" x2="21" y2="18" stroke={color} strokeWidth="2" strokeLinecap="round" />
      <Circle cx="7" cy="18" r="3" fill={colors.bg} stroke={color} strokeWidth="2" />
    </Svg>
  );
}
