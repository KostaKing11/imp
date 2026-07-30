import React, { useEffect, useState } from "react";
import { Animated, Pressable, StyleSheet, Text, View } from "react-native";
import Svg, { Circle, Path, Rect } from "react-native-svg";
import Appear from "../components/Appear";
import BigButton from "../components/BigButton";
import Pop from "../components/Pop";
import Pulse from "../components/Pulse";
import Screen from "../components/Screen";
import { usePressScale } from "../components/usePressScale";
import { Player } from "../game/types";
import { t, tf } from "../i18n";
import { alpha, colors, elevation, radius, spacing, type } from "../theme";
import { formatTime } from "../utils";

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
  // The last stretch is the loud part of a round, so the whole screen
  // goes with it: the ring, the digits and the light behind everything
  // all turn towards red together.
  const urgent = !done && running && secondsLeft <= 10;
  const ringColor = done ? colors.danger : urgent ? colors.danger : colors.accent;
  const glow = timerEnabled && (done || urgent) ? colors.danger : colors.accent;

  const timer = (
    <View style={styles.timerArea}>
      {/* circular timer button with progress ring */}
      <Pressable onPress={toggle} style={styles.ringWrap}>
        <Svg width={SIZE} height={SIZE}>
          <Circle
            cx={SIZE / 2}
            cy={SIZE / 2}
            r={R}
            stroke={alpha(colors.text, 0.07)}
            strokeWidth={STROKE}
            fill={alpha(colors.card, 0.85)}
          />
          <Circle
            cx={SIZE / 2}
            cy={SIZE / 2}
            r={R}
            stroke={ringColor}
            strokeWidth={STROKE}
            fill="none"
            strokeLinecap="round"
            strokeDasharray={`${CIRCUMFERENCE * frac} ${CIRCUMFERENCE}`}
            transform={`rotate(-90 ${SIZE / 2} ${SIZE / 2})`}
          />
        </Svg>
        <View style={styles.ringCenter} pointerEvents="none">
          {done ? (
            <Pop from={0.6}>
              <Text style={styles.timeUp}>{t("timesUp")}</Text>
            </Pop>
          ) : (
            <>
              <Text style={[styles.time, urgent && { color: colors.danger }]}>
                {formatTime(secondsLeft)}
              </Text>
              {!started ? <Text style={styles.tapHint}>{t("tapToStart")}</Text> : null}
            </>
          )}
        </View>
      </Pressable>

      {/* play / pause */}
      {!done ? (
        <PlayPause running={running} onPress={toggle} />
      ) : null}
    </View>
  );

  return (
    <Screen glow={glow}>
      <View style={styles.center}>
        <Pop>
          <Text style={styles.heading}>{t("discussion")}</Text>
        </Pop>
        <Appear index={1}>
          <Text style={styles.instructions}>{instructions ?? t("discussionInstr")}</Text>
        </Appear>

        {firstPlayer ? (
          <Pop delay={220} from={0.7}>
            <View
              style={[
                styles.firstChip,
                {
                  borderColor: firstPlayer.color,
                  backgroundColor: alpha(firstPlayer.color, 0.14),
                },
                elevation.glow(firstPlayer.color),
              ]}
            >
              <Text style={[styles.firstText, { color: firstPlayer.color }]}>
                {tf("goesFirst", { name: firstPlayer.name })}
              </Text>
            </View>
          </Pop>
        ) : null}

        {timerEnabled ? (
          // Only in the last ten seconds — a permanently throbbing clock
          // is noise, one that starts throbbing is information.
          urgent ? (
            <Pulse to={1.05} period={500}>
              {timer}
            </Pulse>
          ) : (
            timer
          )
        ) : null}
      </View>

      <View style={styles.bottom}>
        <BigButton label={t("vote")} onPress={onVote} />
      </View>
    </Screen>
  );
}

// Play / pause, with the same press feel as everything else.
function PlayPause({ running, onPress }: { running: boolean; onPress: () => void }) {
  const press = usePressScale(0.88);
  return (
    <Animated.View style={press.style}>
      <Pressable
        onPress={onPress}
        onPressIn={press.onPressIn}
        onPressOut={press.onPressOut}
        style={styles.playButton}
      >
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
    </Animated.View>
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
    ...type.title,
    fontSize: 34,
    color: colors.text,
  },
  instructions: {
    ...type.body,
    lineHeight: 24,
    color: colors.textDim,
    textAlign: "center",
    paddingHorizontal: spacing.sm,
  },
  firstChip: {
    borderRadius: radius.pill,
    borderWidth: 1.5,
    paddingVertical: 10,
    paddingHorizontal: spacing.md,
  },
  firstText: {
    fontSize: 17,
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
    ...type.display,
    fontSize: 54,
    color: colors.text,
    fontVariant: ["tabular-nums"],
  },
  tapHint: {
    ...type.caption,
    color: colors.textFaint,
    marginTop: 2,
  },
  timeUp: {
    ...type.title,
    fontSize: 32,
    color: colors.danger,
    textAlign: "center",
  },
  playButton: {
    width: 64,
    height: 64,
    borderRadius: radius.pill,
    backgroundColor: alpha(colors.card, 0.9),
    borderWidth: 1.5,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  bottom: {
    paddingBottom: spacing.md,
  },
});
