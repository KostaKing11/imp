import React from "react";
import { StyleSheet, Text } from "react-native";
import AppModal from "../../components/AppModal";
import Stepper from "../../components/Stepper";
import { RoleDef } from "../../game/types";
import { roleDesc, roleName, t } from "../../i18n";
import { colors } from "../../theme";

type Props = {
  visible: boolean;
  role: RoleDef | null;
  maxCount: number;
  onChangeCount: (roleId: string, count: number) => void;
  onClose: () => void;
};

// Tap a role chip -> pick how many of that role are in the game.
// Imposter/Mafia are always at least 1; everything else can be 0.
export default function RoleCountSheet({ visible, role, maxCount, onChangeCount, onClose }: Props) {
  if (!role) return null;

  const min = role.kind === "imposter" || role.kind === "mafia" ? 1 : 0;
  const max = role.kind === "narrator" ? 1 : Math.max(min, maxCount);

  return (
    <AppModal visible={visible} title={roleName(role)} onClose={onClose}>
      {roleDesc(role) ? <Text style={styles.description}>{roleDesc(role)}</Text> : null}
      <Stepper
        label={t("inTheGame")}
        value={role.count}
        min={min}
        max={max}
        onChange={(v) => onChangeCount(role.id, v)}
      />
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
});
