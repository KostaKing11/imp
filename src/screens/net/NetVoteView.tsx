import React, { useState } from "react";
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import BigButton from "../../components/BigButton";
import { t, tf } from "../../i18n";
import { NetPlayer, RoomState } from "../../net/protocol";
import { colors, radius, spacing } from "../../theme";
import { textColorFor } from "../../utils";

type Props = {
  state: RoomState;
  myId: string | null;
  votedFor: string | null;
  onVote: (choice: string) => void;
};

// Everyone is on the board, yourself included. Tap a player, confirm with
// the tick, and a "voted" mark shows up on your card. When the last vote
// lands the room moves on by itself — nobody has to press anything.
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

  const counter = (
    <Text style={styles.counter}>{tf("votedCount", { done, total })}</Text>
  );

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
      <ScrollView contentContainerStyle={styles.grid} showsVerticalScrollIndicator={false}>
        {roundPlayers.map((p) => {
          const isMe = p.id === myId;
          const hasVoted = state.votedIds.includes(p.id);
          const myPick = votedFor === p.id;
          return (
            <Pressable
              key={p.id}
              disabled={votedFor !== null || isMe}
              onPress={() => setPending(p)}
              style={({ pressed }) => [
                styles.playerCard,
                { backgroundColor: p.color },
                votedFor !== null && !myPick && styles.dimmed,
                myPick && styles.picked,
                pressed && styles.pressed,
              ]}
            >
              <Text
                style={[styles.playerName, { color: textColorFor(p.color) }]}
                numberOfLines={2}
              >
                {p.name}
              </Text>
              {isMe ? (
                <Text style={[styles.youTag, { color: textColorFor(p.color) }]}>
                  {t("youTag")}
                </Text>
              ) : null}
              {hasVoted ? (
                <View style={styles.votedBadge}>
                  <Text style={styles.votedBadgeText}>✓ {t("votedTag")}</Text>
                </View>
              ) : null}
            </Pressable>
          );
        })}
      </ScrollView>

      {votedFor ? <Text style={styles.notice}>{t("waitingOthersVote")}</Text> : null}
      {counter}

      {/* Confirm the vote before it counts. Mounted only while it is
          needed — a hidden modal can linger on the web build. */}
      {pending ? (
      <Modal
        visible
        transparent
        animationType="fade"
        onRequestClose={() => setPending(null)}
      >
        <Pressable style={styles.backdrop} onPress={() => setPending(null)}>
          <Pressable style={styles.confirmBox} onPress={() => {}}>
            <Text style={styles.confirmQuestion}>
              {tf("voteFor", { name: pending?.name ?? "" })}
            </Text>
            <View
              style={[styles.confirmCard, { backgroundColor: pending?.color ?? colors.card }]}
            >
              <Text
                style={[
                  styles.confirmName,
                  { color: textColorFor(pending?.color ?? "#000") },
                ]}
                numberOfLines={2}
              >
                {pending?.name}
              </Text>
            </View>
            <View style={styles.confirmRow}>
              <Pressable
                onPress={() => setPending(null)}
                style={({ pressed }) => [
                  styles.confirmBtn,
                  styles.confirmNo,
                  pressed && styles.pressed,
                ]}
              >
                <Text style={styles.confirmNoText}>✕</Text>
              </Pressable>
              <Pressable
                onPress={() => {
                  const target = pending;
                  setPending(null);
                  if (target) onVote(target.id);
                }}
                style={({ pressed }) => [
                  styles.confirmBtn,
                  styles.confirmYes,
                  pressed && styles.pressed,
                ]}
              >
                <Text style={styles.confirmYesText}>✓</Text>
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
      ) : null}
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
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    justifyContent: "center",
    paddingVertical: spacing.md,
  },
  playerCard: {
    width: "47%",
    minHeight: 96,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.sm,
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.28)",
  },
  playerName: { fontSize: 21, fontWeight: "900", textAlign: "center" },
  youTag: { fontSize: 13, fontWeight: "700", opacity: 0.75, marginTop: 2 },
  votedBadge: {
    position: "absolute",
    top: 6,
    right: 6,
    backgroundColor: "rgba(0,0,0,0.55)",
    borderRadius: radius.sm,
    paddingHorizontal: 7,
    paddingVertical: 3,
  },
  votedBadgeText: { fontSize: 11, fontWeight: "800", color: "#FFFFFF" },
  picked: { borderColor: "#FFFFFF", borderWidth: 3 },
  dimmed: { opacity: 0.35 },
  pressed: { opacity: 0.7, transform: [{ scale: 0.97 }] },
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
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.75)",
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.md,
  },
  confirmBox: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    alignItems: "center",
    gap: spacing.md,
    alignSelf: "stretch",
  },
  confirmQuestion: {
    fontSize: 17,
    fontWeight: "800",
    color: colors.text,
    textAlign: "center",
  },
  confirmCard: {
    alignSelf: "stretch",
    minHeight: 110,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.28)",
    padding: spacing.sm,
  },
  confirmName: { fontSize: 28, fontWeight: "900", textAlign: "center" },
  confirmRow: { flexDirection: "row", gap: spacing.md },
  confirmBtn: {
    width: 92,
    height: 62,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
  },
  confirmNo: { borderColor: colors.danger, backgroundColor: "rgba(255,71,87,0.12)" },
  confirmYes: { borderColor: colors.good, backgroundColor: "rgba(46,213,115,0.14)" },
  confirmNoText: { fontSize: 26, fontWeight: "900", color: colors.danger },
  confirmYesText: { fontSize: 26, fontWeight: "900", color: colors.good },
});
