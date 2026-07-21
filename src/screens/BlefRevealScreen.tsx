import React, { useRef, useState } from "react";
import {
  Animated,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import BigButton from "../components/BigButton";
import Screen from "../components/Screen";
import { BlefRound, Player } from "../game/types";
import { t } from "../i18n";
import { colors, radius, spacing } from "../theme";
import { capitalize, textColorFor } from "../utils";

type Props = {
  players: Player[];
  round: BlefRound;
  onDone: () => void;
  onLeave: () => void;
};

// Pass-and-play reveal for Blef. Every card looks and reads IDENTICALLY —
// the clue is always labelled "Your clue", never "the word" or "a hint" —
// so nothing on screen leaks the round type.
export default function BlefRevealScreen({ players, round, onDone, onLeave }: Props) {
  const [seen, setSeen] = useState<Set<string>>(new Set());
  const [activePlayer, setActivePlayer] = useState<Player | null>(null);
  const [holding, setHolding] = useState(false);
  const [peeked, setPeeked] = useState(false);
  const flip = useRef(new Animated.Value(0)).current;

  const allSeen = seen.size === players.length;

  const openCard = (player: Player) => {
    setActivePlayer(player);
    setPeeked(false);
    setHolding(false);
    flip.setValue(0);
  };

  const pressIn = () => {
    setHolding(true);
    setPeeked(true);
    Animated.spring(flip, { toValue: 1, friction: 8, useNativeDriver: true }).start();
  };

  const pressOut = () => {
    setHolding(false);
    Animated.spring(flip, { toValue: 0, friction: 8, useNativeDriver: true }).start();
  };

  const closeCard = () => {
    if (activePlayer) setSeen(new Set(seen).add(activePlayer.id));
    setActivePlayer(null);
  };

  const frontRotate = flip.interpolate({ inputRange: [0, 1], outputRange: ["0deg", "180deg"] });
  const backRotate = flip.interpolate({ inputRange: [0, 1], outputRange: ["180deg", "360deg"] });

  const activeClue = activePlayer ? round.clues[activePlayer.id] : undefined;

  return (
    <Screen>
      <Pressable onPress={onLeave} hitSlop={10} style={styles.leaveButton}>
        <Text style={styles.leaveText}>✕</Text>
      </Pressable>
      <Text style={styles.heading}>{t("whoAreYou")}</Text>
      <Text style={styles.subheading}>{t("revealInstr")}</Text>

      <ScrollView contentContainerStyle={styles.grid} showsVerticalScrollIndicator={false}>
        {players.map((p) => {
          const done = seen.has(p.id);
          return (
            <Pressable
              key={p.id}
              onPress={() => !done && openCard(p)}
              style={({ pressed }) => [
                styles.gridCard,
                { backgroundColor: p.color },
                done && styles.gridCardDone,
                pressed && !done && styles.pressed,
              ]}
            >
              <Text style={[styles.gridLogo, { color: textColorFor(p.color) }]}>IMP</Text>
              <Text style={[styles.gridName, { color: textColorFor(p.color) }]} numberOfLines={2}>
                {p.name}
              </Text>
              <Text style={[styles.gridHint, { color: textColorFor(p.color) }]}>
                {done ? "✓" : t("tapToReveal")}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      <View style={styles.bottom}>
        <BigButton label={t("everyonesReady")} onPress={onDone} disabled={!allSeen} />
      </View>

      {/* full-screen card — identical design whatever the clue is */}
      <Modal visible={activePlayer !== null} animationType="fade" onRequestClose={() => {}}>
        <View style={[styles.cardScreen, holding && styles.cardScreenHolding]}>
          <Text style={styles.cardOwner}>{activePlayer?.name}</Text>
          <Text style={styles.cardInstruction}>
            {peeked && !holding ? " " : t("holdCardInstr")}
          </Text>

          <Pressable onPressIn={pressIn} onPressOut={pressOut} style={styles.cardArea}>
            {/* front (face down) */}
            <Animated.View
              style={[
                styles.card,
                { backgroundColor: activePlayer?.color ?? colors.card },
                { transform: [{ perspective: 1200 }, { rotateY: frontRotate }] },
              ]}
            >
              <Text
                style={[styles.cardBackLogo, { color: textColorFor(activePlayer?.color ?? "#000") }]}
              >
                IMP
              </Text>
              <Text
                style={[styles.cardBackHint, { color: textColorFor(activePlayer?.color ?? "#000") }]}
              >
                {t("holdToReveal")}
              </Text>
            </Animated.View>

            {/* back (the clue — never says whether it's the word or a hint) */}
            <Animated.View
              style={[
                styles.card,
                styles.clueFace,
                { transform: [{ perspective: 1200 }, { rotateY: backRotate }] },
              ]}
            >
              <Text style={styles.clueLabel}>{t("yourClue")}</Text>
              <Text style={styles.clue}>{capitalize(activeClue?.text ?? "")}</Text>
              <Text style={styles.clueNote}>{t("blefCardNote")}</Text>
            </Animated.View>
          </Pressable>

          <View style={styles.cardBottom}>
            {peeked && !holding ? (
              <BigButton label={t("gotIt")} onPress={closeCard} />
            ) : (
              <Text style={styles.cardPrivacy}>{t("nobodyLooking")}</Text>
            )}
          </View>
        </View>
      </Modal>
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
  leaveText: {
    fontSize: 17,
    fontWeight: "700",
    color: colors.textDim,
  },
  heading: {
    fontSize: 30,
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
    marginBottom: spacing.md,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    justifyContent: "center",
    paddingBottom: spacing.md,
  },
  gridCard: {
    width: "47%",
    aspectRatio: 0.88,
    borderRadius: radius.lg,
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xs,
    borderWidth: 2.5,
    borderColor: "rgba(255,255,255,0.28)",
  },
  gridCardDone: {
    opacity: 0.35,
  },
  pressed: {
    opacity: 0.7,
    transform: [{ scale: 0.97 }],
  },
  gridLogo: {
    fontSize: 15,
    fontWeight: "900",
    letterSpacing: 3,
    opacity: 0.55,
  },
  gridName: {
    fontSize: 26,
    fontWeight: "900",
    textAlign: "center",
  },
  gridHint: {
    fontSize: 13,
    fontWeight: "700",
    opacity: 0.6,
  },
  bottom: {
    paddingBottom: spacing.md,
  },
  cardScreen: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.md,
    backgroundColor: colors.bg,
  },
  cardScreenHolding: {
    backgroundColor: "#0B1418",
  },
  cardOwner: {
    fontSize: 26,
    fontWeight: "900",
    color: colors.text,
  },
  cardInstruction: {
    fontSize: 14,
    color: colors.textDim,
    marginTop: spacing.xs,
    marginBottom: spacing.md,
  },
  cardArea: {
    width: "88%",
    aspectRatio: 0.68,
  },
  card: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: radius.lg,
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.md,
    backfaceVisibility: "hidden",
    borderWidth: 3,
    borderColor: "rgba(255,255,255,0.25)",
  },
  cardBackLogo: {
    fontSize: 56,
    fontWeight: "900",
    letterSpacing: 4,
  },
  cardBackHint: {
    fontSize: 13,
    fontWeight: "700",
    letterSpacing: 3,
    marginTop: spacing.sm,
  },
  clueFace: {
    backgroundColor: colors.card,
    borderColor: colors.blefTeal,
    gap: spacing.sm,
  },
  clueLabel: {
    fontSize: 16,
    color: colors.textDim,
  },
  clue: {
    fontSize: 40,
    fontWeight: "900",
    color: colors.blefTeal,
    textAlign: "center",
  },
  clueNote: {
    fontSize: 14,
    lineHeight: 20,
    color: colors.textDim,
    textAlign: "center",
    marginTop: spacing.sm,
  },
  cardBottom: {
    marginTop: spacing.lg,
    minHeight: 70,
    alignSelf: "stretch",
    justifyContent: "center",
  },
  cardPrivacy: {
    fontSize: 14,
    color: colors.textDim,
    textAlign: "center",
  },
});
