import React from "react";
import { Animated, Pressable, StyleSheet, Text, ViewStyle } from "react-native";
import { alpha, colors, elevation, radius, spacing, type } from "../theme";
import { usePressScale } from "./usePressScale";

type Props = {
  label: string;
  onPress?: () => void;
  variant?: "primary" | "secondary" | "ghost" | "danger";
  disabled?: boolean;
  subLabel?: string;
  // Smaller size for bottom sheets.
  compact?: boolean;
  // Paints a primary button in a specific colour (a player's, a role's).
  tone?: string;
  // Anything before the label: an icon, a count, a coloured dot.
  icon?: React.ReactNode;
  style?: ViewStyle;
};

export default function BigButton({
  label,
  onPress,
  variant = "primary",
  disabled = false,
  subLabel,
  compact = false,
  tone,
  icon,
  style,
}: Props) {
  const press = usePressScale(0.97);
  const solid = variant === "primary" || variant === "danger";
  const fill = tone ?? (variant === "danger" ? colors.danger : colors.accent);

  return (
    <Animated.View style={[styles.wrap, press.style, style]}>
      <Pressable
        onPress={onPress}
        onPressIn={press.onPressIn}
        onPressOut={press.onPressOut}
        disabled={disabled}
        style={({ pressed }) => [
          styles.base,
          compact && styles.compact,
          solid && { backgroundColor: fill },
          solid && !disabled && elevation.glow(fill),
          variant === "secondary" && styles.secondary,
          variant === "ghost" && styles.ghost,
          pressed && !disabled && styles.pressed,
          disabled && styles.disabled,
        ]}
      >
        {icon}
        <Text
          style={[
            styles.label,
            compact && styles.labelCompact,
            solid && styles.labelSolid,
            disabled && styles.labelDisabled,
          ]}
          numberOfLines={1}
        >
          {label}
        </Text>
      </Pressable>

      {subLabel ? <Text style={styles.subLabel}>{subLabel}</Text> : null}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignSelf: "stretch",
  },
  base: {
    flexDirection: "row",
    gap: spacing.xs,
    minHeight: 62,
    borderRadius: radius.lg,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  secondary: {
    backgroundColor: colors.card,
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  ghost: {
    backgroundColor: alpha(colors.text, 0.04),
  },
  compact: {
    minHeight: 48,
    paddingVertical: 10,
    borderRadius: radius.md,
  },
  pressed: {
    opacity: 0.88,
  },
  disabled: {
    backgroundColor: colors.disabled,
    borderColor: "transparent",
    opacity: 0.55,
  },
  label: {
    ...type.button,
    fontSize: 19,
    color: colors.text,
  },
  labelCompact: {
    fontSize: 16,
  },
  labelSolid: {
    color: colors.accentText,
  },
  labelDisabled: {
    color: colors.textDim,
  },
  subLabel: {
    ...type.caption,
    marginTop: spacing.xs,
    color: colors.textDim,
    textAlign: "center",
  },
});
