import React, { useRef, useState } from "react";
import { Animated, Pressable, StyleSheet, Text, View } from "react-native";
import BigButton from "../../components/BigButton";
import { t, tf } from "../../i18n";
import { NetCard } from "../../net/protocol";
import { colors, radius, spacing } from "../../theme";
import { capitalize, textColorFor } from "../../utils";

type Props = {
  card: NetCard | null;
  myName: string;
  myColor: string;
  ready: boolean;
  onReady: () => void;
  readyCount: number;
  total: number;
  isHost: boolean;
  onContinue: () => void;
};

// Your own private card on your own phone: hold to flip, release to hide.
// Same look as the pass-and-play cards, minus the "pass the phone" part.
export default function NetCardView({
  card,
  myName,
  myColor,
  ready,
  onReady,
  readyCount,
  total,
  isHost,
  onContinue,
}: Props) {
  const [holding, setHolding] = useState(false);
  const [peeked, setPeeked] = useState(false);
  const flip = useRef(new Animated.Value(0)).current;

  const pressIn = () => {
    setHolding(true);
    setPeeked(true);
    Animated.spring(flip, { toValue: 1, friction: 8, useNativeDriver: true }).start();
  };
  const pressOut = () => {
    setHolding(false);
    Animated.spring(flip, { toValue: 0, friction: 8, useNativeDriver: true }).start();
  };

  const frontRotate = flip.interpolate({ inputRange: [0, 1], outputRange: ["0deg", "180deg"] });
  const backRotate = flip.interpolate({ inputRange: [0, 1], outputRange: ["180deg", "360deg"] });

  const faceColor = card?.roleColor ?? colors.card;
  const faceText = card?.roleColor ? textColorFor(card.roleColor) : colors.text;
  const valueLabel =
    card?.valueKind === "word"
      ? t("theWordIs")
      : card?.valueKind === "hint"
        ? t("yourOnlyClue")
        : card?.valueKind === "oddWord"
          ? t("yourWordIs")
          : card?.valueKind === "clue"
            ? t("yourClue")
            : null;
  const note =
    card?.mode === "odd" ? t("oddCardNote") : card?.mode === "blef" ? t("blefCardNote") : null;

  return (
    <View style={styles.wrap}>
      <Text style={styles.owner}>{myName}</Text>
      <Text style={styles.instruction}>{peeked && !holding ? " " : t("holdCardInstr")}</Text>

      <Pressable onPressIn={pressIn} onPressOut={pressOut} style={styles.cardArea}>
        {/* front (face down) */}
        <Animated.View
          style={[
            styles.card,
            { backgroundColor: myColor },
            { transform: [{ perspective: 1200 }, { rotateY: frontRotate }] },
          ]}
        >
          <Text style={[styles.backLogo, { color: textColorFor(myColor) }]}>IMP</Text>
          <Text style={[styles.backHint, { color: textColorFor(myColor) }]}>
            {t("holdToReveal")}
          </Text>
        </Animated.View>

        {/* back (what you secretly got) */}
        <Animated.View
          style={[
            styles.card,
            styles.face,
            {
              backgroundColor: faceColor,
              borderColor: card?.roleColor ? "rgba(255,255,255,0.25)" : colors.word,
            },
            { transform: [{ perspective: 1200 }, { rotateY: backRotate }] },
          ]}
        >
          {card?.roleName ? (
            <Text style={[styles.roleName, { color: faceText }]}>{card.roleName}</Text>
          ) : null}
          {card?.roleDesc ? (
            <Text style={[styles.roleDesc, { color: faceText }]}>{card.roleDesc}</Text>
          ) : null}

          {valueLabel ? (
            <View style={[styles.valueBox, !card?.roleColor && styles.valueBoxPlain]}>
              <Text style={[styles.valueLabel, { color: faceText }]}>{valueLabel}</Text>
              <Text
                style={[
                  styles.value,
                  { color: card?.roleColor ? faceText : colors.word },
                ]}
              >
                {capitalize(card?.value ?? "")}
              </Text>
            </View>
          ) : null}

          {note ? <Text style={[styles.note, { color: colors.textDim }]}>{note}</Text> : null}

          {card?.extraKind === "imposter" && card.extraNames?.length ? (
            <Text style={[styles.extra, { color: faceText }]}>
              {tf("imposterLabel", { names: card.extraNames.join(" & ") })}
            </Text>
          ) : null}
        </Animated.View>
      </Pressable>

      <View style={styles.bottom}>
        {!ready ? (
          peeked && !holding ? (
            <BigButton label={t("gotIt")} onPress={onReady} />
          ) : (
            <Text style={styles.privacy}>{t("nobodyLooking")}</Text>
          )
        ) : (
          <Text style={styles.privacy}>{t("waitingPlayers")}</Text>
        )}
        <Text style={styles.counter}>{tf("readyCount", { done: readyCount, total })}</Text>
        {isHost ? (
          <BigButton
            label={t("continueBtn")}
            variant={ready ? "primary" : "secondary"}
            onPress={onContinue}
          />
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, alignItems: "center", paddingTop: spacing.sm },
  owner: { fontSize: 24, fontWeight: "900", color: colors.text },
  instruction: {
    fontSize: 14,
    color: colors.textDim,
    marginTop: spacing.xs,
    marginBottom: spacing.sm,
  },
  cardArea: { width: "86%", flex: 1, maxHeight: 460, minHeight: 260 },
  card: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: radius.lg,
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.md,
    backfaceVisibility: "hidden",
    borderWidth: 3,
    borderColor: "rgba(255,255,255,0.25)",
  },
  face: { gap: spacing.sm },
  backLogo: { fontSize: 52, fontWeight: "900", letterSpacing: 4 },
  backHint: { fontSize: 13, fontWeight: "700", letterSpacing: 3, marginTop: spacing.sm },
  roleName: { fontSize: 30, fontWeight: "900", textAlign: "center" },
  roleDesc: { fontSize: 15, lineHeight: 22, textAlign: "center", opacity: 0.9 },
  valueBox: {
    alignItems: "center",
    alignSelf: "stretch",
    backgroundColor: "rgba(0,0,0,0.25)",
    borderRadius: radius.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  valueBoxPlain: { backgroundColor: "transparent" },
  valueLabel: { fontSize: 14, opacity: 0.8 },
  value: { fontSize: 34, fontWeight: "900", textAlign: "center" },
  note: { fontSize: 14, lineHeight: 20, textAlign: "center" },
  extra: { fontSize: 16, fontWeight: "800", textAlign: "center" },
  bottom: {
    alignSelf: "stretch",
    gap: spacing.xs,
    paddingTop: spacing.md,
    paddingBottom: spacing.md,
  },
  privacy: { fontSize: 14, color: colors.textDim, textAlign: "center", minHeight: 20 },
  counter: { fontSize: 13, color: colors.textDim, textAlign: "center" },
});
