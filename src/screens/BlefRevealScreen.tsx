import React from "react";
import { StyleSheet, Text } from "react-native";
import { BlefRound, Player } from "../game/types";
import { t } from "../i18n";
import { colors, spacing } from "../theme";
import { capitalize } from "../utils";
import CardHandout from "./reveal/CardHandout";

type Props = {
  players: Player[];
  round: BlefRound;
  onDone: () => void;
  onLeave: () => void;
};

// Bluff hand-out. The card never says whether what you are holding is
// the real word or only a hint — that is the whole game — so both cards
// look exactly alike.
export default function BlefRevealScreen({ players, round, onDone, onLeave }: Props) {
  return (
    <CardHandout
      players={players}
      onDone={onDone}
      onLeave={onLeave}
      faceColor={() => colors.word}
      renderFace={(p) => (
        <>
          <Text style={styles.label}>{t("yourClue")}</Text>
          <Text style={styles.clue}>{capitalize(round.clues[p.id]?.text ?? "")}</Text>
          <Text style={styles.note}>{t("blefCardNote")}</Text>
        </>
      )}
    />
  );
}

const styles = StyleSheet.create({
  label: { fontSize: 16, color: colors.textDim },
  clue: {
    fontSize: 38,
    fontWeight: "900",
    color: colors.word,
    textAlign: "center",
  },
  note: {
    fontSize: 14,
    lineHeight: 20,
    color: colors.textDim,
    textAlign: "center",
    marginTop: spacing.sm,
  },
});
