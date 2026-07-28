import React from "react";
import { Pressable, StyleSheet, Text } from "react-native";
import { colors, radius, spacing } from "../theme";

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
  // Coloured chips (players, roles) are outlined in their colour with
  // the label in the same colour — the same look the cards use.
  const accentColor = bg ?? colors.border;
  const textColor = bg ?? colors.text;

  return (
    <Pressable
      onPress={onPress}
      onLongPress={onLongPress}
      style={({ pressed }) => [
        styles.chip,
        { borderColor: accentColor },
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
    backgroundColor: colors.card,
    borderWidth: 2.5,
    paddingVertical: 13,
    paddingHorizontal: spacing.md,
    minHeight: 52,
    overflow: "hidden",
  },
  active: {},
  inactive: {
    opacity: 0.32,
  },
  pressed: {
    opacity: 0.7,
  },
  label: {
    fontSize: 17,
    fontWeight: "800",
  },
  badge: {
    fontSize: 13,
    fontWeight: "700",
    opacity: 0.55,
    marginLeft: 7,
  },
});
