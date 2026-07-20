import React, { useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import BigButton from "../components/BigButton";
import Screen from "../components/Screen";
import { CIVILIAN } from "../game/roles";
import { Player, RoleDef, Round } from "../game/types";
import { colors, radius, spacing } from "../theme";
import { textColorFor } from "../utils";

type Props = {
  players: Player[];
  roles: RoleDef[];
  round: Round;
  onNewRound: () => void;
  onBackToMenu: () => void;
};

export default function ResultScreen({ players, roles, round, onNewRound, onBackToMenu }: Props) {
  const [revealed, setRevealed] = useState(false);

  const roleFor = (playerId: string): RoleDef => {
    const roleId = round.assignments[playerId]?.roleId;
    return roles.find((r) => r.id === roleId) ?? CIVILIAN;
  };

  const specialsInRound = roles.filter((r) =>
    players.some((p) => round.assignments[p.id]?.roleId === r.id)
  );
  const hasJester = specialsInRound.some((r) => r.kind === "jester");
  const hasHelper = specialsInRound.some((r) => r.kind === "helper");

  if (!revealed) {
    return (
      <Screen>
        <View style={styles.center}>
          <Text style={styles.heading}>Point your fingers!</Text>
          <Text style={styles.instructions}>
            On three, everyone points at who they think the imposter is.
          </Text>
          <Text style={styles.instructions}>
            Accused of being the imposter? Try guessing the secret word out loud
            — if you nail it, you steal the win!
          </Text>
        </View>
        <View style={styles.bottom}>
          <BigButton label="Reveal the roles" onPress={() => setRevealed(true)} />
        </View>
      </Screen>
    );
  }

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.revealList} showsVerticalScrollIndicator={false}>
        <View style={styles.wordCard}>
          <Text style={styles.wordLabel}>The word was</Text>
          <Text style={styles.word}>{round.word}</Text>
        </View>

        {players.map((p) => {
          const role = roleFor(p.id);
          return (
            <View key={p.id} style={styles.playerRow}>
              <View style={[styles.playerDot, { backgroundColor: p.color }]} />
              <Text style={styles.playerName} numberOfLines={1}>
                {p.name}
              </Text>
              <View style={[styles.roleBadge, { backgroundColor: role.color }]}>
                <Text style={[styles.roleBadgeText, { color: textColorFor(role.color) }]}>
                  {role.name}
                </Text>
              </View>
            </View>
          );
        })}

        {hasJester ? (
          <Text style={styles.winNote}>🃏 Jester wins if the group voted THEM out.</Text>
        ) : null}
        {hasHelper ? (
          <Text style={styles.winNote}>
            🤝 Helper wins with the imposter — unless the helper was voted out.
          </Text>
        ) : null}
      </ScrollView>

      <View style={styles.bottom}>
        <BigButton label="New round" onPress={onNewRound} />
        <BigButton label="Back to menu" variant="ghost" onPress={onBackToMenu} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.md,
  },
  heading: {
    fontSize: 32,
    fontWeight: "900",
    color: colors.text,
    textAlign: "center",
  },
  instructions: {
    fontSize: 16,
    lineHeight: 24,
    color: colors.textDim,
    textAlign: "center",
    paddingHorizontal: spacing.md,
  },
  revealList: {
    gap: spacing.sm,
    paddingVertical: spacing.md,
  },
  wordCard: {
    backgroundColor: colors.card,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    alignItems: "center",
    gap: spacing.xs,
    marginBottom: spacing.sm,
  },
  wordLabel: {
    fontSize: 14,
    color: colors.textDim,
  },
  word: {
    fontSize: 36,
    fontWeight: "900",
    color: colors.word,
  },
  playerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    backgroundColor: colors.card,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.sm,
  },
  playerDot: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 2,
    borderColor: colors.border,
  },
  playerName: {
    flex: 1,
    fontSize: 18,
    fontWeight: "700",
    color: colors.text,
  },
  roleBadge: {
    borderRadius: radius.sm,
    paddingVertical: 6,
    paddingHorizontal: spacing.sm,
  },
  roleBadgeText: {
    fontSize: 14,
    fontWeight: "800",
  },
  winNote: {
    fontSize: 14,
    color: colors.textDim,
    textAlign: "center",
    marginTop: spacing.xs,
  },
  bottom: {
    gap: spacing.sm,
    paddingBottom: spacing.md,
  },
});
