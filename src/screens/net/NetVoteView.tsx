import React, { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import BigButton from "../../components/BigButton";
import { ThumbDownIcon, ThumbUpIcon } from "../../components/icons";
import PlayerCard from "../../components/PlayerCard";
import { t, tf } from "../../i18n";
import { NetPlayer, RoomState } from "../../net/protocol";
import { alpha, colors, radius, spacing, type } from "../../theme";

type Props = {
  state: RoomState;
  myId: string | null;
  votedFor: string | null;
  onVote: (choice: string) => void;
};

// Everyone is on the board, yourself included. Tapping a player leaves
// their card exactly as it was and only puts a tick and a cross on it —
// the row you are deciding about should offer the two answers, not start
// shouting.
//
// A thumb up in the top-left corner means that player has cast their
// vote; a thumb down in the top-right, in your own colour, marks the one
// you picked.
export default function NetVoteView({ state, myId, votedFor, onVote }: Props) {
  const [pending, setPending] = useState<NetPlayer | null>(null);
  const [blefPick, setBlefPick] = useState<"word" | "hint" | null>(null);

  const roundPlayers = state.players.filter((p) => p.connected && p.inRound);
  const done = state.votedIds.length;
  const total = roundPlayers.length;
  const myColor = roundPlayers.find((p) => p.id === myId)?.color ?? colors.accent;

  const title =
    state.mode === "imp"
      ? t("voteWhoImp")
      : state.mode === "odd"
        ? t("voteWhoOdd")
        : state.mode === "blef"
          ? t("voteWhoBlef")
          : t("voteWhoNet");

  const counter = <Text style={styles.counter}>{tf("votedCount", { done, total })}</Text>;

  // Blef is a duel — there is nobody to point at, only a call to make
  // about the one card you cannot see.
  if (state.mode === "blef") {
    const other = roundPlayers.find((p) => p.id !== myId);
    const locked = votedFor !== null;

    const callButton = (choice: "word" | "hint") => {
      const tint = choice === "word" ? colors.word : colors.blefTeal;
      const on = (locked ? votedFor : blefPick) === choice;
      return (
        <Pressable
          key={choice}
          disabled={locked}
          onPress={() => setBlefPick(choice)}
          style={({ pressed }) => [
            styles.callButton,
            {
              borderColor: on ? tint : colors.borderSoft,
              backgroundColor: on ? alpha(tint, 0.16) : colors.card,
            },
            locked && !on && styles.dimmed,
            pressed && styles.pressed,
          ]}
        >
          <Text style={[styles.callText, { color: on ? tint : colors.textDim }]}>
            {choice === "word" ? t("blefWordBtn") : t("blefHintBtn")}
          </Text>
        </Pressable>
      );
    };

    return (
      <>
        <Text style={styles.heading}>{title}</Text>
        <Text style={styles.subheading}>
          {tf("blefWhatDidTheyGet", { name: other?.name ?? "" })}
        </Text>

        <View style={styles.callArea}>
          <View style={styles.callRow}>
            {callButton("word")}
            {callButton("hint")}
          </View>

          {/* The confirm only appears once a call is on the table, right
              under it — no committing on a stray tap. */}
          {blefPick && !locked ? (
            <BigButton label={t("confirmBtn")} onPress={() => onVote(blefPick)} />
          ) : null}
        </View>

        {locked ? <Text style={styles.notice}>{t("waitingOthersVote")}</Text> : null}
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
          const hasVoted = state.votedIds.includes(p.id);
          const myPick = votedFor === p.id;

          return (
            <PlayerCard
              key={p.id}
              name={p.name}
              color={p.color}
              note={isMe ? t("youTag") : null}
              badgeIcon={hasVoted ? <ThumbUpIcon size={15} color={p.color} /> : null}
              badgeRight={myPick ? <ThumbDownIcon size={15} color={myColor} /> : null}
              badgeRightColor={myColor}
              disabled={votedFor !== null || isMe}
              onPress={() => setPending(p)}
              right={
                asking ? (
                  <>
                    <Pressable
                      onPress={() => setPending(null)}
                      hitSlop={6}
                      style={({ pressed }) => [styles.choice, styles.no, pressed && styles.pressed]}
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
    ...type.title,
    fontSize: 24,
    color: colors.text,
    textAlign: "center",
    marginTop: spacing.md,
  },
  subheading: {
    ...type.body,
    color: colors.textDim,
    textAlign: "center",
    marginTop: spacing.xs,
  },
  list: { gap: spacing.xs, paddingVertical: spacing.sm },
  choice: {
    width: 50,
    height: 44,
    borderRadius: radius.pill,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
  },
  no: { borderColor: colors.danger, backgroundColor: colors.dangerSoft },
  yes: { borderColor: colors.good, backgroundColor: colors.goodSoft },
  noText: { fontSize: 20, fontWeight: "900", color: colors.danger },
  yesText: { fontSize: 20, fontWeight: "900", color: colors.good },
  dimmed: { opacity: 0.4 },
  pressed: { opacity: 0.7 },

  callArea: { flex: 1, justifyContent: "center", gap: spacing.sm },
  callRow: { flexDirection: "row", gap: spacing.sm },
  callButton: {
    flex: 1,
    minHeight: 108,
    borderRadius: radius.lg,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
  },
  callText: { fontSize: 24, fontWeight: "900", letterSpacing: 1.5 },

  notice: { ...type.caption, fontSize: 14, color: colors.textDim, textAlign: "center" },
  counter: {
    ...type.caption,
    fontSize: 13,
    color: colors.textFaint,
    textAlign: "center",
    paddingBottom: spacing.md,
  },
});
