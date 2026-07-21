import React, { useEffect, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import Svg, { Circle, Path, Rect } from "react-native-svg";
import BigButton from "../components/BigButton";
import Screen from "../components/Screen";
import { Player } from "../game/types";
import { t, tf } from "../i18n";
import { colors, radius, spacing } from "../theme";
import { formatTime, textColorFor } from "../utils";

type Props = {
  timerEnabled: boolean;
  timerSeconds: number;
  players: Player[];
  onVote: () => void;
  // Optional per-mode instructions (Odd One Out passes its own).
  instructions?: string;
};


const SIZE = 220;
const STROKE = 12;
const R = (SIZE - STROKE) / 2;
const CIRCUMFERENCE = 2 * Math.PI * R;

export default function DiscussionScreen({
  timerEnabled,
  timerSeconds,
  players,
  onVote,
  instructions,
}: Props) {
  // Picked once per round (the screen mounts fresh each round).
  const [firstPlayer] = useState(
    () => players[Math.floor(Math.random() * players.length)]
  );
  const total = Math.max(1, timerSeconds);
  const [secondsLeft, setSecondsLeft] = useState(total);
  const [running, setRunning] = useState(false);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    if (!running) return;
    const iv = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(iv);
          setRunning(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(iv);
  }, [running]);

  const toggle = () => {
    if (secondsLeft === 0) return;
    if (!started) setStarted(true);
    setRunning((r) => !r);
  };

  const frac = secondsLeft / total;
  const done = secondsLeft === 0;

  return (
    <Screen>
      <View style={styles.center}>
        <Text style={styles.heading}>{t("discussion")}</Text>
        <Text style={styles.instructions}>{instructions ?? t("discussionInstr")}</Text>

        {firstPlayer ? (
          <View style={[styles.firstChip, { backgroundColor: firstPlayer.color }]}>
            <Text style={[styles.firstText, { color: textColorFor(firstPlayer.color) }]}>
              {tf("goesFirst", { name: firstPlayer.name })}
            </Text>
          </View>
        ) : null}

        {timerEnabled ? (
          <View style={styles.timerArea}>
            {/* circular timer button with progress ring */}
            <Pressable onPress={toggle} style={styles.ringWrap}>
              <Svg width={SIZE} height={SIZE}>
                <Circle
                  cx={SIZE / 2}
                  cy={SIZE / 2}
                  r={R}
                  stroke={colors.border}
                  strokeWidth={STROKE}
                  fill={colors.card}
                />
                <Circle
                  cx={SIZE / 2}
                  cy={SIZE / 2}
                  r={R}
                  stroke={done ? colors.danger : colors.accent}
                  strokeWidth={STROKE}
                  fill="none"
                  strokeLinecap="round"
                  strokeDasharray={`${CIRCUMFERENCE * frac} ${CIRCUMFERENCE}`}
                  transform={`rotate(-90 ${SIZE / 2} ${SIZE / 2})`}
                />
              </Svg>
              <View style={styles.ringCenter} pointerEvents="none">
                {done ? (
                  <Text style={styles.timeUp}>{t("timesUp")}</Text>
                ) : (
                  <>
                    <Text style={styles.time}>{formatTime(secondsLeft)}</Text>
                    {!started ? <Text style={styles.tapHint}>{t("tapToStart")}</Text> : null}
                  </>
                )}
              </View>
            </Pressable>

            {/* play / pause */}
            {!done ? (
              <Pressable onPress={toggle} style={styles.playButton}>
                <Svg width={26} height={26} viewBox="0 0 24 24">
                  {running ? (
                    <>
                      <Rect x="5" y="4" width="5" height="16" rx="1.5" fill={colors.text} />
                      <Rect x="14" y="4" width="5" height="16" rx="1.5" fill={colors.text} />
                    </>
                  ) : (
                    <Path d="M7 4.5 L20 12 L7 19.5 Z" fill={colors.text} />
                  )}
                </Svg>
              </Pressable>
            ) : null}
          </View>
        ) : null}
      </View>

      <View style={styles.bottom}>
        <BigButton label={t("vote")} onPress={onVote} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.md,
  },
  heading: {
    fontSize: 34,
    fontWeight: "900",
    color: colors.text,
  },
  instructions: {
    fontSize: 16,
    lineHeight: 24,
    color: colors.textDim,
    textAlign: "center",
    paddingHorizontal: spacing.sm,
  },
  firstChip: {
    borderRadius: radius.md,
    borderWidth: 2,
    borderColor: colors.border,
    paddingVertical: 10,
    paddingHorizontal: spacing.md,
  },
  firstText: {
    fontSize: 18,
    fontWeight: "800",
  },
  timerArea: {
    alignItems: "center",
    gap: spacing.md,
    marginTop: spacing.sm,
  },
  ringWrap: {
    width: SIZE,
    height: SIZE,
    alignItems: "center",
    justifyContent: "center",
  },
  ringCenter: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: "center",
    justifyContent: "center",
  },
  time: {
    fontSize: 52,
    fontWeight: "900",
    color: colors.text,
    fontVariant: ["tabular-nums"],
  },
  tapHint: {
    fontSize: 13,
    color: colors.textDim,
    marginTop: 2,
  },
  timeUp: {
    fontSize: 32,
    fontWeight: "900",
    color: colors.danger,
    textAlign: "center",
  },
  playButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.card,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  bottom: {
    paddingBottom: spacing.md,
  },
});
