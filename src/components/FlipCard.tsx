import React, { useRef, useState } from "react";
import { Animated, Pressable, StyleSheet, Text, View } from "react-native";
import { t } from "../i18n";
import { colors, radius, spacing } from "../theme";

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
    Animated.spring(flip, { toValue: 1, friction: 8, useNativeDriver: true }).start();
  };
  const pressOut = () => {
    setHolding(false);
    Animated.spring(flip, { toValue: 0, friction: 8, useNativeDriver: true }).start();
  };

  const frontRotate = flip.interpolate({ inputRange: [0, 1], outputRange: ["0deg", "180deg"] });
  const backRotate = flip.interpolate({ inputRange: [0, 1], outputRange: ["180deg", "360deg"] });

  return (
    <View style={styles.wrap}>
      <Text style={[styles.owner, { color }]}>{name}</Text>
      <Text style={styles.instruction}>{peeked && !holding ? " " : t("holdCardInstr")}</Text>

      <Pressable onPressIn={pressIn} onPressOut={pressOut} style={styles.area}>
        {/* face down */}
        <Animated.View
          style={[
            styles.face,
            { borderColor: color },
            { transform: [{ perspective: 1200 }, { rotateY: frontRotate }] },
          ]}
        >
          <Text style={[styles.logo, { color }]}>IMP</Text>
          <Text style={styles.holdHint}>{t("holdToReveal")}</Text>
        </Animated.View>

        {/* what you secretly got */}
        <Animated.View
          style={[
            styles.face,
            styles.backFace,
            { borderColor: faceColor ?? color },
            { transform: [{ perspective: 1200 }, { rotateY: backRotate }] },
          ]}
        >
          {children}
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
    backfaceVisibility: "hidden",
  },
  backFace: { gap: spacing.sm },
  logo: { fontSize: 54, fontWeight: "900", letterSpacing: 4 },
  holdHint: {
    fontSize: 13,
    fontWeight: "700",
    letterSpacing: 3,
    color: colors.textDim,
    marginTop: spacing.sm,
  },
});
