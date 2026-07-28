import React from "react";
import { Pressable, StyleSheet, Text, View, ViewStyle } from "react-native";
import { colors, radius, spacing } from "../theme";

type Props = {
  name: string;
  // The player's own colour: the outline and the name take it.
  color: string;
  onPress?: () => void;
  onLongPress?: () => void;
  disabled?: boolean;
  // Small line under the name, e.g. "(you)" or "tap to reveal".
  note?: string | null;
  // Dimmed, for players who are done or out of the running.
  dimmed?: boolean;
  // Thicker outline — the one you picked.
  selected?: boolean;
  // Sticker poking out of the top-left corner.
  badge?: string | null;
  // Anything on the right: a tick and a cross, vote dots, a count…
  right?: React.ReactNode;
  style?: ViewStyle;
};

// One player, the way they look everywhere in the game: a dark card
// outlined in their colour with their name in the same colour. Filled
// cards drowned the screen in colour; this reads much better, and the
// colour still tells you instantly whose card it is.
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
  return (
    <View style={[styles.wrap, style]}>
      <Pressable
        onPress={onPress}
        onLongPress={onLongPress}
        disabled={disabled || !onPress}
        style={({ pressed }) => [
          styles.card,
          { borderColor: color },
          selected && styles.selected,
          dimmed && styles.dimmed,
          pressed && !disabled && styles.pressed,
        ]}
      >
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
    </View>
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
    minHeight: 66,
    borderRadius: radius.md,
    borderWidth: 3,
    backgroundColor: colors.card,
    paddingVertical: 10,
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
  },
  selected: {
    borderWidth: 5,
  },
  dimmed: {
    opacity: 0.4,
  },
  pressed: {
    opacity: 0.75,
    transform: [{ scale: 0.985 }],
  },
  textArea: {
    flex: 1,
  },
  name: {
    fontSize: 24,
    fontWeight: "900",
  },
  note: {
    fontSize: 13,
    fontWeight: "700",
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
    borderWidth: 2,
    borderRadius: radius.sm,
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: "900",
    color: colors.text,
    letterSpacing: 0.5,
  },
});
