import React, { useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import BigButton from "../../components/BigButton";
import Screen from "../../components/Screen";
import { FakerRound, Player } from "../../game/types";
import { t } from "../../i18n";
import { colors, radius, spacing } from "../../theme";

type Props = {
  players: Player[];
  round: FakerRound;
  onNewRound: () => void;
  onBackToMenu: () => void;
};

// One-phone results: point fingers out loud first, then reveal the
// Faker and both questions. (In-app voting exists only in the
// everyone-has-their-phone mode.)
export default function FakerResultScreen({ players, round, onNewRound, onBackToMenu }: Props) {
  const [revealed, setRevealed] = useState(false);

  const oddPlayer = players.find((p) => p.id === round.oddPlayerId);

  if (!revealed) {
    return (
      <Screen>
        <View style={styles.center}>
          <Text style={styles.heading}>{t("pointFingers")}</Text>
          <Text style={styles.instructions}>{t("fakerPointInstr")}</Text>
        </View>
        <View style={styles.bottom}>
          <BigButton label={t("fakerRevealFaker")} onPress={() => setRevealed(true)} />
        </View>
      </Screen>
    );
  }

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.revealList} showsVerticalScrollIndicator={false}>
        <Text style={styles.revealLabel}>{t("fakerWas")}</Text>
        <Text
          style={[styles.grandName, { color: oddPlayer?.color ?? colors.accent }]}
          numberOfLines={1}
        >
          {oddPlayer?.name}
        </Text>

        {/* both questions, side by side */}
        <View style={styles.questionsCard}>
          <Text style={styles.qLabel}>{t("fakerMainQLabel")}</Text>
          <Text style={styles.qText}>{round.mainQuestion}</Text>
          <View style={styles.qDivider} />
          <Text style={styles.qLabel}>{t("fakerOddQLabel")}</Text>
          <Text style={[styles.qText, styles.qTextOdd]}>{round.oddQuestion}</Text>
        </View>
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
    flexGrow: 1,
    justifyContent: "center",
  },
  revealLabel: {
    fontSize: 18,
    color: colors.textDim,
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
  questionsCard: {
    alignSelf: "stretch",
    backgroundColor: colors.card,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radius.md,
    padding: spacing.md,
    gap: spacing.xs,
    marginTop: spacing.sm,
  },
  qLabel: {
    fontSize: 12,
    fontWeight: "800",
    color: colors.textDim,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  qText: {
    fontSize: 17,
    lineHeight: 24,
    fontWeight: "700",
    color: colors.text,
  },
  qTextOdd: {
    color: colors.word,
  },
  qDivider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.xs,
  },
  bottom: {
    gap: spacing.sm,
    paddingBottom: spacing.md,
  },
});
