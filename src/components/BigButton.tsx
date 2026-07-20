import React from "react";
import { Pressable, StyleSheet, Text, ViewStyle } from "react-native";
import { colors, radius, spacing } from "../theme";

type Props = {
  label: string;
  onPress?: () => void;
  variant?: "primary" | "secondary" | "ghost";
  disabled?: boolean;
  subLabel?: string;
  // Smaller size for bottom sheets.
  compact?: boolean;
  style?: ViewStyle;
};

export default function BigButton({
  label,
  onPress,
  variant = "primary",
  disabled = false,
  subLabel,
  compact = false,
  style,
}: Props) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.base,
        variant === "primary" && styles.primary,
        variant === "secondary" && styles.secondary,
        variant === "ghost" && styles.ghost,
        compact && styles.compact,
        pressed && !disabled && styles.pressed,
        disabled && styles.disabled,
        style,
      ]}
    >
      <Text
        style={[
          styles.label,
          compact && styles.labelCompact,
          variant === "primary" && styles.labelPrimary,
          disabled && styles.labelDisabled,
        ]}
      >
        {label}
      </Text>
      {subLabel ? <Text style={styles.subLabel}>{subLabel}</Text> : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: 64,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    width: "100%",
  },
  primary: {
    backgroundColor: colors.accent,
  },
  secondary: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
  },
  ghost: {
    backgroundColor: "transparent",
  },
  compact: {
    minHeight: 46,
    paddingVertical: 8,
    borderRadius: 12,
  },
  pressed: {
    opacity: 0.75,
    transform: [{ scale: 0.98 }],
  },
  disabled: {
    backgroundColor: colors.disabled,
    opacity: 0.5,
  },
  label: {
    fontSize: 20,
    fontWeight: "700",
    color: colors.text,
  },
  labelCompact: {
    fontSize: 16,
  },
  labelPrimary: {
    color: colors.accentText,
  },
  labelDisabled: {
    color: colors.textDim,
  },
  subLabel: {
    marginTop: 4,
    fontSize: 13,
    color: colors.textDim,
  },
});
