import React, { useRef, useState } from "react";
import { GestureResponderEvent, StyleSheet, Text, View } from "react-native";
import Svg, { Circle, G, Path, Polygon, Text as SvgText } from "react-native-svg";
import { SKALA_BANDS } from "../game/types";
import { alpha, colors, type } from "../theme";

// ---- geometry ----
// A half dial: 0 points left, 100 points right, 50 straight up. Drawn in
// a fixed viewBox and scaled to whatever width it is given.
const W = 300;
const CX = 150;
const CY = 152;
const R_OUT = 132;
const R_IN = 74;
const H = 172;

function pointAt(value: number, radius: number): [number, number] {
  const deg = 180 - value * 1.8;
  const rad = (deg * Math.PI) / 180;
  return [CX + radius * Math.cos(rad), CY - radius * Math.sin(rad)];
}

// A wedge of the ring between two values. Values run left to right, which
// is clockwise on screen — hence sweep 1 going out and 0 coming back.
function wedgePath(from: number, to: number, rIn = R_IN, rOut = R_OUT): string {
  const a = Math.max(0, Math.min(100, from));
  const b = Math.max(0, Math.min(100, to));
  const [x1, y1] = pointAt(a, rOut);
  const [x2, y2] = pointAt(b, rOut);
  const [x3, y3] = pointAt(b, rIn);
  const [x4, y4] = pointAt(a, rIn);
  return `M${x1},${y1} A${rOut},${rOut} 0 0 1 ${x2},${y2} L${x3},${y3} A${rIn},${rIn} 0 0 0 ${x4},${y4} Z`;
}

type BandLabel = { key: string; at: number; points: number };

// Where each score number sits: the bullseye number at the target, the
// rest centred in their own band on either side, and a 0 in whatever is
// left over at each end.
function bandLabels(target: number): BandLabel[] {
  const out: BandLabel[] = [];
  const sorted = [...SKALA_BANDS].sort((a, b) => a.within - b.within);

  // The innermost band straddles the target, so its number goes on it.
  out.push({ key: "mid", at: target, points: sorted[0].points });

  for (let i = 1; i < sorted.length; i++) {
    const inner = sorted[i - 1].within;
    const outer = sorted[i].within;
    const offset = (inner + outer) / 2;
    for (const side of [-1, 1]) {
      const at = target + side * offset;
      if (at >= 1 && at <= 99) {
        out.push({ key: `b${sorted[i].points}${side}`, at, points: sorted[i].points });
      }
    }
  }

  // Everything past the widest band is worth nothing — label it if there
  // is enough room to read the digit.
  const widest = sorted[sorted.length - 1].within;
  const leftRoom = target - widest;
  const rightRoom = 100 - (target + widest);
  if (leftRoom > 8) out.push({ key: "z-1", at: (target - widest) / 2, points: 0 });
  if (rightRoom > 8) {
    out.push({ key: "z1", at: target + widest + rightRoom / 2, points: 0 });
  }
  return out;
}

type Marker = { value: number; color: string; key: string };

type Props = {
  // Where the needle points, 0..100.
  value: number;
  onChange?: (value: number) => void;
  // The two ends of the spectrum.
  left: string;
  right: string;
  // Once the round is over: the true point, which reveals the wedges.
  target?: number | null;
  // Everyone's guesses, dropped onto the dial at reveal.
  markers?: Marker[];
  // The clue giver's dial is read-only while others guess.
  disabled?: boolean;
  // Hides the needle entirely (while watching someone else's reveal).
  hideNeedle?: boolean;
};

// The scoring wedges, widest first so the narrow ones paint on top.
const BAND_COLORS = ["#2E7D46", "#39A55B", "#4CC471", colors.good];

