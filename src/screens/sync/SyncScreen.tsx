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
import Appear from "../../components/Appear";
import Confetti from "../../components/Confetti";
import BigButton from "../../components/BigButton";
import PlayerCard from "../../components/PlayerCard";
import Screen from "../../components/Screen";
import {
  acceptSyncMatch,
  resolveSyncRound,
  SYNC_MAX_ROUNDS,
  syncTargets,
  syncWordTaken,
} from "../../game/syncEngine";
import { Player, SyncGame } from "../../game/types";
import { roundsWord, t, tf } from "../../i18n";
import { alpha, colors, radius, spacing, type } from "../../theme";

type Props = {
  players: Player[];
  game: SyncGame;
  setGame: (game: SyncGame) => void;
  onLeave: () => void;
  // Leaving a finished game asks nothing — there is no round to lose.
  onQuit: () => void;
  onDone: () => void;
};

type Phase = "cards" | "reveal" | "won";

// Pass-and-play Uskladi se, laid out like every other mode: the whole
// roster is on screen, you tap your own card, hold it to read what you
// are reacting to, and type your word.
export default function SyncScreen({ players, game, setGame, onLeave, onQuit, onDone }: Props) {
  const [phase, setPhase] = useState<Phase>(game.winners ? "won" : "cards");
  const [pending, setPending] = useState<Record<string, string>>({});
  const [active, setActive] = useState<Player | null>(null);
  const [text, setText] = useState("");
  const [error, setError] = useState<string | null>(null);
  // Players the group decided all wrote the same thing.
  const [claim, setClaim] = useState<string[]>([]);

  const byId = (id: string) => players.find((p) => p.id === id) ?? null;
  const targets = syncTargets(game);
  const roundNo = game.history.length + 1;
  const allIn = players.every((p) => pending[p.id] !== undefined);

  const open = (player: Player) => {
    setText("");
    setError(null);
    setActive(player);
  };

  const lockIn = () => {
    if (!active) return;
    const word = text.trim();
    if (!word) return;
    // Only words from earlier rounds are blocked — matching somebody else
    // this round is exactly how the game is won.
    if (syncWordTaken(game, word)) {
      setError(t("syncTakenWord"));
      return;
    }
    setPending({ ...pending, [active.id]: word });
    setActive(null);
  };

  const finishRound = () => {
    const resolved = resolveSyncRound(game, pending);
    setGame(resolved);
    setPending({});
    setPhase(resolved.winners ? "won" : "reveal");
  };

  // ---- one player's turn ----
  // No card to hold: everyone is working from the same words, so there is
  // nothing here to hide from the person you are passing the phone to.
  // The only secret is what you type, and that is secret because you are
  // the one holding the phone. The prompt just reads as a prompt.
  if (active) {
    return (
      <Screen glow={active.color}>
        <KeyboardAvoidingView
          style={styles.turn}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          {/* The prompt takes whatever room is left and gives it up first
              when the keyboard arrives — so the box you are typing in
              never ends up underneath it. */}
          <ScrollView
            style={styles.promptScroll}
            contentContainerStyle={styles.promptArea}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <Text style={[styles.turnOwner, { color: active.color }]} numberOfLines={1}>
              {active.name}
            </Text>
            <Text style={styles.faceLabel}>
              {game.history.length === 0 ? t("syncSeedLabel") : t("syncBetweenLabel")}
            </Text>
            <View style={styles.targetWrap}>
              {targets.map((w, i) => (
                <Text key={`${w}-${i}`} style={[styles.targetText, { color: active.color }]}>
                  {w}
                </Text>
              ))}
            </View>
          </ScrollView>

          <View style={styles.cardBottom}>
            <TextInput
              style={[styles.input, { borderColor: alpha(active.color, 0.6) }]}
              value={text}
              onChangeText={(v) => {
                setText(v);
                setError(null);
              }}
              placeholder={t("syncPlaceholder")}
              placeholderTextColor={colors.textFaint}
              autoCapitalize="none"
              autoFocus
              selectionColor={active.color}
              returnKeyType="done"
              onSubmitEditing={lockIn}
            />
            {error ? <Text style={styles.error}>{error}</Text> : null}
            <BigButton
              label={t("syncLockWord")}
              tone={active.color}
              disabled={text.trim().length === 0}
              onPress={lockIn}
            />
          </View>
        </KeyboardAvoidingView>
      </Screen>
    );
  }

  // ---- the roster ----
  if (phase === "cards") {
    return (
      <Screen>
        {leaveButton(onLeave)}
        <Text style={styles.heading}>{tf("syncRoundN", { n: roundNo })}</Text>
        <Text style={styles.subheading}>
          {game.history.length === 0 ? t("syncSeedInstr") : t("syncBetweenInstr")}
        </Text>

        <ScrollView contentContainerStyle={styles.list} showsVerticalScrollIndicator={false}>
          {players.map((p, i) => {
            const done = pending[p.id] !== undefined;
            return (
              <Appear key={p.id} index={i}>
                <PlayerCard
                  name={p.name}
                  color={p.color}
                  note={done ? null : t("syncTapToWrite")}
                  dimmed={done}
                  disabled={done}
                  onPress={() => open(p)}
                  right={done ? <Text style={[styles.check, { color: p.color }]}>✓</Text> : null}
                />
              </Appear>
            );
          })}
        </ScrollView>

        <View style={styles.bottom}>
          <BigButton label={t("everyonesReady")} onPress={finishRound} disabled={!allIn} />
        </View>
      </Screen>
    );
  }

  // ---- nobody matched ----
  if (phase === "reveal") {
    const last = game.history[game.history.length - 1];
    const entries = Object.entries(last?.words ?? {});
    const outOfRounds = game.history.length >= SYNC_MAX_ROUNDS;

    return (
      <Screen>
        <ScrollView contentContainerStyle={styles.scroll}>
          <Text style={styles.eyebrow}>{tf("syncRoundN", { n: game.history.length })}</Text>
          <Text style={styles.title}>{t("syncNoMatch")}</Text>

          <View style={styles.list}>
            {entries.map(([playerId, w], i) => {
              const p = byId(playerId);
              const picked = claim.includes(playerId);
              return (
                <Appear key={playerId} index={i}>
                <Pressable
                  onPress={() =>
                    // Tap every word that means the same thing — two or ten.
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
                </Appear>
              );
            })}
          </View>

          {claim.length >= 2 ? (
            <BigButton
              label={t("syncSameThing")}
              variant="secondary"
              onPress={() => {
                setGame(acceptSyncMatch(game, claim, last?.words[claim[0]] ?? ""));
                setClaim([]);
                setPhase("won");
              }}
            />
          ) : (
            <Text style={styles.hint}>{t("syncSameThingHint")}</Text>
          )}

          <BigButton
            label={t("continueBtn")}
            onPress={() => {
              setClaim([]);
              setPhase("cards");
            }}
          />
          {outOfRounds ? (
            <BigButton label={t("syncGiveUp")} variant="secondary" onPress={onQuit} />
          ) : null}
        </ScrollView>
      </Screen>
    );
  }

  // ---- somebody matched ----
  const winnerIds = game.winners ?? [];
  const winners = winnerIds.map(byId).filter((p): p is Player => !!p);
  const tint = winners[0]?.color ?? colors.accent;
  const lastRound = game.history[game.history.length - 1];
  const finalWords = Object.entries(lastRound?.words ?? {});

  return (
    <Screen glow={tint}>
      <Confetti colors={winners.map((p) => p.color)} />
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.title}>{t("syncMatchedTitle")}</Text>
        <Text style={styles.body}>{t("syncMatchedOn")}</Text>
        <Text style={[styles.matched, { color: tint }]}>{game.matchedWord}</Text>
        <Text style={styles.hint}>{tf("syncTookRounds", { n: game.history.length, w: roundsWord(game.history.length) })}</Text>

        {/* Everything that was written this round, so the group can see
            whether anybody else was on the same word too. */}
        <Text style={styles.eyebrow}>{t("syncEveryoneSaid")}</Text>
        <View style={styles.list}>
          {finalWords.map(([playerId, w], i) => {
            const p = byId(playerId);
            const won = winnerIds.includes(playerId);
            return (
              <Appear key={playerId} index={i} delay={220}>
              <View
                style={[
                  styles.wordCard,
                  {
                    borderColor: won ? (p?.color ?? colors.border) : colors.borderSoft,
                    backgroundColor: alpha(p?.color ?? colors.card, won ? 0.18 : 0.06),
                  },
                ]}
              >
                <Text style={[styles.wordOwner, { color: p?.color }]}>
                  {p?.name}
                  {won ? `  ${t("syncWinnersTag")}` : ""}
                </Text>
                <Text style={styles.wordText}>{w}</Text>
              </View>
              </Appear>
            );
          })}
        </View>

        <BigButton label={t("newRoundBtn")} tone={tint} onPress={onDone} />
        <BigButton label={t("backToMenu")} variant="secondary" onPress={onQuit} />
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
  center: { flex: 1, alignItems: "center", justifyContent: "center", gap: spacing.sm },
  scroll: { gap: spacing.sm, paddingTop: spacing.lg, paddingBottom: spacing.md },
  turn: { flex: 1 },
  promptScroll: { flex: 1 },
  promptArea: {
    flexGrow: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.xs,
    paddingVertical: spacing.md,
  },
  turnOwner: { fontSize: 26, fontWeight: "900", marginBottom: spacing.sm },
  cardBottom: {
    paddingTop: spacing.sm,
    paddingBottom: spacing.xs,
    alignSelf: "stretch",
    justifyContent: "center",
    gap: spacing.xs,
  },
  heading: {
    ...type.title,
    fontSize: 28,
    color: colors.text,
    textAlign: "center",
    marginTop: spacing.sm,
  },
  subheading: {
    ...type.caption,
    fontSize: 14,
    color: colors.textDim,
    textAlign: "center",
    marginTop: spacing.xs,
    marginBottom: spacing.sm,
  },
  eyebrow: { ...type.eyebrow, color: colors.textFaint, textAlign: "center" },
  title: { ...type.title, fontSize: 26, color: colors.text, textAlign: "center" },
  body: { ...type.body, color: colors.textDim, textAlign: "center" },
  hint: {
    ...type.caption,
    fontSize: 13,
    lineHeight: 20,
    color: colors.textFaint,
    textAlign: "center",
  },
  error: { ...type.caption, fontSize: 13, color: colors.danger, textAlign: "center" },
  privacy: { ...type.caption, fontSize: 14, color: colors.textDim, textAlign: "center" },
  faceLabel: { ...type.eyebrow, fontSize: 12, color: colors.textFaint },
  targetWrap: { alignItems: "center", gap: spacing.xs },
  targetText: { fontSize: 38, fontWeight: "900", textAlign: "center", letterSpacing: -0.5 },
  input: {
    alignSelf: "stretch",
    backgroundColor: alpha(colors.bg, 0.55),
    borderWidth: 1.5,
    borderRadius: radius.md,
    color: colors.text,
    fontSize: 18,
    fontWeight: "700",
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: 14,
    ...Platform.select({ web: { outlineStyle: "none" } as object, default: {} }),
  },
  list: { gap: spacing.xs, paddingBottom: spacing.md },
  check: { fontSize: 22, fontWeight: "900" },
  bottom: { paddingBottom: spacing.md },
  wordCard: {
    borderRadius: radius.lg,
    borderWidth: 1.5,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  wordOwner: { ...type.caption, fontSize: 12 },
  wordText: { fontSize: 24, fontWeight: "900", color: colors.text },
  pressed: { opacity: 0.75 },
  matched: { ...type.display, fontSize: 42, textAlign: "center" },
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
