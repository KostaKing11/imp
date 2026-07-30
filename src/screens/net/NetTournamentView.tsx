import React, { useEffect, useState } from "react";
import { Animated, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import BigButton from "../../components/BigButton";
import PlayerCard from "../../components/PlayerCard";
import { usePressScale } from "../../components/usePressScale";
import { GameMode } from "../../game/types";
import { modeLabel, t, tf } from "../../i18n";
import { RoomState, TOUR_VOTE_MS } from "../../net/protocol";
import { alpha, colors, elevation, modeTint, radius, spacing, type } from "../../theme";

type Props = {
  state: RoomState;
  myId: string | null;
  isHost: boolean;
  onVoteMode: (mode: GameMode) => void;
  onNext: () => void;
};

// A voter's dot, scattered inside the card. The spot is derived from the
// player id so it stays put across re-renders instead of jittering every
// time somebody else votes.
function scatter(id: string, i: number): { left: string; top: string } {
  let h = 0;
  for (let k = 0; k < id.length; k++) h = (h * 31 + id.charCodeAt(k)) >>> 0;
  const x = 12 + ((h + i * 37) % 70);
  const y = 55 + (((h >> 8) + i * 53) % 34);
  return { left: `${x}%`, top: `${y}%` };
}

function VoteDot({ color, spot }: { color: string; spot: { left: string; top: string } }) {
  const anim = React.useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.spring(anim, { toValue: 1, speed: 16, bounciness: 12, useNativeDriver: true }).start();
  }, [anim]);
  return (
    <Animated.View
      style={[
        styles.dot,
        spot as object,
        { backgroundColor: color, opacity: anim, transform: [{ scale: anim }] },
      ]}
      pointerEvents="none"
    />
  );
}

function ModeChoice({
  mode,
  voters,
  mine,
  onPress,
}: {
  mode: GameMode;
  voters: { id: string; color: string }[];
  mine: boolean;
  onPress: () => void;
}) {
  const press = usePressScale(0.95);
  const tint = modeTint(mode);
  return (
    <Animated.View style={[styles.choiceWrap, press.style]}>
      <Pressable
        onPress={onPress}
        onPressIn={press.onPressIn}
        onPressOut={press.onPressOut}
        style={[
          styles.choice,
          { borderColor: mine ? tint : colors.borderSoft, backgroundColor: alpha(tint, 0.12) },
          mine && elevation.glow(tint),
        ]}
      >
        <Text style={[styles.choiceName, { color: tint }]} numberOfLines={2}>
          {modeLabel(mode)}
        </Text>
        {voters.map((v, i) => (
          <VoteDot key={v.id} color={v.color} spot={scatter(v.id, i)} />
        ))}
      </Pressable>
    </Animated.View>
  );
}

// The tournament's two screens: the five-second vote for what to play
// next, and the standings between games.
export default function NetTournamentView({ state, myId, isHost, onVoteMode, onNext }: Props) {
  const tour = state.tournament;
  const [left, setLeft] = useState(TOUR_VOTE_MS);

  // Every phone counts down to the same wall-clock moment.
  useEffect(() => {
    if (state.phase !== "tourVote" || !tour) return;
    const tick = () => setLeft(Math.max(0, tour.closesAt - Date.now()));
    tick();
    const iv = setInterval(tick, 100);
    return () => clearInterval(iv);
  }, [state.phase, tour?.closesAt, tour]);

  if (!tour) return null;
  const byId = (id: string) => state.players.find((p) => p.id === id) ?? null;

  if (state.phase === "tourVote") {
    const myVote = myId ? tour.votes[myId] : undefined;
    return (
      <View style={styles.voteWrap}>
        <Text style={styles.eyebrow}>{tf("tourGameNo", { n: tour.gameNo + 1 })}</Text>
        <Text style={styles.title}>{t("tourPickNext")}</Text>
        <Text style={styles.clock}>{Math.ceil(left / 1000)}</Text>

        <View style={styles.choices}>
          {tour.options.map((mode) => (
            <ModeChoice
              key={mode}
              mode={mode}
              mine={myVote === mode}
              voters={Object.entries(tour.votes)
                .filter(([, m]) => m === mode)
                .map(([id]) => ({ id, color: byId(id)?.color ?? colors.textDim }))}
              onPress={() => onVoteMode(mode)}
            />
          ))}
        </View>

        <Text style={styles.counter}>
          {tf("skalaGuessedCount", {
            done: Object.keys(tour.votes).length,
            total: state.players.filter((p) => p.inRound && p.connected).length,
          })}
        </Text>
      </View>
    );
  }

  // ---- standings ----
  const table = state.players
    .filter((p) => p.inRound)
    .sort((a, b) => (tour.scores[b.id] ?? 0) - (tour.scores[a.id] ?? 0));
  const won = tour.winners && tour.winners.length > 0;

  return (
    <ScrollView contentContainerStyle={styles.scroll}>
      <Text style={styles.eyebrow}>
        {tour.lastMode ? modeLabel(tour.lastMode) : ""}
      </Text>
      <Text style={styles.title}>{won ? t("tourWinnerTitle") : t("tourStandings")}</Text>
      {!won ? (
        <Text style={styles.counter}>{tf("tourToWin", { n: tour.target })}</Text>
      ) : null}

      <View style={styles.list}>
        {table.map((p) => {
          const gained = tour.lastAward?.[p.id] ?? 0;
          return (
            <PlayerCard
              key={p.id}
              name={p.name}
              color={p.color}
              note={p.id === myId ? t("youTag") : null}
              selected={!!tour.winners?.includes(p.id)}
              badge={tour.winners?.includes(p.id) ? t("skalaWinnerTag") : null}
              right={
                <View style={styles.scoreRight}>
                  {gained > 0 ? <Text style={styles.gain}>+{gained}</Text> : null}
                  <Text style={[styles.total, { color: p.color }]}>{tour.scores[p.id] ?? 0}</Text>
                </View>
              }
            />
          );
        })}
      </View>

      {isHost ? (
        <BigButton label={won ? t("backToLobbyBtn") : t("continueBtn")} onPress={onNext} />
      ) : (
        <Text style={styles.counter}>{t("waitingForHost")}</Text>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  voteWrap: { flex: 1, justifyContent: "center", gap: spacing.sm },
  scroll: { gap: spacing.sm, paddingTop: spacing.lg, paddingBottom: spacing.md },
  eyebrow: { ...type.eyebrow, color: colors.textFaint, textAlign: "center" },
  title: { ...type.title, fontSize: 26, color: colors.text, textAlign: "center" },
  clock: {
    ...type.display,
    fontSize: 52,
    color: colors.accent,
    textAlign: "center",
    fontVariant: ["tabular-nums"],
  },
  choices: { gap: spacing.sm, marginTop: spacing.xs },
  choiceWrap: { alignSelf: "stretch" },
  choice: {
    minHeight: 104,
    borderRadius: radius.lg,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  choiceName: { fontSize: 24, fontWeight: "900", textAlign: "center" },
  dot: {
    position: "absolute",
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: "rgba(255,255,255,0.55)",
  },
  counter: { ...type.caption, fontSize: 13, color: colors.textFaint, textAlign: "center" },
  list: { gap: spacing.xs },
  scoreRight: { flexDirection: "row", alignItems: "center", gap: spacing.xs },
  gain: { ...type.caption, fontSize: 14, color: colors.good, fontWeight: "800" },
  total: { fontSize: 24, fontWeight: "900" },
});
