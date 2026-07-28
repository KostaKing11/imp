import React, { useEffect, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import PlayerCard from "../../components/PlayerCard";
import { t, tf } from "../../i18n";
import { EJECT_TALLY_MS, RoomState } from "../../net/protocol";
import { colors, radius, spacing } from "../../theme";

type Props = {
  state: RoomState;
  myId: string | null;
};

// The beat between voting and the results: first the votes land on the
// cards, then the room hears who was voted out and what they were.
export default function NetEjectView({ state, myId }: Props) {
  const [showVerdict, setShowVerdict] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShowVerdict(true), EJECT_TALLY_MS);
    return () => clearTimeout(timer);
  }, []);

  const results = state.results;
  const roundPlayers = state.players.filter((p) => p.inRound);
  const byId = (id: string | null | undefined) => state.players.find((p) => p.id === id);
  const votedOut = byId(results?.votedOutId);

  // Who voted for whom — one dot in each voter's colour.
  const votersFor = (playerId: string) =>
    Object.entries(state.voteMap ?? {})
      .filter(([, choice]) => choice === playerId)
      .map(([voterId]) => byId(voterId))
      .filter((p): p is NonNullable<typeof p> => !!p);

  const verdict = (): { line: string; role: string | null } => {
    if (!results || !votedOut) return { line: t("nobodyEjected"), role: null };
    const name = votedOut.name;
    const impCount = (results.roles ?? []).filter((r) => r.kind === "imposter").length;
    const many = impCount > 1;
    const caught = results.outcome === "caught";

    if (results.mode === "imp") {
      const line = caught
        ? tf(many ? "ejectedIsImpMulti" : "ejectedIsImp", { name })
        : tf(many ? "ejectedNotImpMulti" : "ejectedNotImp", { name });
      // Say what they actually were when it wasn't just a plain civilian.
      const role = (results.roles ?? []).find((r) => r.playerId === votedOut.id);
      const extra =
        !caught && role && role.kind !== "civilian" && role.kind !== "imposter"
          ? tf("ejectedRoleLine", { role: role.roleName })
          : null;
      return { line, role: extra };
    }
    if (results.mode === "odd") {
      return { line: tf(caught ? "ejectedIsOdd" : "ejectedNotOdd", { name }), role: null };
    }
    return { line: tf(caught ? "ejectedIsFaker" : "ejectedNotFaker", { name }), role: null };
  };

  if (showVerdict) {
    const { line, role } = verdict();
    return (
      <View style={styles.center}>
        {votedOut ? (
          <View style={[styles.ejectedCard, { borderColor: votedOut.color }]}>
            <Text
              style={[styles.ejectedName, { color: votedOut.color }]}
              numberOfLines={2}
            >
              {votedOut.name}
            </Text>
          </View>
        ) : null}
        <Text style={styles.verdict}>{line}</Text>
        {role ? <Text style={styles.verdictRole}>{role}</Text> : null}
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.list} showsVerticalScrollIndicator={false}>
      {roundPlayers.map((p) => {
        const voters = votersFor(p.id);
        return (
          <PlayerCard
            key={p.id}
            name={p.name}
            color={p.color}
            note={p.id === myId ? t("youTag") : null}
            right={
              <View style={styles.dots}>
                {voters.map((v) => (
                  <View key={v.id} style={[styles.dot, { backgroundColor: v.color }]} />
                ))}
              </View>
            }
          />
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  list: { gap: spacing.xs, paddingVertical: spacing.lg },
  dots: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 5,
    justifyContent: "flex-end",
    maxWidth: 150,
  },
  dot: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 1.5,
    borderColor: "rgba(255,255,255,0.5)",
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.md,
    paddingHorizontal: spacing.md,
  },
  ejectedCard: {
    alignSelf: "stretch",
    minHeight: 120,
    borderRadius: radius.lg,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 4,
    backgroundColor: colors.card,
    padding: spacing.md,
  },
  ejectedName: { fontSize: 36, fontWeight: "900", textAlign: "center" },
  verdict: {
    fontSize: 24,
    fontWeight: "900",
    color: colors.text,
    textAlign: "center",
  },
  verdictRole: { fontSize: 16, color: colors.textDim, textAlign: "center" },
});
