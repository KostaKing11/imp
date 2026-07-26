import React, { useEffect, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { t, tf } from "../../i18n";
import { EJECT_TALLY_MS, RoomState } from "../../net/protocol";
import { colors, radius, spacing } from "../../theme";
import { textColorFor } from "../../utils";

type Props = {
  state: RoomState;
  myId: string | null;
};

// The beat between voting and the results: first the votes land under the
// names, then the room hears who was voted out and what they were.
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

  // Who voted for whom — one little dot in each voter's colour.
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
          <View style={[styles.ejectedCard, { backgroundColor: votedOut.color }]}>
            <Text
              style={[styles.ejectedName, { color: textColorFor(votedOut.color) }]}
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
    <ScrollView contentContainerStyle={styles.grid} showsVerticalScrollIndicator={false}>
      {roundPlayers.map((p) => {
        const voters = votersFor(p.id);
        return (
          <View key={p.id} style={styles.slot}>
            <View style={[styles.playerCard, { backgroundColor: p.color }]}>
              <Text
                style={[styles.playerName, { color: textColorFor(p.color) }]}
                numberOfLines={2}
              >
                {p.name}
              </Text>
              {p.id === myId ? (
                <Text style={[styles.youTag, { color: textColorFor(p.color) }]}>
                  {t("youTag")}
                </Text>
              ) : null}
            </View>
            <View style={styles.dots}>
              {voters.map((v) => (
                <View key={v.id} style={[styles.dot, { backgroundColor: v.color }]} />
              ))}
            </View>
          </View>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    justifyContent: "center",
    paddingVertical: spacing.lg,
  },
  slot: { width: "47%", gap: spacing.xs },
  playerCard: {
    minHeight: 92,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.sm,
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.28)",
  },
  playerName: { fontSize: 20, fontWeight: "900", textAlign: "center" },
  youTag: { fontSize: 12, fontWeight: "700", opacity: 0.75 },
  dots: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 5,
    justifyContent: "center",
    minHeight: 18,
  },
  dot: {
    width: 15,
    height: 15,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: "rgba(255,255,255,0.45)",
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
    borderWidth: 3,
    borderColor: "rgba(255,255,255,0.28)",
    padding: spacing.md,
  },
  ejectedName: { fontSize: 34, fontWeight: "900", textAlign: "center" },
  verdict: {
    fontSize: 24,
    fontWeight: "900",
    color: colors.text,
    textAlign: "center",
  },
  verdictRole: { fontSize: 16, color: colors.textDim, textAlign: "center" },
});
