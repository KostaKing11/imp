import React, { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import BigButton from "../../components/BigButton";
import Screen from "../../components/Screen";
import TextField from "../../components/TextField";
import {
  resolveSyncRound,
  syncTargets,
  syncWordTaken,
  SYNC_MAX_ROUNDS,
  acceptSyncMatch,
} from "../../game/syncEngine";
import { Player, SyncGame } from "../../game/types";
import { t, tf } from "../../i18n";
import { alpha, colors, radius, spacing, type } from "../../theme";

type Props = {
  players: Player[];
  game: SyncGame;
  setGame: (game: SyncGame) => void;
  onLeave: () => void;
  onDone: () => void;
};

type Phase = "handoff" | "write" | "reveal" | "won";

// Pass-and-play Uskladi se. Everyone secretly writes a word, they all
// turn over at once, and the first two people to land on the same word
// take it.
export default function SyncScreen({ players, game, setGame, onLeave, onDone }: Props) {
  const [phase, setPhase] = useState<Phase>(game.winners ? "won" : "handoff");
  const [index, setIndex] = useState(0);
  const [word, setWord] = useState("");
  const [pending, setPending] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);
  // Two words the players decided mean the same thing.
  const [claim, setClaim] = useState<[string, string] | null>(null);

  const byId = (id: string) => players.find((p) => p.id === id) ?? null;
  const current = players[index] ?? null;
  const targets = syncTargets(game);
  const roundNo = game.history.length + 1;

  const submit = () => {
    if (!current) return;
    const trimmed = word.trim();
    if (!trimmed) return;
    if (syncWordTaken(game, trimmed) || Object.values(pending).some((w) => w === trimmed)) {
      setError(t("syncTakenWord"));
      return;
    }
    const next = { ...pending, [current.id]: trimmed };
    setPending(next);
    setWord("");
    setError(null);
    if (index + 1 < players.length) {
      setIndex(index + 1);
      setPhase("handoff");
    } else {
      const resolved = resolveSyncRound(game, next);
      setGame(resolved);
      setPhase(resolved.winners ? "won" : "reveal");
    }
  };

  // ---- pass the phone ----
  if (phase === "handoff" && current) {
    return (
      <Screen glow={current.color}>
        {leaveButton(onLeave)}
        <View style={styles.center}>
          <Text style={styles.eyebrow}>{tf("syncRoundN", { n: roundNo })}</Text>
          <Text style={styles.body}>{t("passPhoneTo")}</Text>
          <Text style={[styles.name, { color: current.color }]}>{current.name}</Text>
          <BigButton
            label={tf("syncImPlayer", { name: current.name })}
            tone={current.color}
            onPress={() => {
              setWord("");
              setError(null);
              setPhase("write");
            }}
          />
        </View>
      </Screen>
    );
  }

  // ---- write your word ----
  if (phase === "write" && current) {
    return (
      <Screen glow={current.color}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <Text style={styles.eyebrow}>{tf("syncRoundN", { n: roundNo })}</Text>
          <Text style={styles.label}>
            {game.history.length === 0 ? t("syncSeedLabel") : t("syncBetweenLabel")}
          </Text>
          <View style={styles.targetWrap}>
            {targets.map((w, i) => (
              <View key={`${w}-${i}`} style={styles.targetPill}>
                <Text style={styles.targetText}>{w}</Text>
              </View>
            ))}
          </View>

          <TextField
            label={t("syncYourWord")}
            value={word}
            onChangeText={(v) => {
              setWord(v);
              setError(null);
            }}
            placeholder={t("syncPlaceholder")}
            autoCapitalize="none"
          />
          {error ? <Text style={styles.error}>{error}</Text> : null}
          <Text style={styles.hint}>{t("nobodyLooking")}</Text>

          <BigButton
            label={t("syncLockWord")}
            tone={current.color}
            disabled={word.trim().length === 0}
            onPress={submit}
          />
        </ScrollView>
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

          <View style={styles.wordGrid}>
            {entries.map(([playerId, w]) => {
              const p = byId(playerId);
              const picked = claim?.includes(playerId);
              return (
                <Pressable
                  key={playerId}
                  onPress={() => {
                    // Tap two words that mean the same thing to end it.
                    if (!claim) return setClaim([playerId, playerId]);
                    if (claim[0] === playerId) return setClaim(null);
                    setClaim([claim[0], playerId]);
                  }}
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

          {claim && claim[0] !== claim[1] ? (
            <BigButton
              label={t("syncSameThing")}
              variant="secondary"
              onPress={() => {
                const w = last?.words[claim[0]] ?? "";
                setGame(acceptSyncMatch(game, [claim[0], claim[1]], w));
                setClaim(null);
                setPhase("won");
              }}
            />
          ) : (
            <Text style={styles.hint}>{t("syncSameThingHint")}</Text>
          )}

          <BigButton
            label={t("continueBtn")}
            onPress={() => {
              setPending({});
              setIndex(0);
              setPhase("handoff");
            }}
          />
          {outOfRounds ? (
            <BigButton label={t("syncGiveUp")} variant="secondary" onPress={onLeave} />
          ) : null}
        </ScrollView>
      </Screen>
    );
  }

  // ---- somebody matched ----
  const winners = (game.winners ?? []).map(byId).filter((p): p is Player => !!p);
  const tint = winners[0]?.color ?? colors.accent;

  return (
    <Screen glow={tint}>
      <View style={styles.center}>
        <Text style={styles.title}>{t("syncMatchedTitle")}</Text>
        <Text style={styles.body}>{t("syncMatchedOn")}</Text>
        <Text style={[styles.matched, { color: tint }]}>{game.matchedWord}</Text>

        <View style={styles.winnerRow}>
          {winners.map((p) => (
            <View key={p.id} style={[styles.winnerPill, { borderColor: p.color }]}>
              <Text style={[styles.winnerText, { color: p.color }]}>{p.name}</Text>
            </View>
          ))}
        </View>

        <Text style={styles.hint}>
          {tf("syncTookRounds", { n: game.history.length })}
        </Text>

        <BigButton label={t("newRoundBtn")} tone={tint} onPress={onDone} />
        <BigButton label={t("backToMenu")} variant="secondary" onPress={onLeave} />
      </View>
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
  eyebrow: { ...type.eyebrow, color: colors.textFaint, textAlign: "center" },
  label: { ...type.eyebrow, color: colors.textDim, textAlign: "center" },
  title: { ...type.title, fontSize: 26, color: colors.text, textAlign: "center" },
  body: { ...type.body, color: colors.textDim, textAlign: "center" },
  name: { ...type.display, fontSize: 36, textAlign: "center" },
  hint: {
    ...type.caption,
    fontSize: 13,
    lineHeight: 20,
    color: colors.textFaint,
    textAlign: "center",
  },
  error: { ...type.caption, fontSize: 13, color: colors.danger, textAlign: "center" },
  targetWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.xs,
    justifyContent: "center",
  },
  targetPill: {
    borderRadius: radius.pill,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.card,
    paddingVertical: 10,
    paddingHorizontal: spacing.sm + 2,
  },
  targetText: { fontSize: 20, fontWeight: "900", color: colors.text },
  wordGrid: { gap: spacing.xs },
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
