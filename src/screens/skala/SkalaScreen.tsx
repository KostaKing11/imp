import React, { useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import BigButton from "../../components/BigButton";
import Dial from "../../components/Dial";
import PlayerCard from "../../components/PlayerCard";
import Screen from "../../components/Screen";
import TextField from "../../components/TextField";
import { createSkalaRound, scoreSkalaRound, skalaIsOver, skalaWinners } from "../../game/skalaEngine";
import { Player, SkalaGame, SkalaRound, skalaPoints, SpectrumCategoryState } from "../../game/types";
import { t, tf } from "../../i18n";
import { alpha, colors, radius, spacing, type } from "../../theme";

type Props = {
  players: Player[];
  categories: SpectrumCategoryState[];
  game: SkalaGame;
  setGame: (game: SkalaGame) => void;
  onLeave: () => void;
  onDone: () => void;
};

// Pass-and-play Skala. One screen owns the whole mode: the clue giver
// sets the needle's secret, everyone else guesses in turn, then the
// board opens up and the points land.
type Phase = "handoff" | "clue" | "cards" | "guess" | "reveal" | "final";

export default function SkalaScreen({
  players,
  categories,
  game,
  setGame,
  onLeave,
  onDone,
}: Props) {
  const [phase, setPhase] = useState<Phase>("handoff");
  const [clue, setClue] = useState("");
  const [guess, setGuess] = useState(50);
  const [active, setActive] = useState<Player | null>(null);

  const byId = (id: string) => players.find((p) => p.id === id) ?? null;

  // Deal a round the first time we need one.
  const round: SkalaRound | null = useMemo(() => {
    if (game.round) return game.round;
    const next = createSkalaRound(game, categories);
    if (next) setGame({ ...game, round: next });
    return next;
  }, [game, categories, setGame]);

  if (!round) {
    return (
      <Screen>
        <View style={styles.center}>
          <Text style={styles.big}>{t("errNoSpectrums")}</Text>
          <BigButton label={t("backToMenu")} variant="secondary" onPress={onLeave} />
        </View>
      </Screen>
    );
  }

  const giver = byId(round.clueGiverId);
  const guessers = players.filter((p) => p.id !== round.clueGiverId);
  const tint = giver?.color ?? colors.accent;

  const roundLabel = tf("skalaRoundOf", {
    n: game.roundIndex + 1,
    total: game.order.length,
  });

  // ---- the clue giver ----
  if (phase === "handoff") {
    return (
      <Screen glow={tint}>
        {leaveButton(onLeave)}
        <View style={styles.center}>
          <Text style={styles.eyebrow}>{roundLabel}</Text>
          <Text style={styles.big}>{t("passPhoneTo")}</Text>
          <Text style={[styles.name, { color: tint }]}>{giver?.name ?? ""}</Text>
          <Text style={styles.hint}>{t("skalaGiverHint")}</Text>
          <BigButton
            label={tf("skalaImGiver", { name: giver?.name ?? "" })}
            tone={tint}
            onPress={() => setPhase("clue")}
          />
        </View>
      </Screen>
    );
  }

  if (phase === "clue") {
    return (
      <Screen glow={tint}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <Text style={styles.eyebrow}>{roundLabel}</Text>
          <Text style={styles.title}>{t("skalaYourTarget")}</Text>
          {/* The caller sees the wedges too, so they know how much room
              a near miss leaves. */}
          <Dial
            value={round.target}
            left={round.left}
            right={round.right}
            target={round.target}
            disabled
          />
          <Text style={styles.hint}>{t("skalaClueHint")}</Text>
          <TextField
            label={t("skalaClueLabel")}
            value={clue}
            onChangeText={setClue}
            placeholder={t("skalaCluePlaceholder")}
          />
          <BigButton
            label={t("skalaLockClue")}
            tone={tint}
            disabled={clue.trim().length === 0}
            onPress={() => {
              setGame({ ...game, round: { ...round, clue: clue.trim() } });
              setGuess(50);
              setPhase("cards");
            }}
          />
        </ScrollView>
      </Screen>
    );
  }

  // ---- one guesser's dial ----
  if (phase === "guess" && active) {
    return (
      <Screen glow={active.color}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <Text style={styles.eyebrow}>{tf("skalaGuessingAs", { name: active.name })}</Text>
          <View style={[styles.cluePill, { borderColor: alpha(tint, 0.6) }]}>
            <Text style={styles.clueLabel}>{tf("skalaSaid", { name: giver?.name ?? "" })}</Text>
            <Text style={[styles.clueText, { color: tint }]}>{round.clue}</Text>
          </View>
          <Dial value={guess} onChange={setGuess} left={round.left} right={round.right} />
          <BigButton
            label={t("skalaLockGuess")}
            tone={active.color}
            onPress={() => {
              setGame({
                ...game,
                round: { ...round, guesses: { ...round.guesses, [active.id]: guess } },
              });
              setActive(null);
              setPhase("cards");
            }}
          />
        </ScrollView>
      </Screen>
    );
  }

  // ---- the guessers' board, same shape as every other mode ----
  if (phase === "cards") {
    const allIn = guessers.every((p) => round.guesses[p.id] !== undefined);
    return (
      <Screen>
        {leaveButton(onLeave)}
        <Text style={styles.heading}>{t("skalaGuessTitle")}</Text>
        <View style={[styles.cluePill, { borderColor: alpha(tint, 0.6) }]}>
          <Text style={styles.clueLabel}>{tf("skalaSaid", { name: giver?.name ?? "" })}</Text>
          <Text style={[styles.clueText, { color: tint }]}>{round.clue}</Text>
        </View>

        <ScrollView contentContainerStyle={styles.cardList} showsVerticalScrollIndicator={false}>
          {guessers.map((p) => {
            const done = round.guesses[p.id] !== undefined;
            return (
              <PlayerCard
                key={p.id}
                name={p.name}
                color={p.color}
                note={done ? null : t("tapToReveal")}
                dimmed={done}
                disabled={done}
                onPress={() => {
                  setGuess(50);
                  setActive(p);
                  setPhase("guess");
                }}
                right={done ? <Text style={[styles.check, { color: p.color }]}>✓</Text> : null}
              />
            );
          })}
        </ScrollView>

        <View style={styles.bottom}>
          <BigButton
            label={t("everyonesReady")}
            disabled={!allIn}
            onPress={() => setPhase("reveal")}
          />
        </View>
      </Screen>
    );
  }

  // ---- the board opens ----
  if (phase === "reveal") {
    const markers = Object.entries(round.guesses).map(([playerId, v]) => ({
      key: playerId,
      value: v,
      color: byId(playerId)?.color ?? colors.textDim,
    }));
    const scored = Object.entries(round.guesses)
      .map(([playerId, v]) => ({
        player: byId(playerId),
        points: skalaPoints(v, round.target),
      }))
      .sort((a, b) => b.points - a.points);

    return (
      <Screen glow={tint}>
        <ScrollView contentContainerStyle={styles.scroll}>
          <Text style={styles.eyebrow}>{roundLabel}</Text>
          <View style={[styles.cluePill, { borderColor: alpha(tint, 0.6) }]}>
            <Text style={styles.clueLabel}>{tf("skalaSaid", { name: giver?.name ?? "" })}</Text>
            <Text style={[styles.clueText, { color: tint }]}>{round.clue}</Text>
          </View>
          <Dial
            value={round.target}
            left={round.left}
            right={round.right}
            target={round.target}
            markers={markers}
            hideNeedle
          />
          <View style={styles.scoreList}>
            {scored.map(({ player, points }) =>
              player ? (
                <PlayerCard
                  key={player.id}
                  name={player.name}
                  color={player.color}
                  right={<Text style={[styles.points, { color: player.color }]}>+{points}</Text>}
                />
              ) : null
            )}
          </View>
          <BigButton
            label={t("continueBtn")}
            tone={tint}
            onPress={() => {
              const next = scoreSkalaRound(game, round);
              setGame(next);
              setClue("");
              setActive(null);
              setPhase(skalaIsOver(next) ? "final" : "handoff");
            }}
          />
        </ScrollView>
      </Screen>
    );
  }

  // ---- the table ----
  const table = [...players].sort(
    (a, b) => (game.scores[b.id] ?? 0) - (game.scores[a.id] ?? 0)
  );
  const winners = skalaWinners(game);

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.title}>{t("skalaFinalTitle")}</Text>
        <View style={styles.scoreList}>
          {table.map((p) => (
            <PlayerCard
              key={p.id}
              name={p.name}
              color={p.color}
              selected={winners.includes(p.id)}
              badge={winners.includes(p.id) ? t("skalaWinnerTag") : null}
              right={<Text style={[styles.points, { color: p.color }]}>{game.scores[p.id] ?? 0}</Text>}
            />
          ))}
        </View>
        <BigButton label={t("newRoundBtn")} onPress={onDone} />
        <BigButton label={t("backToMenu")} variant="secondary" onPress={onLeave} />
      </ScrollView>
    </Screen>
  );
}

