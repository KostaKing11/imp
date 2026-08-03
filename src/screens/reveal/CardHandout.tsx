import React, { useEffect, useRef, useState } from "react";
import { Animated, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import Appear from "../../components/Appear";
import BigButton from "../../components/BigButton";
import FlipCard from "../../components/FlipCard";
import PlayerCard from "../../components/PlayerCard";
import Screen from "../../components/Screen";
import { Player } from "../../game/types";
import { t } from "../../i18n";
import { alpha, colors, radius, spacing, type } from "../../theme";

type Props = {
  players: Player[];
  // The back of one player's card.
  renderFace: (player: Player) => React.ReactNode;
  // Outline colour of that face — the role's colour, or one shared
  // colour when the cards must look identical for everyone.
  faceColor: (player: Player) => string;
  onDone: () => void;
  onLeave: () => void;
  heading?: string;
  instructions?: string;
};

// Handing the phone around: everyone taps their own card, holds it to
// look, and passes it on. Used by every one-phone mode, so the flow is
// the same wherever you are.
export default function CardHandout({
  players,
  renderFace,
  faceColor,
  onDone,
  onLeave,
  heading,
  instructions,
}: Props) {
  const [seen, setSeen] = useState<Set<string>>(new Set());
  const [active, setActive] = useState<Player | null>(null);
  const [peeked, setPeeked] = useState(false);

  const allSeen = seen.size === players.length;

  const progress = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.spring(progress, {
      toValue: seen.size / Math.max(1, players.length),
      speed: 14,
      bounciness: 6,
      useNativeDriver: true,
    }).start();
  }, [seen, players.length, progress]);

  const open = (player: Player) => {
    setPeeked(false);
    setActive(player);
  };

  // "Got it" marks the card as seen; backing out of one you opened by
  // mistake (without looking) simply returns to the list.
  const close = () => {
    if (active && peeked) setSeen(new Set(seen).add(active.id));
    setActive(null);
  };

  // Looking at a card takes over the screen.
  if (active) {
    // The bloom takes the player's own colour, never the role's — the
    // role must not leak before the card is flipped.
    return (
      <Screen glow={active.color}>
        <Pressable onPress={close} hitSlop={10} style={styles.leaveButton}>
          <Text style={styles.leaveText}>✕</Text>
        </Pressable>
        <View style={styles.cardScreen}>
          <FlipCard
            name={active.name}
            color={active.color}
            faceColor={faceColor(active)}
            onPeeked={() => setPeeked(true)}
          >
            {renderFace(active)}
          </FlipCard>
          <View style={styles.cardBottom}>
            {peeked ? (
              <BigButton label={t("gotIt")} onPress={close} />
            ) : (
              <Text style={styles.privacy}>{t("nobodyLooking")}</Text>
            )}
          </View>
        </View>
      </Screen>
    );
  }

  return (
    <Screen>
      <Pressable onPress={onLeave} hitSlop={10} style={styles.leaveButton}>
        <Text style={styles.leaveText}>✕</Text>
      </Pressable>
      <Text style={styles.heading}>{heading ?? t("whoAreYou")}</Text>
      <Text style={styles.subheading}>{instructions ?? t("revealInstr")}</Text>

      {/* How far round the table the phone has got. The bar is full width
          and squashed from the left rather than animated in percentages,
          which react-native-web does not propagate to the DOM. */}
      <View style={styles.progressTrack}>
        <Animated.View style={[styles.progressFill, { transform: [{ scaleX: progress }] }]} />
      </View>

      <ScrollView contentContainerStyle={styles.list} showsVerticalScrollIndicator={false}>
        {players.map((p, i) => {
          const done = seen.has(p.id);
          return (
            <Appear key={p.id} index={i}>
              <PlayerCard
                name={p.name}
                color={p.color}
                dimmed={done}
                disabled={done}
                onPress={() => open(p)}
                right={done ? <Text style={[styles.check, { color: p.color }]}>✓</Text> : null}
              />
            </Appear>
          );
        })}
      </ScrollView>

      <View style={styles.bottom}>
        <BigButton label={t("everyonesReady")} onPress={onDone} disabled={!allSeen} />
      </View>

    </Screen>
  );
}

const styles = StyleSheet.create({
  // Screen already insets its content — see NetScreen's leaveButton.
  leaveButton: {
    position: "absolute",
    top: spacing.sm,
    left: 0,
    zIndex: 1,
    width: 40,
    height: 40,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.borderSoft,
    backgroundColor: colors.card,
    alignItems: "center",
    justifyContent: "center",
  },
  leaveText: { fontSize: 16, fontWeight: "700", color: colors.textDim },
  heading: {
    ...type.title,
    fontSize: 28,
    color: colors.text,
    textAlign: "center",
    marginTop: spacing.sm,
  },
  subheading: {
    ...type.caption,
    fontSize: 14,
    color: colors.textDim,
    textAlign: "center",
    marginTop: spacing.xs,
    marginBottom: spacing.sm,
  },
  // Faint enough to read as an empty track rather than a stray divider
  // rule under the heading, which is what it looked like at 0 of 5.
  progressTrack: {
    height: 4,
    borderRadius: 2,
    backgroundColor: alpha(colors.text, 0.07),
    overflow: "hidden",
    marginBottom: spacing.sm,
  },
  progressFill: {
    height: "100%",
    width: "100%",
    borderRadius: 2,
    backgroundColor: colors.accent,
    transformOrigin: "left center",
  },
  // Centred, so a short roster does not leave the bottom half of
  // the screen as a void under the last card.
  list: {
    flexGrow: 1,
    justifyContent: "center",
    gap: spacing.sm,
    paddingBottom: spacing.md,
  },
  check: { fontSize: 22, fontWeight: "900" },
  bottom: { paddingBottom: spacing.md },
  cardScreen: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  cardBottom: {
    marginTop: spacing.lg,
    minHeight: 70,
    alignSelf: "stretch",
    justifyContent: "center",
  },
  privacy: { ...type.caption, fontSize: 14, color: colors.textDim, textAlign: "center" },
});
