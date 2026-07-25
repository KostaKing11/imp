import React, { useRef, useState } from "react";
import {
  Animated,
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
import Screen from "../../components/Screen";
import { FakerAnswers, FakerRound, Player } from "../../game/types";
import { t, tf } from "../../i18n";
import { colors, radius, spacing } from "../../theme";
import { textColorFor } from "../../utils";

export const FAKER_ANSWER_MAX = 50;

type Props = {
  players: Player[];
  round: FakerRound;
  onDone: (answers: FakerAnswers) => void;
  onLeave: () => void;
};

// Pass-and-play answering. Each player flips their card (hold to reveal,
// like the other modes) to read their question; once they let go, the
// answer box appears. The layout is IDENTICAL for everyone — the Faker's
// screen gives no hint that their question is the odd one.
export default function FakerAnswerScreen({ players, round, onDone, onLeave }: Props) {
  const [index, setIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [peeked, setPeeked] = useState(false);
  const [holding, setHolding] = useState(false);
  const [text, setText] = useState("");
  const [answers, setAnswers] = useState<FakerAnswers>({});
  const flip = useRef(new Animated.Value(0)).current;

  const player = players[index];
  const isLast = index === players.length - 1;
  const question =
    player.id === round.oddPlayerId ? round.oddQuestion : round.mainQuestion;

  const pressIn = () => {
    setHolding(true);
    setPeeked(true);
    Animated.spring(flip, { toValue: 1, friction: 8, useNativeDriver: true }).start();
  };

  const pressOut = () => {
    setHolding(false);
    Animated.spring(flip, { toValue: 0, friction: 8, useNativeDriver: true }).start();
  };

  const lockIn = () => {
    const next = { ...answers, [player.id]: text.trim() };
    if (isLast) {
      onDone(next);
    } else {
      setAnswers(next);
      setText("");
      setPeeked(false);
      setHolding(false);
      flip.setValue(0);
      setRevealed(false);
      setIndex(index + 1);
    }
  };

  const frontRotate = flip.interpolate({ inputRange: [0, 1], outputRange: ["0deg", "180deg"] });
  const backRotate = flip.interpolate({ inputRange: [0, 1], outputRange: ["180deg", "360deg"] });

  return (
    <Screen>
      <Pressable onPress={onLeave} hitSlop={10} style={styles.leaveButton}>
        <Text style={styles.leaveText}>✕</Text>
      </Pressable>

      {!revealed ? (
        <>
          <View style={styles.center}>
            <Text style={styles.passLabel}>{t("passPhoneTo")}</Text>
            <Text style={styles.playerName}>{player.name}</Text>
            <Text style={styles.privacy}>{t("nobodyLooking")}</Text>
          </View>
          <View style={styles.bottom}>
            <BigButton
              label={tf("fakerTapQuestion", { name: player.name })}
              onPress={() => setRevealed(true)}
            />
          </View>
        </>
      ) : (
        <KeyboardAvoidingView
          style={styles.flex}
          behavior="padding"
          keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 24}
        >
          <ScrollView
            contentContainerStyle={styles.cardArea}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <Text style={styles.cardOwner}>{player.name}</Text>
            <Text style={styles.cardInstruction}>
              {peeked && !holding ? " " : t("holdCardInstr")}
            </Text>

            {/* the flip card — question on the back */}
            <Pressable onPressIn={pressIn} onPressOut={pressOut} style={styles.card}>
              <Animated.View
                style={[
                  styles.cardFace,
                  { backgroundColor: player.color },
                  { transform: [{ perspective: 1200 }, { rotateY: frontRotate }] },
                ]}
              >
                <Text style={[styles.cardBackLogo, { color: textColorFor(player.color) }]}>
                  IMP
                </Text>
                <Text style={[styles.cardBackHint, { color: textColorFor(player.color) }]}>
                  {t("holdToReveal")}
                </Text>
              </Animated.View>
              <Animated.View
                style={[
                  styles.cardFace,
                  styles.questionFace,
                  { transform: [{ perspective: 1200 }, { rotateY: backRotate }] },
                ]}
              >
                <Text style={styles.questionLabel}>{t("fakerYourQuestion")}</Text>
                <Text style={styles.question}>{question}</Text>
              </Animated.View>
            </Pressable>

            {/* once they've seen the question, the answer box appears */}
            {peeked && !holding ? (
              <>
                <TextInput
                  style={styles.input}
                  value={text}
                  onChangeText={setText}
                  placeholder={t("fakerAnswerPlaceholder")}
                  placeholderTextColor={colors.textDim}
                  maxLength={FAKER_ANSWER_MAX}
                  autoFocus
                />
                <Text style={styles.charCount}>
                  {text.length}/{FAKER_ANSWER_MAX}
                </Text>
              </>
            ) : null}
          </ScrollView>

          {peeked && !holding ? (
            <View style={styles.bottom}>
              <BigButton
                label={t("fakerLockIn")}
                disabled={text.trim().length === 0}
                onPress={lockIn}
              />
            </View>
          ) : (
            <Text style={styles.privacyBottom}>{t("nobodyLooking")}</Text>
          )}
        </KeyboardAvoidingView>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
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
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.xs,
  },
  passLabel: {
    fontSize: 20,
    color: colors.textDim,
  },
  playerName: {
    fontSize: 44,
    fontWeight: "900",
    color: colors.text,
    textAlign: "center",
  },
  privacy: {
    fontSize: 14,
    color: colors.textDim,
    marginTop: spacing.sm,
  },
  privacyBottom: {
    fontSize: 14,
    color: colors.textDim,
    textAlign: "center",
    paddingBottom: spacing.md,
  },
  cardArea: {
    flexGrow: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    paddingTop: spacing.xl,
    paddingBottom: spacing.md,
  },
  cardOwner: {
    fontSize: 24,
    fontWeight: "900",
    color: colors.text,
  },
  cardInstruction: {
    fontSize: 14,
    color: colors.textDim,
  },
  card: {
    width: "88%",
    aspectRatio: 1.25,
  },
  cardFace: {
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
    fontSize: 48,
    fontWeight: "900",
    letterSpacing: 4,
  },
  cardBackHint: {
    fontSize: 13,
    fontWeight: "700",
    letterSpacing: 3,
    marginTop: spacing.sm,
  },
  questionFace: {
    backgroundColor: colors.card,
    borderColor: colors.accent,
    gap: spacing.xs,
  },
  questionLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.textDim,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  question: {
    fontSize: 21,
    lineHeight: 29,
    fontWeight: "800",
    color: colors.text,
    textAlign: "center",
  },
  input: {
    alignSelf: "stretch",
    backgroundColor: colors.chip,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    color: colors.text,
    fontSize: 18,
    paddingHorizontal: spacing.sm,
    paddingVertical: 12,
  },
  charCount: {
    alignSelf: "flex-end",
    fontSize: 12,
    color: colors.textDim,
  },
  bottom: {
    paddingBottom: spacing.md,
  },
});
