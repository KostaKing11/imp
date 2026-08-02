import React, { useEffect, useRef, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import BigButton from "../../components/BigButton";
import TextField from "../../components/TextField";
import { useScrollToInputOnKeyboard } from "../../components/useScrollToInput";
import WaitingOn from "../../components/WaitingOn";
import { roundsWord, t, tf } from "../../i18n";
import { RoomState } from "../../net/protocol";
import { alpha, colors, radius, spacing, type } from "../../theme";

type Props = {
  state: RoomState;
  myId: string | null;
  isHost: boolean;
  onWord: (text: string) => void;
  onContinue: () => void;
  onAcceptMatch: (playerIds: string[], word: string) => void;
};

// Uskladi se on everyone's own phone. Words are held back until the last
// one lands, then they all turn over together.
export default function NetSyncView({
  state,
  myId,
  isHost,
  onWord,
  onContinue,
  onAcceptMatch,
}: Props) {
  const [word, setWord] = useState("");
  const [claim, setClaim] = useState<string[]>([]);
  // Keeps the box above the keyboard once it is actually up.
  const wordScroll = useRef<ScrollView>(null);
  useScrollToInputOnKeyboard(wordScroll);
  const sync = state.sync;

  useEffect(() => {
    setWord("");
    setClaim([]);
  }, [sync?.roundNo, state.phase]);

  if (!sync) return null;

  const byId = (id: string) => state.players.find((p) => p.id === id) ?? null;
  const inRound = state.players.filter((p) => p.inRound && p.connected);

  // ---- writing ----
  if (state.phase === "syncWrite") {
    const mine = myId ? state.answeredIds.includes(myId) : false;
    // The count says the room is not moving; the names say who to look at.
    const counter = (
      <>
        <Text style={styles.counter}>
          {tf("skalaGuessedCount", { done: state.answeredIds.length, total: inRound.length })}
        </Text>
        <WaitingOn people={inRound} doneIds={state.answeredIds} />
      </>
    );

    if (mine) {
      return (
        <View style={styles.center}>
          <Text style={styles.eyebrow}>{tf("syncRoundN", { n: sync.roundNo })}</Text>
          <Text style={styles.waitBig}>{t("waitingOthersVote")}</Text>
          {counter}
        </View>
      );
    }

    return (
      <ScrollView
        ref={wordScroll}
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.eyebrow}>{tf("syncRoundN", { n: sync.roundNo })}</Text>
        <Text style={styles.label}>
          {sync.roundNo === 1 ? t("syncSeedLabel") : t("syncBetweenLabel")}
        </Text>
        {/* word · word — the dot reads as "between these two". */}
        <View style={styles.targetWrap}>
          {sync.targets.map((w, i) => (
            <React.Fragment key={`${w}-${i}`}>
              {i > 0 ? <Text style={styles.targetDot}>·</Text> : null}
              <Text style={styles.targetText}>{w}</Text>
            </React.Fragment>
          ))}
        </View>

        <TextField
          label={t("syncYourWord")}
          value={word}
          onChangeText={setWord}
          placeholder={t("syncPlaceholder")}
          autoCapitalize="none"
        />
        <Text style={styles.hint}>{t("syncNoRepeatHint")}</Text>
        <BigButton
          label={t("syncLockWord")}
          disabled={word.trim().length === 0}
          onPress={() => onWord(word.trim())}
        />
        {counter}
      </ScrollView>
    );
  }

  // ---- the words turn over ----
  const words = Object.entries(sync.words ?? {});
  const winners = (sync.winners ?? []).map(byId).filter((p): p is NonNullable<typeof p> => !!p);

  if (winners.length > 0) {
    const tint = winners[0].color;
    return (
      <View style={styles.center}>
        <Text style={styles.title}>{t("syncMatchedTitle")}</Text>
        <Text style={styles.waitBig}>{t("syncMatchedOn")}</Text>
        <Text style={[styles.matched, { color: tint }]}>{sync.matchedWord}</Text>
        <View style={styles.winnerRow}>
          {winners.map((p) => (
            <View key={p.id} style={[styles.winnerPill, { borderColor: p.color }]}>
              <Text style={[styles.winnerText, { color: p.color }]}>{p.name}</Text>
            </View>
          ))}
        </View>
        <Text style={styles.hint}>{tf("syncTookRounds", { n: sync.roundNo, w: roundsWord(sync.roundNo) })}</Text>
        {state.phase !== "results" ? (
          isHost ? (
            <BigButton label={t("continueBtn")} tone={tint} onPress={onContinue} />
          ) : (
            <Text style={styles.counter}>{t("waitingForHost")}</Text>
          )
        ) : null}
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.scroll}>
      <Text style={styles.eyebrow}>{tf("syncRoundN", { n: sync.roundNo })}</Text>
      <Text style={styles.title}>{t("syncNoMatch")}</Text>

      <View style={styles.list}>
        {words.map(([playerId, w]) => {
          const p = byId(playerId);
          const picked = claim.includes(playerId);
          return (
            <Pressable
              key={playerId}
              disabled={!isHost}
              onPress={() =>
                setClaim((prev) =>
                  prev.includes(playerId)
                    ? prev.filter((x) => x !== playerId)
                    : [...prev, playerId]
                )
              }
              style={({ pressed }) => [
                styles.wordCard,
                {
                  borderColor: p?.color ?? colors.border,
                  backgroundColor: alpha(p?.color ?? colors.card, picked ? 0.22 : 0.08),
                },
                pressed && styles.pressed,
              ]}
            >
              <Text style={[styles.wordOwner, { color: p?.color }]}>{p?.name}</Text>
              <Text style={styles.wordText}>{w}</Text>
            </Pressable>
          );
        })}
      </View>

      {isHost ? (
        <>
          {claim.length >= 2 ? (
            <BigButton
              label={t("syncSameThing")}
              variant="secondary"
              onPress={() => onAcceptMatch(claim, sync.words?.[claim[0]] ?? "")}
            />
          ) : (
            <Text style={styles.hint}>{t("syncSameThingHint")}</Text>
          )}
          <BigButton label={t("continueBtn")} onPress={onContinue} />
        </>
      ) : (
        <Text style={styles.counter}>{t("waitingForHost")}</Text>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: "center", justifyContent: "center", gap: spacing.sm },
  scroll: { gap: spacing.sm, paddingTop: spacing.md, paddingBottom: spacing.md },
  eyebrow: { ...type.eyebrow, color: colors.textFaint, textAlign: "center" },
  label: { ...type.eyebrow, color: colors.textDim, textAlign: "center" },
  title: { ...type.title, fontSize: 24, color: colors.text, textAlign: "center" },
  waitBig: { ...type.body, color: colors.textDim, textAlign: "center" },
  hint: {
    ...type.caption,
    fontSize: 13,
    lineHeight: 20,
    color: colors.textFaint,
    textAlign: "center",
  },
  counter: { ...type.caption, fontSize: 13, color: colors.textFaint, textAlign: "center" },
  targetWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    gap: spacing.sm,
    justifyContent: "center",
  },
  targetText: { fontSize: 30, fontWeight: "900", color: colors.text, letterSpacing: -0.4 },
  targetDot: { fontSize: 26, fontWeight: "900", color: colors.textFaint },
  list: { gap: spacing.xs },
  wordCard: {
    borderRadius: radius.lg,
    borderWidth: 1.5,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  wordOwner: { ...type.caption, fontSize: 12 },
  wordText: { fontSize: 24, fontWeight: "900", color: colors.text },
  pressed: { opacity: 0.75 },
  matched: { ...type.display, fontSize: 40, textAlign: "center" },
  winnerRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.xs,
    justifyContent: "center",
  },
  winnerPill: {
    borderRadius: radius.pill,
    borderWidth: 1.5,
    paddingVertical: 8,
    paddingHorizontal: spacing.sm + 2,
  },
  winnerText: { fontSize: 16, fontWeight: "800" },
});
