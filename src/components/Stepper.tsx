import React, { useEffect, useRef } from "react";
import { Animated, Pressable, StyleSheet, Text, View } from "react-native";
import { alpha, colors, motion, radius, spacing, type } from "../theme";
import { usePressScale } from "./usePressScale";

type Props = {
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (value: number) => void;
  // How much one tap moves it. Skala counts whole turns around the table.
  step?: number;
  // Paints the round buttons in a role's colour when there is one.
  tone?: string;
};

// One of the two round buttons. Its own component so each keeps its own
// press spring instead of sharing one.
function RoundButton({
  sign,
  onPress,
  off,
  accent,
}: {
  sign: string;
  onPress: () => void;
  off: boolean;
  accent: string;
}) {
  const press = usePressScale(0.88);
  return (
    <Animated.View style={press.style}>
      <Pressable
        onPress={onPress}
        onPressIn={press.onPressIn}
        onPressOut={press.onPressOut}
        disabled={off}
        hitSlop={6}
        style={[
          styles.button,
          { borderColor: alpha(accent, 0.55), backgroundColor: alpha(accent, 0.14) },
          off && styles.buttonDisabled,
        ]}
      >
        <Text style={[styles.buttonText, { color: off ? colors.textFaint : accent }]}>{sign}</Text>
      </Pressable>
    </Animated.View>
  );
}

// Big +/- control for picking numbers (players, imposters). The number
// itself gives a little kick each time it changes, so a tap registers
// even when your eyes are on the buttons.
export default function Stepper({ label, value, min, max, onChange, step = 1, tone }: Props) {
  const accent = tone ?? colors.accent;
  const kick = useRef(new Animated.Value(1)).current;
  const first = useRef(true);

  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    kick.setValue(0.82);
    Animated.spring(kick, { toValue: 1, ...motion.pop, useNativeDriver: true }).start();
  }, [value, kick]);

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.row}>
        <RoundButton
          sign="−"
          onPress={() => onChange(Math.max(min, value - step))}
          off={value <= min}
          accent={accent}
        />
        <Animated.Text style={[styles.value, { transform: [{ scale: kick }] }]}>
          {value}
        </Animated.Text>
        <RoundButton
          sign="+"
          onPress={() => onChange(Math.min(max, value + step))}
          off={value >= max}
          accent={accent}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: alpha(colors.card, 0.85),
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.borderSoft,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    alignItems: "center",
    gap: spacing.sm,
  },
  label: {
    ...type.eyebrow,
    color: colors.textDim,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  button: {
    width: 60,
    height: 60,
    borderRadius: radius.pill,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonDisabled: {
    opacity: 0.35,
  },
  buttonText: {
    fontSize: 30,
    fontWeight: "800",
    lineHeight: 34,
  },
  value: {
    ...type.display,
    color: colors.text,
    minWidth: 78,
    textAlign: "center",
    fontVariant: ["tabular-nums"],
  },
});
