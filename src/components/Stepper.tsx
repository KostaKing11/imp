import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { colors, radius, spacing } from "../theme";

type Props = {
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (value: number) => void;
};

// Big +/- control for picking numbers (players, imposters).
export default function Stepper({ label, value, min, max, onChange }: Props) {
  const dec = () => onChange(Math.max(min, value - 1));
  const inc = () => onChange(Math.min(max, value + 1));

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.row}>
        <Pressable
          onPress={dec}
          disabled={value <= min}
          style={({ pressed }) => [
            styles.button,
            pressed && styles.pressed,
            value <= min && styles.buttonDisabled,
          ]}
        >
          <Text style={styles.buttonText}>−</Text>
        </Pressable>
        <Text style={styles.value}>{value}</Text>
        <Pressable
          onPress={inc}
          disabled={value >= max}
          style={({ pressed }) => [
            styles.button,
            pressed && styles.pressed,
            value >= max && styles.buttonDisabled,
          ]}
        >
          <Text style={styles.buttonText}>+</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.card,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    alignItems: "center",
    gap: spacing.sm,
  },
  label: {
    fontSize: 16,
    color: colors.textDim,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.lg,
  },
  button: {
    width: 64,
    height: 64,
    borderRadius: radius.md,
    backgroundColor: colors.cardPressed,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonDisabled: {
    opacity: 0.3,
  },
  pressed: {
    opacity: 0.7,
  },
  buttonText: {
    fontSize: 32,
    color: colors.text,
    fontWeight: "700",
    lineHeight: 36,
  },
  value: {
    fontSize: 44,
    fontWeight: "800",
    color: colors.text,
    minWidth: 70,
    textAlign: "center",
  },
});
