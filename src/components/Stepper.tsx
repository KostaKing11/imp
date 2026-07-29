import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { alpha, colors, radius, spacing, type } from "../theme";

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

// Big +/- control for picking numbers (players, imposters).
export default function Stepper({ label, value, min, max, onChange, step = 1, tone }: Props) {
  const dec = () => onChange(Math.max(min, value - step));
  const inc = () => onChange(Math.min(max, value + step));
  const accent = tone ?? colors.accent;

  const button = (sign: string, onPress: () => void, off: boolean) => (
    <Pressable
      onPress={onPress}
      disabled={off}
      hitSlop={6}
      style={({ pressed }) => [
        styles.button,
        { borderColor: alpha(accent, 0.5), backgroundColor: alpha(accent, 0.12) },
        pressed && styles.pressed,
        off && styles.buttonDisabled,
      ]}
    >
      <Text style={[styles.buttonText, { color: off ? colors.textFaint : accent }]}>{sign}</Text>
    </Pressable>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.row}>
        {button("−", dec, value <= min)}
        <Text style={styles.value}>{value}</Text>
        {button("+", inc, value >= max)}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.card,
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
  pressed: {
    opacity: 0.65,
    transform: [{ scale: 0.94 }],
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
