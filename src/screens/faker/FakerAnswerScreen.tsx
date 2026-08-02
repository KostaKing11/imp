import React, { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import BigButton from "../../components/BigButton";
import FlipCard from "../../components/FlipCard";
import PlayerCard from "../../components/PlayerCard";
import Screen from "../../components/Screen";
import { FakerAnswers, FakerRound, Player } from "../../game/types";
import { t } from "../../i18n";
import { colors, radius, spacing } from "../../theme";

export const FAKER_ANSWER_MAX = 50;

type Props = {
  players: Player[];
  round: FakerRound;
  onDone: (answers: FakerAnswers) => void;
  onLeave: () => void;
};

// Pass-and-play answering, laid out like every other mode: everyone taps
// their own card, holds it to read their question and types an answer.
// The card looks IDENTICAL for everyone — nothing gives the Faker away.
export default function FakerAnswerScreen({ players, round, onDone, onLeave }: Props) {
  const [answers, setAnswers] = useState<FakerAnswers>({});
  const [active, setActive] = useState<Player | null>(null);
  const [peeked, setPeeked] = useState(false);
  const [text, setText] = useState("");

  const allAnswered = players.every((p) => answers[p.id] !== undefined);

  const open = (player: Player) => {
    setPeeked(false);
    setText("");
    setActive(player);
  };

  const lockIn = () => {
    if (!active) return;
    setAnswers({ ...answers, [active.id]: text.trim() });
    setActive(null);
  };

  const questionFor = (player: Player) =>
    player.id === round.oddPlayerId ? round.oddQuestion : round.mainQuestion;

  if (active) {
    return (
      <Screen>
        <KeyboardAvoidingView
          style={styles.cardScreen}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <FlipCard
            name={active.name}
            color={active.color}
            faceColor={colors.accent}
            onPeeked={() => setPeeked(true)}
          >
            <Text style={styles.qLabel}>{t("fakerYourQuestion")}</Text>
            <Text style={styles.question}>{questionFor(active)}</Text>
          </FlipCard>

          <View style={styles.cardBottom}>
            {peeked ? (
              <>
                <TextInput
                  style={styles.input}
                  value={text}
                  onChangeText={setText}
                  placeholder={t("fakerAnswerPlaceholder")}
                  placeholderTextColor={colors.textDim}
                  maxLength={FAKER_ANSWER_MAX}
                  returnKeyType="done"
                  onSubmitEditing={() => text.trim() && lockIn()}
                />
                <BigButton
                  label={t("fakerLockIn")}
                  disabled={text.trim().length === 0}
                  onPress={lockIn}
                />
              </>
            ) : (
              <Text style={styles.privacy}>{t("nobodyLooking")}</Text>
            )}
          </View>
        </KeyboardAvoidingView>
      </Screen>
    );
  }

  return (
    <Screen>
      <Pressable onPress={onLeave} hitSlop={10} style={styles.leaveButton}>
        <Text style={styles.leaveText}>✕</Text>
      </Pressable>
      <Text style={styles.heading}>{t("whoAreYou")}</Text>
      <Text style={styles.subheading}>{t("fakerHandoutInstr")}</Text>

      <ScrollView contentContainerStyle={styles.list} showsVerticalScrollIndicator={false}>
        {players.map((p) => {
          const done = answers[p.id] !== undefined;
          return (
            <PlayerCard
              key={p.id}
              name={p.name}
              color={p.color}
              note={done ? null : t("tapToReveal")}
              dimmed={done}
              disabled={done}
              onPress={() => open(p)}
              right={done ? <Text style={[styles.check, { color: p.color }]}>✓</Text> : null}
            />
          );
        })}
      </ScrollView>

      <View style={styles.bottom}>
        <BigButton
          label={t("everyonesReady")}
          onPress={() => onDone(answers)}
          disabled={!allAnswered}
        />
      </View>

    </Screen>
  );
}

const styles = StyleSheet.create({
  // Screen already insets its content — see NetScreen's leaveButton.
  leaveButton: {
    position: "absolute",
    top: spacing.sm,
    left: 0,
    zIndex: 1,
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 1.5,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  leaveText: { fontSize: 17, fontWeight: "700", color: colors.textDim },
  heading: {
    fontSize: 28,
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
    marginBottom: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  list: { gap: spacing.xs, paddingBottom: spacing.md },
  check: { fontSize: 22, fontWeight: "900" },
  bottom: { paddingBottom: spacing.md },
  cardScreen: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  cardBottom: {
    marginTop: spacing.md,
    minHeight: 70,
    alignSelf: "stretch",
    justifyContent: "center",
    gap: spacing.sm,
  },
  qLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.textDim,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  question: {
    fontSize: 24,
    lineHeight: 32,
    fontWeight: "800",
    color: colors.text,
    textAlign: "center",
  },
  input: {
    backgroundColor: colors.chip,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    color: colors.text,
    fontSize: 18,
    paddingHorizontal: spacing.sm,
    paddingVertical: 12,
  },
  privacy: { fontSize: 14, color: colors.textDim, textAlign: "center" },
});
