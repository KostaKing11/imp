import React from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import BigButton from "../../components/BigButton";
import { t, tf } from "../../i18n";
import { RoomState } from "../../net/protocol";
import { colors, radius, spacing } from "../../theme";
import { textColorFor } from "../../utils";

type Props = {
  state: RoomState;
  myId: string | null;
  votedFor: string | null;
  onVote: (choice: string) => void;
  isHost: boolean;
  onReveal: () => void;
};

// Everyone votes on their own phone. Blef is the odd one out: instead of
// picking a player you say whether your opponent had the WORD or a HINT.
export default function NetVoteView({ state, myId, votedFor, onVote, isHost, onReveal }: Props) {
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

  const bottom = (
    <View style={styles.bottom}>
      {votedFor ? <Text style={styles.notice}>{t("waitingOthersVote")}</Text> : null}
      <Text style={styles.counter}>{tf("votedCount", { done, total })}</Text>
      {isHost ? (
        <BigButton
          label={t("continueBtn")}
          variant={votedFor ? "primary" : "secondary"}
          onPress={onReveal}
        />
      ) : null}
    </View>
  );

  if (state.mode === "blef") {
    const other = roundPlayers.find((p) => p.id !== myId);
    return (
      <>
        <Text style={styles.heading}>{title}</Text>
        <Text style={styles.subheading}>{other?.name ?? ""}</Text>
        <View style={styles.blefArea}>
          <Pressable
            disabled={votedFor !== null}
            onPress={() => onVote("word")}
            style={({ pressed }) => [
              styles.blefCard,
              { borderColor: colors.word },
              votedFor !== null && votedFor !== "word" && styles.dimmed,
              votedFor === "word" && styles.picked,
              pressed && styles.pressed,
            ]}
          >
            <Text style={[styles.blefText, { color: colors.word }]}>{t("blefWordBtn")}</Text>
          </Pressable>
          <Pressable
            disabled={votedFor !== null}
            onPress={() => onVote("hint")}
            style={({ pressed }) => [
              styles.blefCard,
              { borderColor: colors.blefTeal },
              votedFor !== null && votedFor !== "hint" && styles.dimmed,
              votedFor === "hint" && styles.picked,
              pressed && styles.pressed,
            ]}
          >
            <Text style={[styles.blefText, { color: colors.blefTeal }]}>{t("blefHintBtn")}</Text>
          </Pressable>
        </View>
        {bottom}
      </>
    );
  }

  return (
    <>
      <Text style={styles.heading}>{title}</Text>
      <ScrollView contentContainerStyle={styles.grid} showsVerticalScrollIndicator={false}>
        {roundPlayers
          .filter((p) => p.id !== myId)
          .map((p) => (
            <Pressable
              key={p.id}
              disabled={votedFor !== null}
              onPress={() => onVote(p.id)}
              style={({ pressed }) => [
                styles.suspectCard,
                { backgroundColor: p.color },
                votedFor !== null && votedFor !== p.id && styles.dimmed,
                votedFor === p.id && styles.picked,
                pressed && styles.pressed,
              ]}
            >
              <Text
                style={[styles.suspectName, { color: textColorFor(p.color) }]}
                numberOfLines={2}
              >
                {p.name}
              </Text>
            </Pressable>
          ))}
      </ScrollView>
      {bottom}
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
  suspectCard: {
    width: "47%",
    minHeight: 92,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.sm,
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.28)",
  },
  suspectName: { fontSize: 22, fontWeight: "900", textAlign: "center" },
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
  picked: { borderColor: "#FFFFFF", borderWidth: 3 },
  dimmed: { opacity: 0.35 },
  pressed: { opacity: 0.7, transform: [{ scale: 0.97 }] },
  notice: { fontSize: 14, color: colors.textDim, textAlign: "center" },
  counter: { fontSize: 13, color: colors.textDim, textAlign: "center" },
  bottom: { gap: spacing.xs, paddingBottom: spacing.md },
});
