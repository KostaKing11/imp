import React, { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import BigButton from "../../components/BigButton";
import Screen from "../../components/Screen";
import { FakerAnswers, Player } from "../../game/types";
import { t } from "../../i18n";
import { colors, radius, spacing } from "../../theme";
import { textColorFor } from "../../utils";

type Props = {
  players: Player[];
  answers: FakerAnswers;
  // The question everyone (except the Faker) got — revealed first.
  question: string;
  onReveal: () => void;
  onLeave: () => void;
};

// First the shared question goes up on screen, then the answers next to
// it — read them out loud and argue. On one phone there's no in-app
// voting: point fingers IRL, then reveal the Faker.
export default function FakerAnswersScreen({
  players,
  answers,
  question,
  onReveal,
  onLeave,
}: Props) {
  const [shown, setShown] = useState(false);

  const leaveButton = (
    <Pressable onPress={onLeave} hitSlop={10} style={styles.leaveButton}>
      <Text style={styles.leaveText}>✕</Text>
    </Pressable>
  );

  if (!shown) {
    return (
      <Screen>
        {leaveButton}
        <Text style={styles.heading}>{t("theQuestionWas")}</Text>
        <Text style={styles.subheading}>{t("questionFirstInstr")}</Text>
        <View style={styles.center}>
          <View style={styles.questionCard}>
            <Text style={styles.question}>{question}</Text>
          </View>
        </View>
        <View style={styles.bottom}>
          <BigButton label={t("showAnswersBtn")} onPress={() => setShown(true)} />
        </View>
      </Screen>
    );
  }

  return (
    <Screen>
      {leaveButton}

      <Text style={styles.heading}>{t("fakerAnswersTitle")}</Text>
      <Text style={styles.subheading}>{t("fakerAnswersInstr")}</Text>

      <ScrollView contentContainerStyle={styles.list} showsVerticalScrollIndicator={false}>
        <View style={styles.questionPill}>
          <Text style={styles.questionPillText}>{question}</Text>
        </View>
        {players.map((p) => (
          <View key={p.id} style={styles.answerCard}>
            <View style={[styles.nameChip, { backgroundColor: p.color }]}>
              <Text style={[styles.nameText, { color: textColorFor(p.color) }]} numberOfLines={1}>
                {p.name}
              </Text>
            </View>
            <Text style={styles.answer}>{answers[p.id] || "—"}</Text>
          </View>
        ))}
      </ScrollView>

      <View style={styles.bottom}>
        <BigButton label={t("fakerRevealFaker")} onPress={onReveal} />
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
    paddingHorizontal: spacing.md,
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  questionCard: {
    alignSelf: "stretch",
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    borderWidth: 2,
    borderColor: colors.accent,
    padding: spacing.md,
  },
  question: {
    fontSize: 22,
    lineHeight: 30,
    fontWeight: "800",
    color: colors.text,
    textAlign: "center",
  },
  questionPill: {
    backgroundColor: colors.chip,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.sm,
  },
  questionPillText: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.textDim,
    textAlign: "center",
  },
  list: {
    gap: spacing.sm,
    paddingBottom: spacing.md,
  },
  answerCard: {
    backgroundColor: colors.card,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.sm,
    gap: spacing.xs,
  },
  nameChip: {
    alignSelf: "flex-start",
    borderRadius: radius.sm,
    paddingVertical: 4,
    paddingHorizontal: 10,
  },
  nameText: {
    fontSize: 14,
    fontWeight: "800",
  },
  answer: {
    fontSize: 20,
    fontWeight: "700",
    color: colors.text,
    paddingHorizontal: 2,
  },
  bottom: {
    paddingBottom: spacing.md,
  },
});
