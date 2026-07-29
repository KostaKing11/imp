import React, { useEffect, useRef, useState } from "react";
import { Animated, Easing, ScrollView, StyleSheet, Text, View } from "react-native";
import { FloaterIcon } from "../../components/icons";
import PlayerCard from "../../components/PlayerCard";
import Typewriter from "../../components/Typewriter";
import { t, tf } from "../../i18n";
import { EJECT_TALLY_MS, RoomState } from "../../net/protocol";
import { alpha, colors, spacing, type } from "../../theme";

type Props = {
  state: RoomState;
  myId: string | null;
};

// One vote landing on a card. They arrive one after another, sliding in
// from the left, so the board fills up like votes being counted out loud
// rather than all appearing at once.
function VoteDot({ color, index, stagger }: { color: string; index: number; stagger: number }) {
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(anim, {
      toValue: 1,
      duration: 380,
      delay: 260 + index * stagger,
      easing: Easing.out(Easing.back(2)),
      useNativeDriver: true,
    }).start();
  }, [anim, index, stagger]);

  const translateX = anim.interpolate({ inputRange: [0, 1], outputRange: [-44, 0] });

  return (
    <Animated.View
      style={[styles.dot, { backgroundColor: color, opacity: anim, transform: [{ translateX }] }]}
    />
  );
}

// The ejected player drifting off into the dark: turning slowly, rising
// and falling, lit by their own colour.
function Floater({ color }: { color: string }) {
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(anim, {
        toValue: 1,
        duration: 4200,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();
  }, [anim]);

  const translateY = anim.interpolate({ inputRange: [0, 0.5, 1], outputRange: [10, -14, 10] });
  const rotate = anim.interpolate({ inputRange: [0, 1], outputRange: ["-9deg", "13deg"] });

  return (
    <View style={styles.floaterWrap}>
      <View style={[styles.floaterGlow, { backgroundColor: alpha(color, 0.16) }]} />
      <Animated.View style={{ transform: [{ translateY }, { rotate }] }}>
        <FloaterIcon size={116} color={color} />
      </Animated.View>
    </View>
  );
}

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

  // Who voted for whom — one dot in each voter's colour. The order the
  // votes came in decides the order they fly in, board-wide, so no two
  // dots land at the same instant.
  const voteEntries = Object.entries(state.voteMap ?? {});
  const arrivalOf = (voterId: string) => voteEntries.findIndex(([id]) => id === voterId);
  // Squeeze the gap between dots when the room is big, so the last vote
  // still lands well before the verdict takes the board away.
  const stagger = Math.min(240, 3200 / Math.max(1, voteEntries.length));
  const votersFor = (playerId: string) =>
    voteEntries
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
          <>
            <Floater color={votedOut.color} />
            <Text style={[styles.ejectedName, { color: votedOut.color }]} numberOfLines={2}>
              {votedOut.name}
            </Text>
          </>
        ) : null}

        {/* The line types itself out, so the whole room arrives at the
            answer together instead of reading ahead. */}
        <Typewriter text={line} style={styles.verdict} speed={38} delay={420} />
        {role ? (
          <Typewriter
            text={role}
            style={styles.verdictRole}
            speed={28}
            delay={420 + line.length * 38 + 300}
          />
        ) : null}
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
                  <VoteDot
                    key={v.id}
                    color={v.color}
                    index={arrivalOf(v.id)}
                    stagger={stagger}
                  />
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
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  floaterWrap: {
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.sm,
  },
  floaterGlow: {
    position: "absolute",
    width: 190,
    height: 190,
    borderRadius: 95,
  },
  ejectedName: {
    ...type.display,
    fontSize: 38,
    textAlign: "center",
  },
  verdict: {
    ...type.title,
    fontSize: 23,
    color: colors.text,
    textAlign: "center",
  },
  verdictRole: {
    ...type.body,
    color: colors.textDim,
    textAlign: "center",
  },
});
