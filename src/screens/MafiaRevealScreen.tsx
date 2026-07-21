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
import { MAFIA_CIVILIAN } from "../game/roles";
import { MafiaRound, Player, RoleDef } from "../game/types";
import { roleDesc, roleName, t } from "../i18n";
import { colors, radius, spacing } from "../theme";
import { textColorFor } from "../utils";

type Props = {
  players: Player[];
  roles: RoleDef[];
  round: MafiaRound;
  onDone: () => void;
  onLeave: () => void;
};

function roleFor(round: MafiaRound, roles: RoleDef[], playerId: string): RoleDef {
  const roleId = round.assignments[playerId];
  return roles.find((r) => r.id === roleId) ?? MAFIA_CIVILIAN;
}

// Pass-and-play role reveal for Mafia: same hold-to-flip cards, the
// back shows the role in its color (no words in this mode).
export default function MafiaRevealScreen({ players, roles, round, onDone, onLeave }: Props) {
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

  const activeRole = activePlayer ? roleFor(round, roles, activePlayer.id) : MAFIA_CIVILIAN;
  const roleText = textColorFor(activeRole.color);

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

      {/* full-screen card */}
      <Modal visible={activePlayer !== null} animationType="fade" onRequestClose={() => {}}>
        <View
          style={[
            styles.cardScreen,
            { backgroundColor: holding ? shade(activeRole.color) : colors.bg },
          ]}
        >
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

            {/* back (the role) */}
            <Animated.View
              style={[
                styles.card,
                styles.roleFace,
                { backgroundColor: activeRole.color },
                { transform: [{ perspective: 1200 }, { rotateY: backRotate }] },
              ]}
            >
              <Text style={[styles.roleName, { color: roleText }]}>{roleName(activeRole)}</Text>
              {roleDesc(activeRole) ? (
                <Text style={[styles.roleDescription, { color: roleText }]}>
                  {roleDesc(activeRole)}
                </Text>
              ) : null}
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

// Darkened version of the role color for the full-screen backdrop.
function shade(hex: string): string {
  const h = hex.replace("#", "");
  if (h.length < 6) return "#000000";
  const r = Math.floor(parseInt(h.slice(0, 2), 16) * 0.35);
  const g = Math.floor(parseInt(h.slice(2, 4), 16) * 0.35);
  const b = Math.floor(parseInt(h.slice(4, 6), 16) * 0.35);
  return `rgb(${r},${g},${b})`;
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
  roleFace: {
    gap: spacing.sm,
  },
  roleName: {
    fontSize: 34,
    fontWeight: "900",
    textAlign: "center",
  },
  roleDescription: {
    fontSize: 15,
    lineHeight: 22,
    textAlign: "center",
    opacity: 0.9,
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
