import React, { useEffect, useRef } from "react";
import { Animated, Pressable, StyleSheet, Text, View } from "react-native";
import { alpha, colors, motion, radius, spacing, type } from "../theme";
import { usePressScale } from "./usePressScale";

type Props = {
  label: string;
  // The thing's own colour (a player's, a role's); defaults to neutral.
  bg?: string;
  // Dimmed when false (used for toggles).
  active?: boolean;
  onPress?: () => void;
  onLongPress?: () => void;
  // Small count badge like "×2".
  count?: number;
  // Small dim number after the label (e.g. words in a category).
  badge?: number;
  // The "＋" tile at the end of a list — dashed and quiet.
  add?: boolean;
};

// A pill: a dot in the thing's own colour, its name, and an optional
// count. On means tinted and lit; off means drained of colour, so a
// glance at the row tells you what's in play without reading a word.
// Turning one on pops it — twenty players go in one at a time, and each
// one should feel like it landed.
export default function Chip({
  label,
  bg,
  active = true,
  onPress,
  onLongPress,
  count,
  badge,
  add = false,
}: Props) {
  const press = usePressScale(0.93);
  const tint = bg ?? colors.textDim;
  const textColor = add ? colors.textDim : active ? (bg ?? colors.text) : colors.textFaint;

  // Fires on the way on only — switching a chip off should just go quiet,
  // not celebrate.
  const pop = useRef(new Animated.Value(1)).current;
  const wasActive = useRef(active);
  useEffect(() => {
    if (active && !wasActive.current) {
      pop.setValue(0.9);
      Animated.spring(pop, { toValue: 1, ...motion.pop, useNativeDriver: true }).start();
    }
    wasActive.current = active;
  }, [active, pop]);

  return (
    <Animated.View style={{ transform: [{ scale: pop }, { scale: press.scale }] }}>
      <Pressable
        onPress={onPress}
        onLongPress={onLongPress}
        onPressIn={press.onPressIn}
        onPressOut={press.onPressOut}
        style={({ pressed }) => [
          styles.chip,
          add
            ? styles.add
            : active
              ? {
                  borderColor: alpha(tint, 0.9),
                  backgroundColor: alpha(tint, 0.14),
                }
              : styles.off,
          pressed && styles.pressed,
        ]}
      >
        {bg && !add ? (
          <View style={[styles.dot, { backgroundColor: active ? bg : colors.disabled }]}>
            {/* A lit rim on the dot so a player's colour reads as a bead
                rather than a printed circle. */}
            {active ? <View style={styles.dotGloss} pointerEvents="none" /> : null}
          </View>
        ) : null}

        <Text style={[styles.label, { color: textColor }, add && styles.addLabel]}>
          {label}
          {count && count > 1 ? `  ×${count}` : ""}
        </Text>

        {badge !== undefined ? (
          <View style={[styles.badge, active && { backgroundColor: alpha(tint, 0.2) }]}>
            <Text style={[styles.badgeText, { color: textColor }]}>{badge}</Text>
          </View>
        ) : null}
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs + 2,
    borderRadius: radius.pill,
    borderWidth: 1.5,
    paddingVertical: 11,
    paddingHorizontal: spacing.sm + 3,
    minHeight: 48,
  },
  off: {
    borderColor: colors.borderSoft,
    backgroundColor: colors.chip,
  },
  add: {
    borderColor: colors.border,
    borderStyle: "dashed",
    backgroundColor: "transparent",
    paddingHorizontal: spacing.sm + 2,
  },
  pressed: {
    opacity: 0.75,
  },
  dot: {
    width: 11,
    height: 11,
    borderRadius: 6,
    overflow: "hidden",
  },
  dotGloss: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: "45%",
    backgroundColor: "rgba(255,255,255,0.42)",
  },
  label: {
    ...type.button,
    fontSize: 16,
  },
  addLabel: {
    fontSize: 18,
  },
  badge: {
    minWidth: 22,
    borderRadius: radius.pill,
    paddingHorizontal: 6,
    paddingVertical: 1,
    backgroundColor: alpha(colors.text, 0.06),
    alignItems: "center",
  },
  badgeText: {
    fontSize: 12,
    fontWeight: "800",
    opacity: 0.85,
  },
});
