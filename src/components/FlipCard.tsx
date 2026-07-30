import React, { useRef, useState } from "react";
import { Animated, Pressable, StyleSheet, Text, View } from "react-native";
import { t } from "../i18n";
import { alpha, colors, elevation, motion, radius, spacing } from "../theme";
import Gradient from "./Gradient";

type Props = {
  // Whose card this is — the front carries their name and colour.
  name: string;
  color: string;
  // The colour of the face: a role's colour, or the player's own.
  faceColor?: string;
  children: React.ReactNode;
  onPeeked?: () => void;
};

// The card you hold to look at. Both faces are dark and outlined in a
// colour — the player's on the front, the role's (or theirs) on the back.
// Holding it lifts it towards you as it turns, which is most of why the
// reveal feels like a reveal.
export default function FlipCard({ name, color, faceColor, children, onPeeked }: Props) {
  const [holding, setHolding] = useState(false);
  const [peeked, setPeeked] = useState(false);
  const flip = useRef(new Animated.Value(0)).current;

  const pressIn = () => {
    setHolding(true);
    if (!peeked) {
      setPeeked(true);
      onPeeked?.();
    }
    Animated.spring(flip, { toValue: 1, ...motion.soft, useNativeDriver: true }).start();
  };
  const pressOut = () => {
    setHolding(false);
    Animated.spring(flip, { toValue: 0, ...motion.soft, useNativeDriver: true }).start();
  };

  const frontRotate = flip.interpolate({ inputRange: [0, 1], outputRange: ["0deg", "180deg"] });
  const backRotate = flip.interpolate({ inputRange: [0, 1], outputRange: ["180deg", "360deg"] });
  // Comes towards you through the turn and settles a touch larger — the
  // card is in your hands now, not on the table.
  const lift = flip.interpolate({ inputRange: [0, 0.5, 1], outputRange: [1, 1.06, 1.03] });
  const back = faceColor ?? color;

  return (
    <View style={styles.wrap}>
      <Text style={[styles.owner, { color }]}>{name}</Text>
      <Text style={styles.instruction}>{peeked && !holding ? " " : t("holdCardInstr")}</Text>

      <Pressable onPressIn={pressIn} onPressOut={pressOut} style={styles.area}>
        <Animated.View style={[styles.stack, { transform: [{ scale: lift }] }]}>
          {/* face down */}
          <Animated.View
            style={[
              styles.face,
              { borderColor: color },
              elevation.glow(color),
              { transform: [{ perspective: 1200 }, { rotateY: frontRotate }] },
            ]}
          >
            {/* The back of the deck: every card in the game shares it, so
                nothing about a face-down card gives anything away. */}
            <View style={[styles.pattern, { backgroundColor: alpha(color, 0.07) }]} />
            <View style={[styles.crest, { borderColor: alpha(color, 0.5) }]}>
              <Text style={[styles.logo, { color }]}>IMP</Text>
            </View>
            <Text style={styles.holdHint}>{t("holdToReveal")}</Text>
          </Animated.View>

          {/* what you secretly got */}
          <Animated.View
            style={[
              styles.face,
              styles.backFace,
              { borderColor: back },
              elevation.glowStrong(back),
              { transform: [{ perspective: 1200 }, { rotateY: backRotate }] },
            ]}
          >
            <Gradient from={alpha(back, 0.22)} to={alpha(back, 0.03)} angle={0.85} />
            {children}
          </Animated.View>
        </Animated.View>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  // Centred, not pinned to the top — the card should sit in the middle
  // of the screen, and give way when the keyboard comes up.
  // No flex:1 — the block is only as tall as the name plus the card, so
  // whatever sits around it can centre the whole thing properly.
  wrap: {
    alignItems: "center",
    alignSelf: "stretch",
    flexShrink: 1,
  },
  owner: { fontSize: 26, fontWeight: "900" },
  instruction: {
    fontSize: 14,
    color: colors.textDim,
    marginTop: spacing.xs,
    marginBottom: spacing.sm,
    minHeight: 20,
  },
  area: {
    width: "86%",
    aspectRatio: 0.72,
    maxHeight: 430,
    // Shrinks a long way when the keyboard is up, so the answer box and
    // its button always stay above it.
    minHeight: 120,
    flexShrink: 1,
  },
  stack: {
    flex: 1,
  },
  face: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: radius.lg,
    borderWidth: 3,
    backgroundColor: colors.card,
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.md,
    overflow: "hidden",
    backfaceVisibility: "hidden",
  },
  backFace: { gap: spacing.sm },
  pattern: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  crest: {
    borderWidth: 2,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  logo: { fontSize: 52, fontWeight: "900", letterSpacing: 4 },
  holdHint: {
    fontSize: 13,
    fontWeight: "700",
    letterSpacing: 3,
    color: colors.textDim,
    marginTop: spacing.sm,
  },
});