export default function Dial({
  value,
  onChange,
  left,
  right,
  target = null,
  markers = [],
  disabled = false,
  hideNeedle = false,
}: Props) {
  const [width, setWidth] = useState(0);
  const offset = useRef({ x: 0, y: 0 });

  const scale = width > 0 ? width / W : 1;

  const applyTouch = (pageX: number, pageY: number) => {
    if (!onChange || disabled) return;
    const x = (pageX - offset.current.x) / scale;
    const y = (pageY - offset.current.y) / scale;
    // atan2 covers the whole circle, but this dial is only the top half.
    // A finger that strays below the pivot used to wrap the needle right
    // round; now it just holds at whichever end it is nearest.
    const deg = (Math.atan2(CY - y, x - CX) * 180) / Math.PI;
    if (deg < 0) {
      onChange(x < CX ? 0 : 100);
      return;
    }
    const next = Math.round((180 - deg) / 1.8);
    onChange(Math.max(0, Math.min(100, next)));
  };

  const onGrant = (e: GestureResponderEvent) => {
    // Recover the widget's own position so dragging never jumps.
    offset.current = {
      x: e.nativeEvent.pageX - e.nativeEvent.locationX,
      y: e.nativeEvent.pageY - e.nativeEvent.locationY,
    };
    applyTouch(e.nativeEvent.pageX, e.nativeEvent.pageY);
  };

  const [nx, ny] = pointAt(value, R_OUT - 12);
  const revealed = target !== null && target !== undefined;

  return (
    <View
      style={styles.wrap}
      onLayout={(e) => setWidth(e.nativeEvent.layout.width)}
      // Same as the slider: take the touch before the ScrollView sees it.
      onStartShouldSetResponderCapture={() => !disabled && !!onChange}
      onMoveShouldSetResponderCapture={() => !disabled && !!onChange}
      onStartShouldSetResponder={() => !disabled && !!onChange}
      onMoveShouldSetResponder={() => !disabled && !!onChange}
      onResponderTerminationRequest={() => false}
      onResponderGrant={onGrant}
      onResponderMove={(e) => applyTouch(e.nativeEvent.pageX, e.nativeEvent.pageY)}
    >
      <Svg width="100%" height="100%" viewBox={`0 0 ${W} ${H}`}>
        {/* the empty ring */}
        <Path d={wedgePath(0, 100)} fill={colors.chip} stroke={colors.borderSoft} strokeWidth={1} />

        {/* scoring wedges, only once the answer is out */}
        {revealed ? (
          <G>
            {[...SKALA_BANDS]
              .sort((a, b) => b.within - a.within)
              .map((band, i) => (
                <Path
                  key={band.points}
                  d={wedgePath(target! - band.within, target! + band.within)}
                  fill={BAND_COLORS[i] ?? colors.good}
                />
              ))}
            {/* the exact point */}
            <Path
              d={wedgePath(target! - 0.6, target! + 0.6, R_IN - 6, R_OUT + 6)}
              fill={colors.text}
            />
            {/* A number in the middle of every band, on both sides of the
                target, plus the two zero zones out at the ends. */}
            {bandLabels(target!).map((lab) => {
              const [tx, ty] = pointAt(lab.at, (R_IN + R_OUT) / 2);
              return (
                <SvgText
                  key={lab.key}
                  x={tx}
                  y={ty + 6}
                  fill={lab.points === 0 ? colors.textDim : "#08160C"}
                  fontSize={16}
                  fontWeight="bold"
                  textAnchor="middle"
                >
                  {lab.points}
                </SvgText>
              );
            })}
          </G>
        ) : null}

        {/* everyone's guesses */}
        {markers.map((m) => {
          const [mx, my] = pointAt(m.value, R_OUT + 11);
          return (
            <Circle
              key={m.key}
              cx={mx}
              cy={my}
              r={8}
              fill={m.color}
              stroke={colors.bg}
              strokeWidth={2}
            />
          );
        })}

        {/* the needle */}
        {!hideNeedle ? (
          <G>
            <Polygon
              points={`${CX - 9},${CY} ${CX + 9},${CY} ${nx},${ny}`}
              fill={disabled ? colors.textFaint : colors.accent}
            />
            <Circle cx={CX} cy={CY} r={13} fill={colors.card} stroke={colors.border} strokeWidth={2} />
          </G>
        ) : null}
      </Svg>

      <View style={styles.labels} pointerEvents="none">
        <Text style={styles.label} numberOfLines={2}>
          {left}
        </Text>
        <Text style={[styles.label, styles.labelRight]} numberOfLines={2}>
          {right}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignSelf: "stretch",
    aspectRatio: W / H,
  },
  labels: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  label: {
    ...type.caption,
    fontSize: 13,
    color: colors.textDim,
    maxWidth: "40%",
    backgroundColor: alpha(colors.bg, 0.6),
  },
  labelRight: {
    textAlign: "right",
  },
});
