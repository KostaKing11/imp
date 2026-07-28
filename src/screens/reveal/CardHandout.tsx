import React, { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import BigButton from "../../components/BigButton";
import FlipCard from "../../components/FlipCard";
import PlayerCard from "../../components/PlayerCard";
import Screen from "../../components/Screen";
import { Player } from "../../game/types";
import { t } from "../../i18n";
import { colors, spacing } from "../../theme";

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
    return (
      <Screen>
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

      <ScrollView contentContainerStyle={styles.list} showsVerticalScrollIndicator={false}>
        {players.map((p) => {
          const done = seen.has(p.id);
          return (
            <PlayerCard
              key={p.id}
              name={p.name}
              color={p.color}
              note={done ? null : t("tapToReveal")}
              dimmed={done}
              disabled={done}
              onPress={() => open(p)}
              right={done ? <Text style={[styles.check, { color: p.color }]}>✓</Text> : null}
            />
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
  leaveButton: {
    position: "absolute",
    top: spacing.sm,
    left: spacing.md,
    zIndex: 1,
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 1.5,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  leaveText: { fontSize: 17, fontWeight: "700", color: colors.textDim },
  heading: {
    fontSize: 28,
    fontWeight: "900",
    color: colors.text,
    textAlign: "center",
    marginTop: spacing.sm,
  },
  subheading: {
    fontSize: 14,
    color: colors.textDim,
    textAlign: "center",
    marginTop: spacing.xs,
    marginBottom: spacing.sm,
  },
  list: { gap: spacing.xs, paddingBottom: spacing.md },
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
  privacy: { fontSize: 14, color: colors.textDim, textAlign: "center" },
});
