import React, { useEffect, useMemo, useState } from "react";
import { GestureResponderEvent, Modal, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import Svg, { Circle, Defs, LinearGradient, Path, RadialGradient, Rect, Stop } from "react-native-svg";
import { colors, radius, spacing } from "../theme";
import { hexToHsv, hsvToHex, normalizeHex } from "../utils";
import BigButton from "./BigButton";

const SIZE = 280;
const R = SIZE / 2;
const BAR_H = 36;

type Props = {
  visible: boolean;
  initial: string;
  onDone: (hex: string) => void;
  onClose: () => void;
};

// Hue/saturation wheel + brightness bar.
export default function ColorWheelModal({ visible, initial, onDone, onClose }: Props) {
  const [hsv, setHsv] = useState(() => hexToHsv(initial));
  const [hexText, setHexText] = useState(initial.toUpperCase());

  useEffect(() => {
    if (visible) {
      setHsv(hexToHsv(initial));
      setHexText(initial.toUpperCase());
    }
  }, [visible, initial]);

  // Wheel/bar movement updates the hex field.
  useEffect(() => {
    setHexText(hsvToHex(hsv.h, hsv.s, hsv.v));
  }, [hsv]);

  const onHexTyped = (text: string) => {
    setHexText(text);
    const normalized = normalizeHex(text);
    if (normalized) setHsv(hexToHsv(normalized));
  };

  // 72 hue wedges (5° each, tiny overlap so no hairline gaps).
  const wedges = useMemo(() => {
    const arr: { d: string; fill: string }[] = [];
    for (let i = 0; i < 72; i++) {
      const a0 = (i * 5 * Math.PI) / 180;
      const a1 = ((i * 5 + 5.5) * Math.PI) / 180;
      const x0 = R + R * Math.cos(a0);
      const y0 = R + R * Math.sin(a0);
      const x1 = R + R * Math.cos(a1);
      const y1 = R + R * Math.sin(a1);
      arr.push({
        d: `M${R},${R} L${x0},${y0} A${R},${R} 0 0 1 ${x1},${y1} Z`,
        fill: hsvToHex(i * 5, 1, 1),
      });
    }
    return arr;
  }, []);

  const onWheelTouch = (e: GestureResponderEvent) => {
    const { locationX, locationY } = e.nativeEvent;
    const dx = locationX - R;
    const dy = locationY - R;
    const r = Math.min(Math.sqrt(dx * dx + dy * dy), R);
    const h = (Math.atan2(dy, dx) * (180 / Math.PI) + 360) % 360;
    setHsv((prev) => ({ h, s: r / R, v: prev.v }));
  };

  const onBarTouch = (e: GestureResponderEvent) => {
    const x = Math.max(0, Math.min(SIZE, e.nativeEvent.locationX));
    setHsv((prev) => ({ ...prev, v: x / SIZE }));
  };

  const hex = hsvToHex(hsv.h, hsv.s, hsv.v);
  const aRad = (hsv.h * Math.PI) / 180;
  const ix = R + hsv.s * (R - 10) * Math.cos(aRad);
  const iy = R + hsv.s * (R - 10) * Math.sin(aRad);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <Pressable style={styles.backdropPress} onPress={onClose} />
        <View style={styles.card}>
          <Text style={styles.title}>Pick a color</Text>

          <View
            style={{ width: SIZE, height: SIZE }}
            onStartShouldSetResponder={() => true}
            onMoveShouldSetResponder={() => true}
            onResponderGrant={onWheelTouch}
            onResponderMove={onWheelTouch}
          >
            <Svg width={SIZE} height={SIZE}>
              {wedges.map((w, i) => (
                <Path key={i} d={w.d} fill={w.fill} />
              ))}
              <Defs>
                <RadialGradient id="sat" cx="50%" cy="50%" r="50%">
                  <Stop offset="0%" stopColor="#FFFFFF" stopOpacity="1" />
                  <Stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
                </RadialGradient>
              </Defs>
              <Circle cx={R} cy={R} r={R} fill="url(#sat)" />
              <Circle cx={ix} cy={iy} r={11} fill={hex} stroke="#FFFFFF" strokeWidth={3} />
            </Svg>
          </View>

          <View
            style={{ width: SIZE, height: BAR_H }}
            onStartShouldSetResponder={() => true}
            onMoveShouldSetResponder={() => true}
            onResponderGrant={onBarTouch}
            onResponderMove={onBarTouch}
          >
            <Svg width={SIZE} height={BAR_H}>
              <Defs>
                <LinearGradient id="val" x1="0%" y1="0%" x2="100%" y2="0%">
                  <Stop offset="0%" stopColor="#000000" />
                  <Stop offset="100%" stopColor={hsvToHex(hsv.h, hsv.s, 1)} />
                </LinearGradient>
              </Defs>
              <Rect x={0} y={0} width={SIZE} height={BAR_H} rx={10} fill="url(#val)" />
              <Rect
                x={Math.max(0, Math.min(SIZE - 6, hsv.v * SIZE - 3))}
                y={0}
                width={6}
                height={BAR_H}
                rx={3}
                fill="#FFFFFF"
              />
            </Svg>
          </View>

          <View style={styles.previewRow}>
            <View style={[styles.preview, { backgroundColor: hex }]} />
            <TextInput
              style={styles.hexInput}
              value={hexText}
              onChangeText={onHexTyped}
              maxLength={7}
              autoCapitalize="none"
              autoCorrect={false}
              placeholder="#FF5A1F"
              placeholderTextColor={colors.textDim}
            />
          </View>

          <BigButton
            label="Use this color"
            compact
            onPress={() => {
              onDone(hex);
              onClose();
            }}
          />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.7)",
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.md,
  },
  backdropPress: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: spacing.md,
    alignItems: "center",
    gap: spacing.sm,
    alignSelf: "stretch",
  },
  title: {
    fontSize: 20,
    fontWeight: "800",
    color: colors.text,
  },
  previewRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  preview: {
    width: 36,
    height: 36,
    borderRadius: radius.sm,
    borderWidth: 2,
    borderColor: colors.border,
  },
  hexInput: {
    width: 108,
    backgroundColor: colors.chip,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.sm,
    color: colors.text,
    fontSize: 16,
    fontWeight: "700",
    textAlign: "center",
    paddingVertical: 8,
  },
});
