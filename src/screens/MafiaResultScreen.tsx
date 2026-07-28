import React, { useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import BigButton from "../components/BigButton";
import Screen from "../components/Screen";
import { MAFIA_CIVILIAN } from "../game/roles";
import { MafiaRound, Player, RoleDef } from "../game/types";
import { roleName, t, tf } from "../i18n";
import { colors, radius, spacing } from "../theme";

type Props = {
  players: Player[];
  roles: RoleDef[];
  round: MafiaRound;
  onNewRound: () => void;
  onBackToMenu: () => void;
};

export default function MafiaResultScreen({
  players,
  roles,
  round,
  onNewRound,
  onBackToMenu,
}: Props) {
  const [revealed, setRevealed] = useState(false);

  const roleFor = (playerId: string): RoleDef => {
    const roleId = round.assignments[playerId];
    return roles.find((r) => r.id === roleId) ?? MAFIA_CIVILIAN;
  };

  // Civilians stay unlisted; evil roles get the grand reveal.
  // Both sections follow the roles list order: Mafia, Lady, then custom
  // bad guys — and Police, Doctor, Jester, then other good/neutral roles.
  const roleOrder = (p: Player) => roles.findIndex((r) => r.id === round.assignments[p.id]);
  const specials = players.filter((p) => roleFor(p.id).kind !== "civilian");
  const evil = specials
    .filter((p) => {
      const role = roleFor(p.id);
      return role.evil || role.kind === "mafia";
    })
    .sort((a, b) => roleOrder(a) - roleOrder(b));
  const others = specials
    .filter((p) => {
      const role = roleFor(p.id);
      return !role.evil && role.kind !== "mafia";
    })
    .sort((a, b) => roleOrder(a) - roleOrder(b));

  const narrator = players.find((p) => roleFor(p.id).kind === "narrator");

  if (!revealed) {
    return (
      <Screen>
        <View style={styles.center}>
          <Text style={styles.heading}>{t("gameStarted")}</Text>
          <Text style={styles.instructions}>{t("mafiaPlayInstr")}</Text>
          {narrator ? (
            <Text style={styles.instructions}>{tf("narratorLine", { name: narrator.name })}</Text>
          ) : null}
          <Text style={styles.instructions}>{t("whenOverReveal")}</Text>
        </View>
        <View style={styles.bottom}>
          <BigButton label={t("revealRolesBtn")} onPress={() => setRevealed(true)} />
        </View>
      </Screen>
    );
  }

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.revealList} showsVerticalScrollIndicator={false}>
        <Text style={styles.revealLabel}>{evil.length > 1 ? t("mafiaWere") : t("mafiaWas")}</Text>
        {evil.map((p) => {
          const role = roleFor(p.id);
          return (
            <View key={p.id} style={styles.evilBlock}>
              <Text style={[styles.grandName, { color: p.color }]} numberOfLines={1}>
                {p.name}
              </Text>
              <Text style={styles.grandRole}>{roleName(role)}</Text>
            </View>
          );
        })}
        {evil.length === 0 ? <Text style={styles.instructions}>{t("noEvil")}</Text> : null}

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
  revealLabel: {
    fontSize: 18,
    color: colors.textDim,
  },
  evilBlock: {
    alignItems: "center",
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
  grandRole: {
    fontSize: 15,
    fontWeight: "800",
    color: colors.textDim,
    marginTop: -2,
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
