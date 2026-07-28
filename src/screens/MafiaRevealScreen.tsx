import React from "react";
import { StyleSheet, Text } from "react-native";
import { MAFIA_CIVILIAN } from "../game/roles";
import { MafiaRound, Player, RoleDef } from "../game/types";
import { roleDesc, roleName } from "../i18n";
import { colors } from "../theme";
import CardHandout from "./reveal/CardHandout";

type Props = {
  players: Player[];
  roles: RoleDef[];
  round: MafiaRound;
  onDone: () => void;
  onLeave: () => void;
};

function roleFor(round: MafiaRound, roles: RoleDef[], playerId: string): RoleDef {
  const roleId = round.assignments[playerId];
  return roles.find((r) => r.id === roleId) ?? MAFIA_CIVILIAN;
}

// Mafia hand-out: the card back is the role, outlined in its colour.
// No words in this mode — just who you are and what you do at night.
export default function MafiaRevealScreen({ players, roles, round, onDone, onLeave }: Props) {
  return (
    <CardHandout
      players={players}
      onDone={onDone}
      onLeave={onLeave}
      faceColor={(p) => roleFor(round, roles, p.id).color}
      renderFace={(p) => {
        const role = roleFor(round, roles, p.id);
        return (
          <>
            <Text style={[styles.roleName, { color: role.color }]}>{roleName(role)}</Text>
            {roleDesc(role) ? <Text style={styles.roleDescription}>{roleDesc(role)}</Text> : null}
          </>
        );
      }}
    />
  );
}

const styles = StyleSheet.create({
  roleName: { fontSize: 34, fontWeight: "900", textAlign: "center" },
  roleDescription: {
    fontSize: 15,
    lineHeight: 22,
    textAlign: "center",
    color: colors.textDim,
  },
});
