import React from "react";
import { Animated, Pressable, StyleSheet, Text, View, ViewStyle } from "react-native";
import { alpha, colors, elevation, gradients, radius, spacing, type } from "../theme";
import { textColorFor } from "../utils";
import Gradient from "./Gradient";
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
  // Same corner, but an icon instead of a word (takes precedence).
  badgeIcon?: React.ReactNode;
  // Sticker on the top-right corner, with an optional colour of its own.
  badgeRight?: React.ReactNode;
  badgeRightColor?: string;
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
  badgeIcon,
  badgeRight,
  badgeRightColor,
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
          selected && [styles.selected, elevation.glowStrong(color)],
          dimmed && styles.dimmed,
          pressed && !disabled && styles.pressed,
        ]}
      >
        {/* A hairline of light along the top edge — the card reads as a
            physical thing lying on the table rather than a coloured box. */}
        <View style={styles.cap} pointerEvents="none" />

        {/* The avatar is filled, not outlined: at a glance across a table
            a solid disc of someone's colour is far easier to find than a
            ring of it. */}
        <View style={[styles.avatar, { backgroundColor: color }]}>
          <Gradient from={gradients.of(color)[0]} to={gradients.of(color)[1]} angle={0.75} />
          <Text style={[styles.initial, { color: textColorFor(color) }]} numberOfLines={1}>
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

      {badgeIcon ?? badge ? (
        <View style={[styles.badge, styles.badgeLeft, { borderColor: color }]} pointerEvents="none">
          {badgeIcon ?? <Text style={styles.badgeText}>{badge}</Text>}
        </View>
      ) : null}

      {badgeRight ? (
        <View
          style={[
            styles.badge,
            styles.badgeRight,
            { borderColor: badgeRightColor ?? color },
          ]}
          pointerEvents="none"
        >
          {badgeRight}
        </View>
      ) : null}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignSelf: "stretch",
    // room for the badges to poke out of the corners
    paddingTop: 9,
    paddingHorizontal: 6,
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
    overflow: "hidden",
  },
  cap: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: alpha(colors.text, 0.14),
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
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
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
  // Solid, not tinted — a badge sits over the card's own colour wash and
  // its border, and anything see-through there reads as a smudge.
  badge: {
    position: "absolute",
    top: 0,
    minHeight: 26,
    minWidth: 26,
    backgroundColor: colors.bgSoft,
    borderWidth: 1.5,
    borderRadius: radius.pill,
    paddingHorizontal: 7,
    paddingVertical: 3,
    alignItems: "center",
    justifyContent: "center",
    ...elevation.card,
  },
  badgeLeft: {
    left: 0,
  },
  badgeRight: {
    right: 0,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: "900",
    color: colors.text,
    letterSpacing: 0.6,
  },
});
