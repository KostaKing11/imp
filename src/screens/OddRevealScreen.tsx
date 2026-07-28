import React from "react";
import { StyleSheet, Text } from "react-native";
import { OddRound, Player } from "../game/types";
import { t } from "../i18n";
import { colors, spacing } from "../theme";
import CardHandout from "./reveal/CardHandout";

type Props = {
  players: Player[];
  round: OddRound;
  onDone: () => void;
  onLeave: () => void;
};

// Odd One Out hand-out. Every card looks EXACTLY the same — same colour,
// same layout — so nothing on screen can give the odd player away. Only
// the word differs.
export default function OddRevealScreen({ players, round, onDone, onLeave }: Props) {
  const wordFor = (playerId: string) =>
    playerId === round.oddPlayerId ? round.oddWord : round.mainWord;

  return (
    <CardHandout
      players={players}
      onDone={onDone}
      onLeave={onLeave}
      faceColor={() => colors.oddYellow}
      renderFace={(p) => (
        <>
          <Text style={styles.label}>{t("yourWordIs")}</Text>
          <Text style={styles.word}>{wordFor(p.id)}</Text>
          <Text style={styles.note}>{t("oddCardNote")}</Text>
        </>
      )}
    />
  );
}

const styles = StyleSheet.create({
  label: { fontSize: 16, color: colors.textDim },
  word: {
    fontSize: 40,
    fontWeight: "900",
    color: colors.oddYellow,
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
