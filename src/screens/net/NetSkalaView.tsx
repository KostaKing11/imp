import React, { useEffect, useRef, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import BigButton from "../../components/BigButton";
import Dial from "../../components/Dial";
import PlayerCard from "../../components/PlayerCard";
import TextField from "../../components/TextField";
import { useScrollToInputOnKeyboard } from "../../components/useScrollToInput";
import WaitingOn from "../../components/WaitingOn";
import { t, tf } from "../../i18n";
import { NetCard, RoomState } from "../../net/protocol";
import { alpha, colors, radius, spacing, type } from "../../theme";

type Props = {
  state: RoomState;
  myId: string | null;
  card: NetCard | null;
  isHost: boolean;
  onClue: (text: string) => void;
  onGuess: (value: number) => void;
  onContinue: () => void;
};

// Skala on everyone's own phone. The caller's secret point never travels
// in the room state — it arrives on their private card and only appears
// for everybody once the round is scored.
export default function NetSkalaView({
  state,
  myId,
  card,
  isHost,
  onClue,
  onGuess,
  onContinue,
}: Props) {
  const [clue, setClue] = useState("");
  const [guess, setGuess] = useState(50);
  // The dial is tall; this keeps the clue box above the keyboard.
  const clueScroll = useRef<ScrollView>(null);
  useScrollToInputOnKeyboard(clueScroll);
  const skala = state.skala;

  // A fresh round wants a fresh box.
  useEffect(() => {
    setClue("");
    setGuess(50);
  }, [skala?.roundIndex]);

  if (!skala) return null;

  const byId = (id: string) => state.players.find((p) => p.id === id) ?? null;
  const giver = byId(skala.clueGiverId);
  const iAmGiver = myId === skala.clueGiverId;
  const tint = giver?.color ?? colors.accent;

  const header = (
    <>
      <Text style={styles.eyebrow}>
        {tf("skalaRoundOf", { n: skala.roundIndex + 1, total: skala.totalRounds })}
      </Text>
      {skala.clue ? (
        <View style={[styles.cluePill, { borderColor: alpha(tint, 0.6) }]}>
          <Text style={styles.clueLabel}>{tf("skalaSaid", { name: giver?.name ?? "" })}</Text>
          <Text style={[styles.clueText, { color: tint }]}>{skala.clue}</Text>
        </View>
      ) : null}
    </>
  );

  // ---- the caller writes a clue ----
  if (state.phase === "skalaClue") {
    if (!iAmGiver) {
      return (
        <View style={styles.center}>
          {header}
          <Text style={styles.waitBig}>{tf("skalaWaitingClue", { name: giver?.name ?? "" })}</Text>
        </View>
      );
    }
    return (
      <ScrollView
        ref={clueScroll}
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
      >
        {header}
        <Text style={styles.title}>{t("skalaYourTarget")}</Text>
        {/* No needle — the white marker already shows the exact point. */}
        <Dial
          value={card?.target ?? 50}
          left={skala.left}
          right={skala.right}
          target={card?.target ?? null}
          disabled
          hideNeedle
        />
        <Text style={styles.hint}>{t("skalaClueHint")}</Text>
        <TextField
          label={t("skalaClueLabel")}
          value={clue}
          onChangeText={setClue}
          placeholder={t("skalaCluePlaceholder")}
          // The dial above is tall enough to push the box under the keyboard.
        />
        <BigButton
          label={t("skalaLockClue")}
          tone={tint}
          disabled={clue.trim().length === 0}
          onPress={() => onClue(clue.trim())}
        />
      </ScrollView>
    );
  }

  // ---- everyone else turns the dial ----
  if (state.phase === "skalaGuess") {
    const guessers = state.players.filter((p) => p.inRound && p.id !== skala.clueGiverId);
    const done = Object.keys(skala.guesses).length;
    const counter = (
      <>
        <Text style={styles.counter}>
          {tf("skalaGuessedCount", { done, total: guessers.length })}
        </Text>
        {/* Who still has not turned their dial, by name. */}
        <WaitingOn people={guessers} doneIds={Object.keys(skala.guesses)} />
      </>
    );

    if (iAmGiver || (myId && skala.guesses[myId] !== undefined)) {
      return (
        <View style={styles.center}>
          {header}
          <Text style={styles.waitBig}>{t("waitingOthersVote")}</Text>
          {counter}
        </View>
      );
    }
    return (
      <ScrollView contentContainerStyle={styles.scroll}>
        {header}
        <Dial value={guess} onChange={setGuess} left={skala.left} right={skala.right} />
        <BigButton label={t("skalaLockGuess")} onPress={() => onGuess(guess)} />
        {counter}
      </ScrollView>
    );
  }

  // ---- the board opens ----
  const markers = Object.entries(skala.guesses).map(([playerId, v]) => ({
    key: playerId,
    value: v,
    color: byId(playerId)?.color ?? colors.textDim,
  }));
  const scored = Object.entries(skala.roundPoints ?? {}).sort((a, b) => b[1] - a[1]);
  const finished = state.phase === "results";

  return (
    <ScrollView contentContainerStyle={styles.scroll}>
      {finished ? (
        <Text style={styles.title}>{t("skalaFinalTitle")}</Text>
      ) : (
        <>
          {header}
          <Dial
            value={skala.target ?? 50}
            left={skala.left}
            right={skala.right}
            target={skala.target}
            markers={markers}
            hideNeedle
          />
        </>
      )}

      <View style={styles.list}>
        {finished
          ? [...state.players]
              .filter((p) => p.inRound)
              .sort((a, b) => (skala.scores[b.id] ?? 0) - (skala.scores[a.id] ?? 0))
              .map((p) => (
                <PlayerCard
                  key={p.id}
                  name={p.name}
                  color={p.color}
                  note={p.id === myId ? t("youTag") : null}
                  right={
                    <Text style={[styles.points, { color: p.color }]}>
                      {skala.scores[p.id] ?? 0}
                    </Text>
                  }
                />
              ))
          : scored.map(([playerId, points]) => {
              const p = byId(playerId);
              return p ? (
                <PlayerCard
                  key={playerId}
                  name={p.name}
                  color={p.color}
                  note={p.id === myId ? t("youTag") : null}
                  right={<Text style={[styles.points, { color: p.color }]}>+{points}</Text>}
                />
              ) : null;
            })}
      </View>

      {!finished && isHost ? (
        <BigButton label={t("continueBtn")} tone={tint} onPress={onContinue} />
      ) : !finished ? (
        <Text style={styles.counter}>{t("waitingForHost")}</Text>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: "center", justifyContent: "center", gap: spacing.sm },
  scroll: { gap: spacing.sm, paddingTop: spacing.md, paddingBottom: spacing.md },
  eyebrow: { ...type.eyebrow, color: colors.textFaint, textAlign: "center" },
  title: { ...type.title, fontSize: 24, color: colors.text, textAlign: "center" },
  hint: {
    ...type.caption,
    fontSize: 13,
    lineHeight: 20,
    color: colors.textDim,
    textAlign: "center",
  },
  waitBig: { ...type.body, color: colors.textDim, textAlign: "center" },
  cluePill: {
    alignSelf: "center",
    alignItems: "center",
    borderRadius: radius.lg,
    borderWidth: 1.5,
    backgroundColor: colors.card,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    gap: 2,
  },
  clueLabel: { ...type.eyebrow, fontSize: 11, color: colors.textFaint },
  clueText: { fontSize: 26, fontWeight: "900", textAlign: "center" },
  list: { gap: spacing.xs },
  points: { fontSize: 22, fontWeight: "900" },
  counter: { ...type.caption, fontSize: 13, color: colors.textFaint, textAlign: "center" },
});
