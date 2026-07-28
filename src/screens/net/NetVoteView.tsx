import React, { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import PlayerCard from "../../components/PlayerCard";
import { t, tf } from "../../i18n";
import { NetPlayer, RoomState } from "../../net/protocol";
import { colors, radius, spacing } from "../../theme";

type Props = {
  state: RoomState;
  myId: string | null;
  votedFor: string | null;
  onVote: (choice: string) => void;
};

// Everyone is on the board, yourself included. Tap a player and the tick
// and cross appear on their card — the tick locks the vote in, and a
// sticker shows up on everyone who has voted. When the last vote lands
// the room moves on by itself.
export default function NetVoteView({ state, myId, votedFor, onVote }: Props) {
  const [pending, setPending] = useState<NetPlayer | null>(null);

  const roundPlayers = state.players.filter((p) => p.connected && p.inRound);
  const done = state.votedIds.length;
  const total = roundPlayers.length;

  const title =
    state.mode === "imp"
      ? t("voteWhoImp")
      : state.mode === "odd"
        ? t("voteWhoOdd")
        : state.mode === "blef"
          ? t("voteWhoBlef")
          : t("voteWhoNet");

  const counter = <Text style={styles.counter}>{tf("votedCount", { done, total })}</Text>;

  // Blef is a duel — there is nobody to point at, only a call to make.
  if (state.mode === "blef") {
    const other = roundPlayers.find((p) => p.id !== myId);
    return (
      <>
        <Text style={styles.heading}>{title}</Text>
        <Text style={styles.subheading}>{other?.name ?? ""}</Text>
        <View style={styles.blefArea}>
          {(["word", "hint"] as const).map((choice) => (
            <Pressable
              key={choice}
              disabled={votedFor !== null}
              onPress={() => onVote(choice)}
              style={({ pressed }) => [
                styles.blefCard,
                { borderColor: choice === "word" ? colors.word : colors.blefTeal },
                votedFor !== null && votedFor !== choice && styles.dimmed,
                votedFor === choice && styles.picked,
                pressed && styles.pressed,
              ]}
            >
              <Text
                style={[
                  styles.blefText,
                  { color: choice === "word" ? colors.word : colors.blefTeal },
                ]}
              >
                {choice === "word" ? t("blefWordBtn") : t("blefHintBtn")}
              </Text>
            </Pressable>
          ))}
        </View>
        {votedFor ? <Text style={styles.notice}>{t("waitingOthersVote")}</Text> : null}
        {counter}
      </>
    );
  }

  return (
    <>
      <Text style={styles.heading}>{title}</Text>
      <ScrollView contentContainerStyle={styles.list} showsVerticalScrollIndicator={false}>
        {roundPlayers.map((p) => {
          const isMe = p.id === myId;
          const asking = pending?.id === p.id;
          const myPick = votedFor === p.id;
          return (
            <PlayerCard
              key={p.id}
              name={p.name}
              color={p.color}
              note={isMe ? t("youTag") : null}
              badge={state.votedIds.includes(p.id) ? t("votedTag") : null}
              selected={myPick || asking}
              dimmed={(votedFor !== null && !myPick) || (pending !== null && !asking)}
              disabled={votedFor !== null || isMe}
              onPress={() => setPending(p)}
              right={
                asking ? (
                  <>
                    <Pressable
                      onPress={() => setPending(null)}
                      hitSlop={6}
                      style={({ pressed }) => [
                        styles.choice,
                        styles.no,
                        pressed && styles.pressed,
                      ]}
                    >
                      <Text style={styles.noText}>✕</Text>
                    </Pressable>
                    <Pressable
                      onPress={() => {
                        setPending(null);
                        onVote(p.id);
                      }}
                      hitSlop={6}
                      style={({ pressed }) => [
                        styles.choice,
                        styles.yes,
                        pressed && styles.pressed,
                      ]}
                    >
                      <Text style={styles.yesText}>✓</Text>
                    </Pressable>
                  </>
                ) : null
              }
            />
          );
        })}
      </ScrollView>

      {pending ? (
        <Text style={styles.notice}>{tf("voteFor", { name: pending.name })}</Text>
      ) : votedFor ? (
        <Text style={styles.notice}>{t("waitingOthersVote")}</Text>
      ) : null}
      {counter}
    </>
  );
}

const styles = StyleSheet.create({
  heading: {
    fontSize: 24,
    fontWeight: "900",
    color: colors.text,
    textAlign: "center",
    marginTop: spacing.md,
  },
  subheading: {
    fontSize: 16,
    color: colors.textDim,
    textAlign: "center",
    marginTop: spacing.xs,
  },
  list: { gap: spacing.xs, paddingVertical: spacing.sm },
  choice: {
    width: 52,
    height: 44,
    borderRadius: radius.sm,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  no: { borderColor: colors.danger, backgroundColor: "rgba(255,71,87,0.14)" },
  yes: { borderColor: colors.good, backgroundColor: "rgba(46,213,115,0.16)" },
  noText: { fontSize: 22, fontWeight: "900", color: colors.danger },
  yesText: { fontSize: 22, fontWeight: "900", color: colors.good },
  picked: { borderWidth: 4 },
  dimmed: { opacity: 0.4 },
  pressed: { opacity: 0.7 },
  blefArea: { flex: 1, justifyContent: "center", gap: spacing.md },
  blefCard: {
    minHeight: 110,
    borderRadius: radius.lg,
    borderWidth: 3,
    backgroundColor: colors.card,
    alignItems: "center",
    justifyContent: "center",
  },
  blefText: { fontSize: 30, fontWeight: "900", letterSpacing: 2 },
  notice: { fontSize: 14, color: colors.textDim, textAlign: "center" },
  counter: {
    fontSize: 13,
    color: colors.textDim,
    textAlign: "center",
    paddingBottom: spacing.md,
  },
});
