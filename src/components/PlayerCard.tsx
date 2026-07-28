import React from "react";
import { Animated, Pressable, StyleSheet, Text, View, ViewStyle } from "react-native";
import { alpha, colors, elevation, radius, spacing, type } from "../theme";
import { usePressScale } from "./usePressScale";

type Props = {
  name: string;
  // The player's own colour: the avatar, the outline and the name take it.
  color: string;
  onPress?: () => void;
  onLongPress?: () => void;
  disabled?: boolean;
  // Small line under the name, e.g. "(you)" or "tap to reveal".
  note?: string | null;
  // Dimmed, for players who are done or out of the running.
  dimmed?: boolean;
  // Lit outline + glow — the one you picked.
  selected?: boolean;
  // Sticker poking out of the top-left corner.
  badge?: string | null;
  // Anything on the right: a tick and a cross, vote dots, a count…
  right?: React.ReactNode;
  style?: ViewStyle;
};

// What goes in the avatar. One letter for a single name, first + last
// for two — so the default roster reads "P1", "P2"… instead of five
// identical Ps.
function initialsOf(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return "?";
  if (words.length === 1) return words[0].charAt(0).toUpperCase();
  return (words[0].charAt(0) + words[words.length - 1].charAt(0)).toUpperCase();
}

// One player, the way they look everywhere in the game: an initial in a
// ring of their colour, their name beside it, on a card washed in the
// same colour. Fully filled cards drowned the screen; this reads much
// better, and the colour still tells you instantly whose card it is.
export default function PlayerCard({
  name,
  color,
  onPress,
  onLongPress,
  disabled = false,
  note,
  dimmed = false,
  selected = false,
  badge,
  right,
  style,
}: Props) {
  const press = usePressScale(0.98);

  return (
    <Animated.View style={[styles.wrap, press.style, style]}>
      <Pressable
        onPress={onPress}
        onLongPress={onLongPress}
        onPressIn={press.onPressIn}
        onPressOut={press.onPressOut}
        disabled={disabled || !onPress}
        style={({ pressed }) => [
          styles.card,
          {
            borderColor: selected ? color : alpha(color, 0.55),
            backgroundColor: alpha(color, selected ? 0.16 : 0.08),
          },
          selected && [styles.selected, elevation.glow(color)],
          dimmed && styles.dimmed,
          pressed && !disabled && styles.pressed,
        ]}
      >
        <View style={[styles.avatar, { borderColor: color, backgroundColor: alpha(color, 0.2) }]}>
          <Text style={[styles.initial, { color }]} numberOfLines={1}>
            {initialsOf(name)}
          </Text>
        </View>

        <View style={styles.textArea}>
          <Text style={[styles.name, { color }]} numberOfLines={1}>
            {name}
          </Text>
          {note ? <Text style={styles.note}>{note}</Text> : null}
        </View>

        {right ? <View style={styles.right}>{right}</View> : null}
      </Pressable>

      {badge ? (
        <View style={[styles.badge, { borderColor: color }]} pointerEvents="none">
          <Text style={styles.badgeText}>{badge}</Text>
        </View>
      ) : null}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignSelf: "stretch",
    // room for the badge to poke out of the corner
    paddingTop: 8,
    paddingLeft: 6,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    minHeight: 70,
    borderRadius: radius.lg,
    borderWidth: 1.5,
    paddingVertical: 10,
    paddingHorizontal: spacing.sm + 2,
    gap: spacing.sm,
  },
  selected: {
    borderWidth: 2.5,
  },
  dimmed: {
    opacity: 0.38,
  },
  pressed: {
    opacity: 0.8,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: radius.pill,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
  },
  initial: {
    fontSize: 17,
    fontWeight: "900",
    letterSpacing: -0.5,
  },
  textArea: {
    flex: 1,
  },
  name: {
    ...type.heading,
    fontSize: 23,
    fontWeight: "900",
  },
  note: {
    ...type.caption,
    color: colors.textDim,
    marginTop: 1,
  },
  right: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
  badge: {
    position: "absolute",
    top: 0,
    left: 0,
    backgroundColor: colors.bg,
    borderWidth: 1.5,
    borderRadius: radius.pill,
    paddingHorizontal: 9,
    paddingVertical: 3,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: "900",
    color: colors.text,
    letterSpacing: 0.6,
  },
});
