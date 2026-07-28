import React, { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import BigButton from "../../components/BigButton";
import FlipCard from "../../components/FlipCard";
import { t, tf } from "../../i18n";
import { NetCard } from "../../net/protocol";
import { colors, radius, spacing } from "../../theme";
import { capitalize } from "../../utils";

type Props = {
  card: NetCard | null;
  myName: string;
  myColor: string;
  ready: boolean;
  onReady: () => void;
  readyCount: number;
  total: number;
};

// Your own card on your own phone: hold to flip, release to hide. Same
// card as the pass-and-play modes, minus the passing.
export default function NetCardView({
  card,
  myName,
  myColor,
  ready,
  onReady,
  readyCount,
  total,
}: Props) {
  const [peeked, setPeeked] = useState(false);

  // Modes where every card must look identical keep one shared colour;
  // role cards take the role's.
  const faceColor =
    card?.roleColor ??
    (card?.mode === "odd" ? colors.oddYellow : card?.mode === "blef" ? colors.word : myColor);

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
      <FlipCard
        name={myName}
        color={myColor}
        faceColor={faceColor}
        onPeeked={() => setPeeked(true)}
      >
        {card?.roleName ? (
          <Text style={[styles.roleName, { color: faceColor }]}>{card.roleName}</Text>
        ) : null}
        {card?.roleDesc ? <Text style={styles.roleDesc}>{card.roleDesc}</Text> : null}

        {valueLabel ? (
          <View style={[styles.valueBox, { borderColor: faceColor }]}>
            <Text style={styles.valueLabel}>{valueLabel}</Text>
            <Text style={[styles.value, { color: faceColor }]}>
              {capitalize(card?.value ?? "")}
            </Text>
          </View>
        ) : null}

        {note ? <Text style={styles.note}>{note}</Text> : null}

        {card?.extraKind === "imposter" && card.extraNames?.length ? (
          <Text style={[styles.extra, { color: faceColor }]}>
            {tf("imposterLabel", { names: card.extraNames.join(" & ") })}
          </Text>
        ) : null}
      </FlipCard>

      <View style={styles.bottom}>
        {!ready ? (
          peeked ? (
            <BigButton label={t("gotIt")} onPress={onReady} />
          ) : (
            <Text style={styles.privacy}>{t("nobodyLooking")}</Text>
          )
        ) : (
          <Text style={styles.privacy}>{t("waitingPlayers")}</Text>
        )}
        <Text style={styles.counter}>{tf("readyCount", { done: readyCount, total })}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, alignItems: "center", paddingTop: spacing.sm },
  roleName: { fontSize: 30, fontWeight: "900", textAlign: "center" },
  roleDesc: {
    fontSize: 15,
    lineHeight: 22,
    textAlign: "center",
    color: colors.textDim,
  },
  valueBox: {
    alignItems: "center",
    alignSelf: "stretch",
    borderWidth: 2,
    borderRadius: radius.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  valueLabel: { fontSize: 14, color: colors.textDim },
  value: { fontSize: 34, fontWeight: "900", textAlign: "center" },
  note: { fontSize: 14, lineHeight: 20, textAlign: "center", color: colors.textDim },
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
