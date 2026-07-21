import React, { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import BigButton from "../components/BigButton";
import Screen from "../components/Screen";
import { OddRound, Player } from "../game/types";
import { t, tf } from "../i18n";
import { colors, radius, spacing } from "../theme";

type Props = {
  players: Player[];
  round: OddRound;
  onNewRound: () => void;
  onBackToMenu: () => void;
};

export default function OddResultScreen({ players, round, onNewRound, onBackToMenu }: Props) {
  const [revealed, setRevealed] = useState(false);

  const oddPlayer = players.find((p) => p.id === round.oddPlayerId);

  if (!revealed) {
    return (
      <Screen>
        <View style={styles.center}>
          <Text style={styles.heading}>{t("pointFingers")}</Text>
          <Text style={styles.instructions}>{t("oddPointInstr")}</Text>
        </View>
        <View style={styles.bottom}>
          <BigButton label={t("revealOdd")} onPress={() => setRevealed(true)} />
        </View>
      </Screen>
    );
  }

  return (
    <Screen>
      <View style={styles.center}>
        <Text style={styles.revealLabel}>{t("oddWas")}</Text>
        <Text style={[styles.oddName, { color: oddPlayer?.color ?? colors.oddYellow }]}>
          {oddPlayer?.name}
        </Text>

        <View style={styles.wordsCard}>
          <View style={styles.wordRow}>
            <Text style={styles.wordLabel}>{t("everyoneHad")}</Text>
            <Text style={styles.wordValue}>{round.mainWord}</Text>
          </View>
          <View style={styles.wordDivider} />
          <View style={styles.wordRow}>
            <Text style={styles.wordLabel}>{tf("playerHad", { name: oddPlayer?.name ?? "" })}</Text>
            <Text style={[styles.wordValue, { color: colors.oddYellow }]}>{round.oddWord}</Text>
          </View>
        </View>
      </View>

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
  revealLabel: {
    fontSize: 18,
    color: colors.textDim,
  },
  oddName: {
    fontSize: 44,
    fontWeight: "900",
    textAlign: "center",
    // Soft glow so even very dark player colors stay readable.
    textShadowColor: "rgba(255,255,255,0.3)",
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 12,
  },
  wordsCard: {
    alignSelf: "stretch",
    backgroundColor: colors.card,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radius.md,
    padding: spacing.md,
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  wordRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  wordDivider: {
    height: 1,
    backgroundColor: colors.border,
  },
  wordLabel: {
    fontSize: 14,
    color: colors.textDim,
  },
  wordValue: {
    fontSize: 22,
    fontWeight: "900",
    color: colors.text,
  },
  bottom: {
    gap: spacing.sm,
    paddingBottom: spacing.md,
  },
});
