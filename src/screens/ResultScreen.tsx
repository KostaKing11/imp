import React, { useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import Appear from "../components/Appear";
import BigButton from "../components/BigButton";
import Gradient from "../components/Gradient";
import Pop from "../components/Pop";
import Screen from "../components/Screen";
import { CIVILIAN } from "../game/roles";
import { Player, RoleDef, Round } from "../game/types";
import { roleName, t } from "../i18n";
import { alpha, colors, elevation, radius, spacing } from "../theme";

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
      <Screen glow={colors.party}>
        <View style={styles.center}>
          <Pop from={0.7}>
            <Text style={styles.heading}>{t("pointFingers")}</Text>
          </Pop>
          <Appear index={1}>
            <Text style={styles.instructions}>{t("pointInstr")}</Text>
          </Appear>
          <Appear index={2}>
            <Text style={styles.instructions}>{t("guessInstr")}</Text>
          </Appear>
        </View>
        <View style={styles.bottom}>
          <BigButton label={t("revealTheRoles")} onPress={() => setRevealed(true)} />
        </View>
      </Screen>
    );
  }

  return (
    // The room takes the first imposter's colour — the reveal is about
    // them, so the light is too.
    <Screen glow={imposters[0]?.color ?? colors.accent}>
      <ScrollView contentContainerStyle={styles.revealList} showsVerticalScrollIndicator={false}>
        <Appear>
          <View style={styles.wordCard}>
            <Gradient from={alpha(colors.word, 0.16)} to={alpha(colors.word, 0.02)} angle={0.85} />
            <Text style={styles.wordLabel}>{t("theWordWas")}</Text>
            <Text style={styles.word}>{round.word}</Text>
          </View>
        </Appear>

        {/* the grand reveal — the label first, then a beat, then the name,
            so everyone reads it at the same moment */}
        <Appear index={1}>
          <Text style={styles.revealLabel}>
            {imposters.length > 1 ? t("impostersWere") : t("imposterWas")}
          </Text>
        </Appear>
        {imposters.map((p, i) => (
          <Pop key={p.id} delay={420 + i * 260} from={0.5}>
            <Text style={[styles.grandName, { color: p.color }]} numberOfLines={1}>
              {p.name}
            </Text>
          </Pop>
        ))}

        {/* everyone else with a special role */}
        {others.length > 0 ? (
          <>
            <Text style={styles.sectionLabel}>{t("otherRoles")}</Text>
            {others.map((p, i) => {
              const role = roleFor(p.id);
              return (
                <Appear
                  key={p.id}
                  index={i}
                  delay={520 + imposters.length * 260}
                  style={styles.playerRowWrap}
                >
                  <View style={[styles.playerRow, { borderColor: alpha(p.color, 0.5) }]}>
                    <View style={[styles.playerDot, { backgroundColor: p.color }]} />
                    <Text style={[styles.playerName, { color: p.color }]} numberOfLines={1}>
                      {p.name}
                    </Text>
                    <View
                      style={[
                        styles.roleBadge,
                        { borderColor: role.color, backgroundColor: alpha(role.color, 0.14) },
                      ]}
                    >
                      <Text style={[styles.roleBadgeText, { color: role.color }]}>
                        {roleName(role)}
                      </Text>
                    </View>
                  </View>
                </Appear>
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
    backgroundColor: alpha(colors.card, 0.8),
    borderColor: alpha(colors.word, 0.35),
    borderWidth: 1.5,
    borderRadius: radius.lg,
    paddingVertical: spacing.md,
    alignItems: "center",
    gap: spacing.xs,
    overflow: "hidden",
    ...elevation.glow(colors.word),
  },
  wordLabel: {
    fontSize: 13,
    fontWeight: "800",
    letterSpacing: 1.2,
    textTransform: "uppercase",
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
  playerRowWrap: {
    alignSelf: "stretch",
  },
  playerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    backgroundColor: alpha(colors.card, 0.8),
    borderRadius: radius.md,
    borderWidth: 1.5,
    padding: spacing.sm,
  },
  playerDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
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
