import React from "react";
import { Pressable, StyleSheet, Text } from "react-native";
import { colors, radius, spacing } from "../theme";
import { textColorFor } from "../utils";

type Props = {
  label: string;
  // Chip background; defaults to the dark chip color.
  bg?: string;
  // Dimmed + no border when false (used for toggles).
  active?: boolean;
  onPress?: () => void;
  onLongPress?: () => void;
  // Small count badge like "×2".
  count?: number;
  // Small dim number after the label (e.g. words in a category).
  badge?: number;
};

export default function Chip({ label, bg, active = true, onPress, onLongPress, count, badge }: Props) {
  const background = bg ?? colors.chip;
  const textColor = textColorFor(background);

  return (
    <Pressable
      onPress={onPress}
      onLongPress={onLongPress}
      style={({ pressed }) => [
        styles.chip,
        { backgroundColor: background },
        active ? styles.active : styles.inactive,
        pressed && styles.pressed,
      ]}
    >
      <Text style={[styles.label, { color: textColor }]}>
        {label}
        {count && count > 1 ? `  ×${count}` : ""}
      </Text>
      {badge !== undefined ? (
        <Text style={[styles.badge, { color: textColor }]}>{badge}</Text>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: radius.md,
    paddingVertical: 14,
    paddingHorizontal: spacing.md,
    minHeight: 52,
    overflow: "hidden",
  },
  active: {
    borderWidth: 2,
    borderColor: colors.border,
  },
  inactive: {
    borderWidth: 2,
    borderColor: "transparent",
    opacity: 0.35,
  },
  pressed: {
    opacity: 0.7,
  },
  label: {
    fontSize: 17,
    fontWeight: "700",
  },
  badge: {
    fontSize: 13,
    fontWeight: "700",
    opacity: 0.55,
    marginLeft: 7,
  },
});
