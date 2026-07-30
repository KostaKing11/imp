import React, { useEffect, useRef } from "react";
import { Animated, Easing, Pressable, StyleSheet, Text, View, ViewStyle } from "react-native";
import { alpha, colors, elevation, gradients, radius, spacing, type } from "../theme";
import Gradient from "./Gradient";
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

// A light travelling across a filled button every few seconds. It is the
// difference between a button that is there and one that is asking to be
// pressed — which, on a screen whose whole job is "start the game", is
// the point.
function Shine() {
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.delay(1600),
        Animated.timing(anim, {
          toValue: 1,
          duration: 900,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(anim, { toValue: 0, duration: 0, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [anim]);

  const translateX = anim.interpolate({ inputRange: [0, 1], outputRange: [-220, 460] });
  const opacity = anim.interpolate({ inputRange: [0, 0.15, 0.85, 1], outputRange: [0, 1, 1, 0] });

  return (
    <Animated.View
      style={[styles.shine, { opacity, transform: [{ translateX }, { rotate: "18deg" }] }]}
      pointerEvents="none"
    />
  );
}

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
  const press = usePressScale(0.96);
  const solid = variant === "primary" || variant === "danger";
  const fill = tone ?? (variant === "danger" ? colors.danger : colors.accent);
  const ramp: readonly [string, string] = tone
    ? gradients.of(tone)
    : variant === "danger"
      ? gradients.danger
      : gradients.primary;

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
        {/* A gradient rather than a flat fill — it reads as something to
            press instead of a form control. Every filled button gets one,
            including the ones painted in a player's own colour. */}
        {solid && !disabled ? (
          <>
            <Gradient from={ramp[0]} to={ramp[1]} style={styles.fill} />
            {/* A pale cap along the top edge: the button catches the light
                from above, the way a physical key would. */}
            <View style={styles.cap} pointerEvents="none" />
            {!compact ? <Shine /> : null}
          </>
        ) : null}

        {variant === "secondary" && !disabled ? (
          <View style={styles.secondaryCap} pointerEvents="none" />
        ) : null}

        {icon}
        <Text
          style={[
            styles.label,
            compact && styles.labelCompact,
            solid && styles.labelSolid,
            solid && !disabled && { color: textOn(fill) },
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

// White on most fills, near-black on the pale ones — a button painted in
// a player's yellow needs dark text or the label disappears.
function textOn(hex: string): string {
  const h = hex.replace("#", "");
  if (h.length !== 6) return colors.accentText;
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return (r * 299 + g * 587 + b * 114) / 1000 > 165 ? "#140F24" : colors.accentText;
}

const styles = StyleSheet.create({
  wrap: {
    alignSelf: "stretch",
  },
  fill: {
    borderRadius: radius.lg,
    overflow: "hidden",
  },
  base: {
    flexDirection: "row",
    overflow: "hidden",
    gap: spacing.xs,
    minHeight: 62,
    borderRadius: radius.lg,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  // The lit top edge of a filled button.
  cap: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 1.5,
    backgroundColor: "rgba(255,255,255,0.42)",
  },
  secondaryCap: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: alpha(colors.text, 0.09),
  },
  shine: {
    position: "absolute",
    top: -40,
    bottom: -40,
    width: 46,
    left: 0,
    backgroundColor: "rgba(255,255,255,0.22)",
  },
  secondary: {
    backgroundColor: colors.card,
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  ghost: {
    backgroundColor: alpha(colors.text, 0.05),
  },
  compact: {
    minHeight: 48,
    paddingVertical: 10,
    borderRadius: radius.md,
  },
  pressed: {
    opacity: 0.9,
  },
  disabled: {
    backgroundColor: colors.disabled,
    borderColor: "transparent",
    opacity: 0.5,
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
