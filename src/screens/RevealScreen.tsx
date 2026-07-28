import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { CIVILIAN } from "../game/roles";
import { Player, RoleDef, Round } from "../game/types";
import { roleDesc, roleName, t, tf } from "../i18n";
import { colors, radius, spacing } from "../theme";
import { capitalize } from "../utils";
import CardHandout from "./reveal/CardHandout";

type Props = {
  players: Player[];
  roles: RoleDef[];
  round: Round;
  onDone: () => void;
  onLeave: () => void;
};

function roleFor(round: Round, roles: RoleDef[], playerId: string): RoleDef {
  const roleId = round.assignments[playerId]?.roleId;
  return roles.find((r) => r.id === roleId) ?? CIVILIAN;
}

// IMP Classic hand-out: the card back is the player's role, outlined in
// the role's colour.
export default function RevealScreen({ players, roles, round, onDone, onLeave }: Props) {
  const imposterNames = players
    .filter((p) => roleFor(round, roles, p.id).kind === "imposter")
    .map((p) => p.name)
    .join(" & ");

  return (
    <CardHandout
      players={players}
      onDone={onDone}
      onLeave={onLeave}
      faceColor={(p) => roleFor(round, roles, p.id).color}
      renderFace={(p) => {
        const role = roleFor(round, roles, p.id);
        const hint = round.assignments[p.id]?.hint;
        return (
          <>
            <Text style={[styles.roleName, { color: role.color }]}>{roleName(role)}</Text>
            {roleDesc(role) ? (
              <Text style={styles.roleDescription}>{roleDesc(role)}</Text>
            ) : null}

            <View style={[styles.wordBox, { borderColor: role.color }]}>
              <Text style={styles.wordLabel}>
                {role.knowsWord ? t("theWordIs") : t("yourOnlyClue")}
              </Text>
              <Text style={[styles.word, { color: role.color }]}>
                {role.knowsWord ? round.word : capitalize(hint ?? "")}
              </Text>
            </View>

            {role.kind === "helper" || role.seesImposter ? (
              <Text style={[styles.helperInfo, { color: role.color }]}>
                {tf("imposterLabel", { names: imposterNames })}
              </Text>
            ) : null}
          </>
        );
      }}
    />
  );
}

const styles = StyleSheet.create({
  roleName: {
    fontSize: 32,
    fontWeight: "900",
    textAlign: "center",
  },
  roleDescription: {
    fontSize: 15,
    lineHeight: 22,
    textAlign: "center",
    color: colors.textDim,
  },
  wordBox: {
    alignItems: "center",
    alignSelf: "stretch",
    marginTop: spacing.sm,
    borderWidth: 2,
    borderRadius: radius.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  wordLabel: {
    fontSize: 13,
    color: colors.textDim,
  },
  word: {
    fontSize: 30,
    fontWeight: "900",
    textAlign: "center",
  },
  helperInfo: {
    fontSize: 16,
    fontWeight: "800",
    textAlign: "center",
  },
});