function leaveButton(onLeave: () => void) {
  return (
    <Pressable onPress={onLeave} hitSlop={10} style={styles.leaveButton}>
      <Text style={styles.leaveText}>✕</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
  },
  scroll: {
    gap: spacing.sm,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
  },
  eyebrow: {
    ...type.eyebrow,
    color: colors.textFaint,
    textAlign: "center",
  },
  title: {
    ...type.title,
    fontSize: 26,
    color: colors.text,
    textAlign: "center",
  },
  big: {
    ...type.body,
    color: colors.textDim,
    textAlign: "center",
  },
  name: {
    ...type.display,
    fontSize: 36,
    textAlign: "center",
  },
  hint: {
    ...type.caption,
    fontSize: 13,
    lineHeight: 20,
    color: colors.textDim,
    textAlign: "center",
  },
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
  clueLabel: {
    ...type.eyebrow,
    fontSize: 11,
    color: colors.textFaint,
  },
  clueText: {
    fontSize: 28,
    fontWeight: "900",
    textAlign: "center",
  },
  scoreList: {
    gap: spacing.xs,
  },
  cardList: { gap: spacing.xs, paddingTop: spacing.sm, paddingBottom: spacing.md },
  heading: {
    ...type.title,
    fontSize: 26,
    color: colors.text,
    textAlign: "center",
    marginTop: spacing.sm,
    marginBottom: spacing.xs,
  },
  check: { fontSize: 22, fontWeight: "900" },
  bottom: { paddingBottom: spacing.md },
  points: {
    fontSize: 22,
    fontWeight: "900",
  },
  leaveButton: {
    position: "absolute",
    top: spacing.sm,
    left: spacing.md,
    zIndex: 1,
    width: 40,
    height: 40,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.borderSoft,
    backgroundColor: colors.card,
    alignItems: "center",
    justifyContent: "center",
  },
  leaveText: { fontSize: 16, fontWeight: "700", color: colors.textDim },
});
