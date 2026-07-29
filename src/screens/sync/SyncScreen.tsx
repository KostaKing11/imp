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
import {
  acceptSyncMatch,
  resolveSyncRound,
  SYNC_MAX_ROUNDS,
  syncTargets,
  syncWordTaken,
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

type Phase = "cards" | "reveal" | "won";

// Pass-and-play Uskladi se, laid out like every other mode: the whole
// roster is on screen, you tap your own card, hold it to read what you
// are reacting to, and type your word.
export default function SyncScreen({ players, game, setGame, onLeave, onDone }: Props) {
  const [phase, setPhase] = useState<Phase>(game.winners ? "won" : "cards");
  const [pending, setPending] = useState<Record<string, string>>({});
  const [active, setActive] = useState<Player | null>(null);
  const [peeked, setPeeked] = useState(false);
  const [text, setText] = useState("");
  const [error, setError] = useState<string | null>(null);
  // Players the group decided all wrote the same thing.
  const [claim, setClaim] = useState<string[]>([]);

  const byId = (id: string) => players.find((p) => p.id === id) ?? null;
  const targets = syncTargets(game);
  const roundNo = game.history.length + 1;
  const allIn = players.every((p) => pending[p.id] !== undefined);

  const open = (player: Player) => {
    setPeeked(false);
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

  // ---- one player's card, open ----
  if (active) {
    return (
      <Screen glow={active.color}>
        <KeyboardAvoidingView
          style={styles.cardScreen}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <FlipCard
            name={active.name}
            color={active.color}
            faceColor={active.color}
            onPeeked={() => setPeeked(true)}
          >
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
          </FlipCard>

          <View style={styles.cardBottom}>
            {peeked ? (
              <>
                <TextInput
                  style={styles.input}
                  value={text}
                  onChangeText={(v) => {
                    setText(v);
                    setError(null);
                  }}
                  placeholder={t("syncPlaceholder")}
                  placeholderTextColor={colors.textFaint}
                  autoCapitalize="none"
                  selectionColor={colors.accent}
                />
                {error ? <Text style={styles.error}>{error}</Text> : null}
                <BigButton
                  label={t("syncLockWord")}
                  tone={active.color}
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
          {players.map((p) => {
            const done = pending[p.id] !== undefined;
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
            {entries.map(([playerId, w]) => {
              const p = byId(playerId);
              const picked = claim.includes(playerId);
              return (
                <Pressable
                  key={playerId}
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

        <Text style={styles.hint}>{tf("syncTookRounds", { n: game.history.length })}</Text>

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
  center: { flex: 1, alignItems: "center", justifyContent: "center", gap: spacing.sm },
  scroll: { gap: spacing.sm, paddingTop: spacing.lg, paddingBottom: spacing.md },
  cardScreen: { flex: 1, alignItems: "center", justifyContent: "center" },
  cardBottom: {
    marginTop: spacing.lg,
    minHeight: 70,
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
  targetWrap: { alignItems: "center", gap: 2 },
  targetText: { fontSize: 30, fontWeight: "900", textAlign: "center" },
  input: {
    alignSelf: "stretch",
    backgroundColor: colors.chip,
    borderWidth: 1.5,
    borderColor: colors.borderSoft,
    borderRadius: radius.md,
    color: colors.text,
    fontSize: 18,
    fontWeight: "700",
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: 14,
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
