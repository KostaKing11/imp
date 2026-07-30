import React from "react";
import Svg, { Circle, Ellipse, G, Line, Path, Rect } from "react-native-svg";
import { colors } from "../theme";
import { hsvToHex } from "../utils";

// Thumb up / thumb down. The voting screen leans on these: a thumb up
// says "this one has voted", a thumb down in your own colour says "this
// is who you picked".
function Thumb({ size, color, down }: { size: number; color: string; down: boolean }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <G transform={down ? "rotate(180 12 12)" : undefined}>
        <Path
          d="M7.4 10.6 L11 3.6 a2.3 2.3 0 0 1 4.3 1.5 L14.6 9.6 h4.2 a2.1 2.1 0 0 1 2 2.7 l-1.7 6 a2.3 2.3 0 0 1 -2.2 1.6 H7.4 z"
          fill={color}
        />
        <Rect x="2.4" y="10.2" width="3.6" height="9.7" rx="1.3" fill={color} />
      </G>
    </Svg>
  );
}

export function ThumbUpIcon({ size = 18, color = colors.text }: { size?: number; color?: string }) {
  return <Thumb size={size} color={color} down={false} />;
}

export function ThumbDownIcon({ size = 18, color = colors.text }: { size?: number; color?: string }) {
  return <Thumb size={size} color={color} down />;
}

// The little figure that drifts off into the dark once somebody has been
// voted out. Drawn in the ejected player's own colour.
export function FloaterIcon({ size = 120, color }: { size?: number; color: string }) {
  return (
    <Svg width={size} height={size * 1.15} viewBox="0 0 100 115">
      {/* body */}
      <Path
        d="M50 6 c22 0 33 15 33 35 v52 c0 5-5.5 7.5-9.4 4.6 l-7-5.2 c-2.3-1.7-5.5-1.3-7.3 1 l-4.6 5.6 c-2.6 3.2-7.5 3.2-10.1 0 l-4.6-5.6 c-1.8-2.3-5-2.7-7.3-1 l-7 5.2 C21.8 100.5 17 98 17 93 V41 C17 21 28 6 50 6 z"
        fill={color}
        opacity={0.92}
      />
      {/* visor */}
      <Ellipse cx="50" cy="41" rx="24" ry="18" fill="rgba(10,12,16,0.55)" />
      <Ellipse cx="42" cy="35" rx="7" ry="5.5" fill="rgba(255,255,255,0.5)" />
    </Svg>
  );
}

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

// Miniature QR code — the button that opens the big one in the lobby.
export function QrIcon({ size = 24, color = colors.text }: { size?: number; color?: string }) {
  const eye = (x: number, y: number) => (
    <>
      <Rect
        x={x}
        y={y}
        width="7"
        height="7"
        rx="1.5"
        stroke={color}
        strokeWidth="2"
        fill="none"
      />
      <Rect x={x + 2.5} y={y + 2.5} width="2" height="2" fill={color} />
    </>
  );
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      {eye(2, 2)}
      {eye(15, 2)}
      {eye(2, 15)}
      <Rect x="15" y="15" width="2.5" height="2.5" fill={color} />
      <Rect x="19.5" y="15" width="2.5" height="2.5" fill={color} />
      <Rect x="15" y="19.5" width="2.5" height="2.5" fill={color} />
      <Rect x="19.5" y="19.5" width="2.5" height="2.5" fill={color} />
      <Rect x="11" y="6" width="2" height="2" fill={color} />
      <Rect x="11" y="11" width="2" height="2" fill={color} />
      <Rect x="6" y="11" width="2" height="2" fill={color} />
    </Svg>
  );
}

// ---- gamemode marks ----
//
// One drawing per mode, all to the same recipe: a 64-square, one colour
// (the mode's own), chunky rounded strokes, and any translucent fill done
// with fillOpacity. Never an rgba() colour string — Android's
// react-native-svg drops the alpha channel of one and paints it solid.
//
// They replaced the painted cards: seven illustrations in seven different
// styles never sat together as a row, and two modes had no picture at all
// and printed their own name across the tile instead.

// IMP Classic: the mask. One of you is not who they say they are.
export function ImpMark({ size = 64, color }: { size?: number; color: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 64 64">
      <Rect
        x="5"
        y="21"
        width="54"
        height="25"
        rx="12"
        fill={color}
        fillOpacity={0.3}
        stroke={color}
        strokeWidth="3"
      />
      <Circle cx="21" cy="33.5" r="4.6" fill={color} />
      <Circle cx="43" cy="33.5" r="4.6" fill={color} />
    </Svg>
  );
}

