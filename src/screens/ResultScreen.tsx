import React, { useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import BigButton from "../components/BigButton";
import Screen from "../components/Screen";
import { CIVILIAN } from "../game/roles";
import { Player, RoleDef, Round } from "../game/types";
import { roleName, t } from "../i18n";
import { colors, radius, spacing } from "../theme";

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

  // Innocents stay unlisted — only special roles get revealed.
  // "Other roles" follow the roles list order: Jester, Helper, then
  // custom roles in the order they were added.
  const roleOrder = (p: Player) => roles.findIndex((r) => r.id === round.assignments[p.id]?.roleId);
  const specials = players.filter((p) => roleFor(p.id).kind !== "civilian");
  const imposters = specials.filter((p) => roleFor(p.id).kind === "imposter");
  const others = specials
    .filter((p) => roleFor(p.id).kind !== "imposter")
    .sort((a, b) => roleOrder(a) - roleOrder(b));

  if (!revealed) {
    return (
      <Screen>
        <View style={styles.center}>
          <Text style={styles.heading}>{t("pointFingers")}</Text>
          <Text style={styles.instructions}>{t("pointInstr")}</Text>
          <Text style={styles.instructions}>{t("guessInstr")}</Text>
        </View>
        <View style={styles.bottom}>
          <BigButton label={t("revealTheRoles")} onPress={() => setRevealed(true)} />
        </View>
      </Screen>
    );
  }

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.revealList} showsVerticalScrollIndicator={false}>
        <View style={styles.wordCard}>
          <Text style={styles.wordLabel}>{t("theWordWas")}</Text>
          <Text style={styles.word}>{round.word}</Text>
        </View>

        {/* the grand reveal */}
        <Text style={styles.revealLabel}>
          {imposters.length > 1 ? t("impostersWere") : t("imposterWas")}
        </Text>
        {imposters.map((p) => (
          <Text key={p.id} style={[styles.grandName, { color: p.color }]} numberOfLines={1}>
            {p.name}
          </Text>
        ))}

        {/* everyone else with a special role */}
        {others.length > 0 ? (
          <>
            <Text style={styles.sectionLabel}>{t("otherRoles")}</Text>
            {others.map((p) => {
              const role = roleFor(p.id);
              return (
                <View key={p.id} style={styles.playerRow}>
                  <Text style={[styles.playerName, { color: p.color }]} numberOfLines={1}>
                    {p.name}
                  </Text>
                  <View style={[styles.roleBadge, { borderColor: role.color }]}>
                    <Text style={[styles.roleBadgeText, { color: role.color }]}>
                      {roleName(role)}
                    </Text>
                  </View>
                </View>
              );
            })}
          </>
        ) : null}
      </ScrollView>

      <View style={styles.bottom}>
        <BigButton label={t("newRoundBtn")} onPress={onNewRound} />
        <BigButton label={t("backToMenu")} variant="ghost" onPress={onBackToMenu} />
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
    alignItems: "center",
    gap: spacing.sm,
    paddingVertical: spacing.md,
  },
  wordCard: {
    alignSelf: "stretch",
    backgroundColor: colors.card,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    alignItems: "center",
    gap: spacing.xs,
  },
  wordLabel: {
    fontSize: 14,
    color: colors.textDim,
  },
  word: {
    fontSize: 40,
    fontWeight: "900",
    color: colors.word,
    textAlign: "center",
  },
  revealLabel: {
    fontSize: 18,
    color: colors.textDim,
    marginTop: spacing.sm,
  },
  grandName: {
    fontSize: 44,
    fontWeight: "900",
    textAlign: "center",
    // Soft glow so even very dark player colors stay readable.
    textShadowColor: "rgba(255,255,255,0.3)",
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 12,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: "800",
    color: colors.textDim,
    textTransform: "uppercase",
    letterSpacing: 2,
    marginTop: spacing.md,
  },
  playerRow: {
    alignSelf: "stretch",
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
    fontSize: 19,
    fontWeight: "900",
  },
  roleBadge: {
    borderRadius: radius.sm,
    borderWidth: 2,
    paddingVertical: 5,
    paddingHorizontal: spacing.sm,
  },
  roleBadgeText: {
    fontSize: 14,
    fontWeight: "800",
  },
  bottom: {
    gap: spacing.sm,
    paddingBottom: spacing.md,
  },
});
