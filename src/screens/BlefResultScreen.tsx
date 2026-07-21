import React, { useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import BigButton from "../components/BigButton";
import Screen from "../components/Screen";
import { BlefRound, Player } from "../game/types";
import { t } from "../i18n";
import { colors, radius, spacing } from "../theme";
import { capitalize } from "../utils";

type Props = {
  players: Player[];
  round: BlefRound;
  onNewRound: () => void;
  onBackToMenu: () => void;
};

// Same shape as the other modes: call the vote out loud, then reveal
// the word and what each player was actually holding.
export default function BlefResultScreen({
  players,
  round,
  onNewRound,
  onBackToMenu,
}: Props) {
  const [revealed, setRevealed] = useState(false);

  if (!revealed) {
    return (
      <Screen>
        <View style={styles.center}>
          <Text style={styles.heading}>{t("pointFingers")}</Text>
          <Text style={styles.instructions}>{t("blefPointInstr")}</Text>
        </View>
        <View style={styles.bottom}>
          <BigButton label={t("blefRevealBtn")} onPress={() => setRevealed(true)} />
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

        {players.map((p) => {
          const clue = round.clues[p.id];
          return (
            <View key={p.id} style={styles.playerCard}>
              <Text style={[styles.playerName, { color: p.color }]} numberOfLines={1}>
                {p.name}
              </Text>
              <Text style={styles.hadLabel}>
                {clue?.isWord ? t("blefHadWord") : t("blefHadHint")}
              </Text>
              <Text style={[styles.hadValue, clue?.isWord && styles.hadValueWord]}>
                {capitalize(clue?.text ?? "")}
              </Text>
            </View>
          );
        })}
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
  playerCard: {
    alignSelf: "stretch",
    backgroundColor: colors.card,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radius.md,
    padding: spacing.md,
    gap: 2,
    alignItems: "center",
  },
  playerName: {
    fontSize: 26,
    fontWeight: "900",
    textAlign: "center",
  },
  hadLabel: {
    fontSize: 13,
    color: colors.textDim,
  },
  hadValue: {
    fontSize: 26,
    fontWeight: "800",
    color: colors.blefTeal,
    textAlign: "center",
  },
  hadValueWord: {
    color: colors.word,
  },
  bottom: {
    gap: spacing.sm,
    paddingBottom: spacing.md,
  },
});