// Odd One Out: four of a kind, except one.
export function OddMark({ size = 64, color }: { size?: number; color: string }) {
  const dim = { fill: color, fillOpacity: 0.28, stroke: color, strokeWidth: 3 };
  return (
    <Svg width={size} height={size} viewBox="0 0 64 64">
      <Circle cx="22" cy="22" r="9.5" {...dim} />
      <Circle cx="42" cy="22" r="9.5" {...dim} />
      <Circle cx="22" cy="42" r="9.5" {...dim} />
      {/* the one that is not like the others */}
      <Circle cx="42" cy="42" r="11" fill={color} />
    </Svg>
  );
}

// Mafia: the hat. The app deals the roles, the table plays it out.
export function MafiaMark({ size = 64, color }: { size?: number; color: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 64 64">
      <Ellipse
        cx="32"
        cy="43"
        rx="26"
        ry="6.5"
        fill={color}
        fillOpacity={0.28}
        stroke={color}
        strokeWidth="3"
      />
      <Path
        d="M19 41 c0 -14 5 -21 13 -21 s13 7 13 21 z"
        fill={color}
        fillOpacity={0.28}
        stroke={color}
        strokeWidth="3"
        strokeLinejoin="round"
      />
      <Rect x="17.5" y="34" width="29" height="6" rx="3" fill={color} />
    </Svg>
  );
}

// Bluff: a hand you are not showing anyone.
export function BluffMark({ size = 64, color }: { size?: number; color: string }) {
  const card = {
    x: 21,
    y: 13,
    width: 22,
    height: 33,
    rx: 5,
    fill: color,
    fillOpacity: 0.28,
    stroke: color,
    strokeWidth: 3,
  };
  return (
    <Svg width={size} height={size} viewBox="0 0 64 64">
      <Rect {...card} transform="rotate(-24 32 44)" />
      <Rect {...card} transform="rotate(24 32 44)" />
      <Rect {...card} />
    </Svg>
  );
}

// Faker: the same question, asked of everyone but one.
export function FakerMark({ size = 64, color }: { size?: number; color: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 64 64">
      <Path
        d="M14 12 h36 a8 8 0 0 1 8 8 v16 a8 8 0 0 1 -8 8 h-18 l-11 9 v-9 h-7 a8 8 0 0 1 -8 -8 v-16 a8 8 0 0 1 8 -8 z"
        fill={color}
        fillOpacity={0.28}
        stroke={color}
        strokeWidth="3"
        strokeLinejoin="round"
      />
      <Path
        d="M26.5 24 a6 6 0 1 1 6 6.5 v2"
        stroke={color}
        strokeWidth="4"
        strokeLinecap="round"
        fill="none"
      />
      <Circle cx="32.5" cy="37.5" r="2.7" fill={color} />
    </Svg>
  );
}

// Scale: the spectrum, lit from one end to a point along it.
export function ScaleMark({ size = 64, color }: { size?: number; color: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 64 64">
      {/* the whole range, dim */}
      <Path
        d="M8 44 a24 24 0 0 1 48 0"
        stroke={color}
        strokeOpacity={0.3}
        strokeWidth="9"
        strokeLinecap="round"
        fill="none"
      />
      {/* how far along it you are */}
      <Path
        d="M8 44 a24 24 0 0 1 20 -23.4"
        stroke={color}
        strokeWidth="9"
        strokeLinecap="round"
        fill="none"
      />
      {/* the point itself — a bead on the scale rather than a needle
          pointing at it, which read as a gauge from a dashboard */}
      <Circle cx="28" cy="20.6" r="7.5" fill={color} />
      <Circle cx="28" cy="20.6" r="3" fill="#0A0714" fillOpacity={0.55} />
    </Svg>
  );
}

// Same Page's mark: two sheets landing on the same answer.
export function SamePageMark({ size = 64, color }: { size?: number; color: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 64 64">
      <Rect
        x="8"
        y="12"
        width="30"
        height="38"
        rx="5"
        fill={color}
        fillOpacity={0.3}
        stroke={color}
        strokeWidth="3"
        transform="rotate(-9 23 31)"
      />
      <Rect
        x="26"
        y="14"
        width="30"
        height="38"
        rx="5"
        fill={color}
        fillOpacity={0.3}
        stroke={color}
        strokeWidth="3"
        transform="rotate(9 41 33)"
      />
      <Path
        d="M32 34 l6 7 l12 -15"
        stroke={color}
        strokeWidth="5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
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
