import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { BlefRound, Player } from "../game/types";
import { t } from "../i18n";
import { alpha, colors, radius, spacing, type } from "../theme";
import { capitalize } from "../utils";
import CardHandout from "./reveal/CardHandout";

type Props = {
  players: Player[];
  round: BlefRound;
  onDone: () => void;
  onLeave: () => void;
};

// Bluff hand-out. Your card tells you which of the two you are holding —
// without that you have nothing to reason from when you call what the
// other one got. What stays secret is only their half.
export default function BlefRevealScreen({ players, round, onDone, onLeave }: Props) {
  return (
    <CardHandout
      players={players}
      onDone={onDone}
      onLeave={onLeave}
      faceColor={() => colors.word}
      renderFace={(p) => {
        const clue = round.clues[p.id];
        const isWord = clue?.isWord ?? false;
        return (
          <>
            <View style={[styles.kindPill, isWord ? styles.kindWord : styles.kindHint]}>
              <Text style={[styles.kindText, { color: isWord ? colors.word : colors.blefTeal }]}>
                {isWord ? t("blefYouGotWord") : t("blefYouGotHint")}
              </Text>
            </View>
            <Text style={[styles.clue, { color: isWord ? colors.word : colors.blefTeal }]}>
              {capitalize(clue?.text ?? "")}
            </Text>
            <Text style={styles.note}>{t("blefCardNote")}</Text>
          </>
        );
      }}
    />
  );
}

const styles = StyleSheet.create({
  kindPill: {
    borderRadius: radius.pill,
    borderWidth: 1.5,
    paddingVertical: 7,
    paddingHorizontal: spacing.sm,
  },
  kindWord: {
    borderColor: alpha(colors.word, 0.8),
    backgroundColor: alpha(colors.word, 0.14),
  },
  kindHint: {
    borderColor: alpha(colors.blefTeal, 0.8),
    backgroundColor: alpha(colors.blefTeal, 0.14),
  },
  kindText: { ...type.eyebrow, fontSize: 13 },
  clue: {
    fontSize: 38,
    fontWeight: "900",
    textAlign: "center",
  },
  note: {
    ...type.caption,
    fontSize: 14,
    lineHeight: 20,
    color: colors.textDim,
    textAlign: "center",
    marginTop: spacing.sm,
  },
});
