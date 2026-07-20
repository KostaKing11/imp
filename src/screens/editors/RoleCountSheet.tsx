import React from "react";
import { StyleSheet, Text } from "react-native";
import AppModal from "../../components/AppModal";
import Stepper from "../../components/Stepper";
import { RoleDef } from "../../game/types";
import { colors } from "../../theme";

type Props = {
  visible: boolean;
  role: RoleDef | null;
  maxCount: number;
  onChangeCount: (roleId: string, count: number) => void;
  onClose: () => void;
};

// Tap a role chip -> pick how many of that role are in the game.
// Imposter is always at least 1; everything else can be 0.
export default function RoleCountSheet({ visible, role, maxCount, onChangeCount, onClose }: Props) {
  if (!role) return null;

  const min = role.kind === "imposter" ? 1 : 0;

  return (
    <AppModal visible={visible} title={role.name} onClose={onClose}>
      {role.description ? <Text style={styles.description}>{role.description}</Text> : null}
      <Stepper
        label="In the game"
        value={role.count}
        min={min}
        max={Math.max(min, maxCount)}
        onChange={(v) => onChangeCount(role.id, v)}
      />
      {role.count === 0 ? (
        <Text style={styles.offNote}>0 = this role is not in the game.</Text>
      ) : null}
    </AppModal>
  );
}

const styles = StyleSheet.create({
  description: {
    fontSize: 14,
    lineHeight: 21,
    color: colors.textDim,
    textAlign: "center",
  },
  offNote: {
    fontSize: 13,
    color: colors.textDim,
    textAlign: "center",
  },
});
