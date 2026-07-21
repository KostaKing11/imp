import React, { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import AppModal from "../../components/AppModal";
import BigButton from "../../components/BigButton";
import ColorPicker from "../../components/ColorPicker";
import TextField from "../../components/TextField";
import Toggle from "../../components/Toggle";
import { RoleDef } from "../../game/types";
import { t, tf } from "../../i18n";
import { colors, spacing } from "../../theme";
import { confirmDialog } from "../../utils";

type Props = {
  visible: boolean;
  role: RoleDef | null; // pre-filled blank for new roles
  isNew: boolean;
  // Mafia custom roles get a good/evil toggle instead of word toggles.
  mafia?: boolean;
  onSave: (role: RoleDef) => void;
  onDelete: (id: string) => void;
  onClose: () => void;
};

// Info editor for CUSTOM roles only (name, description, color, behavior).
// How many of a role is in the game is set by tapping the role chip.
export default function RoleEditor({
  visible,
  role,
  isNew,
  mafia = false,
  onSave,
  onDelete,
  onClose,
}: Props) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [color, setColor] = useState("#7B2CBF");
  const [knowsWord, setKnowsWord] = useState(true);
  const [seesImposter, setSeesImposter] = useState(false);
  const [evil, setEvil] = useState(false);

  useEffect(() => {
    if (role) {
      setName(role.name);
      setDescription(role.description);
      setColor(role.color);
      setKnowsWord(role.knowsWord);
      setSeesImposter(role.seesImposter ?? false);
      setEvil(role.evil ?? false);
    }
  }, [role]);

  if (!role) return null;

  const save = () => {
    if (mafia) {
      onSave({ ...role, name: name.trim(), description: description.trim(), color, evil, enabled: true });
    } else {
      onSave({
        ...role,
        name: name.trim(),
        description: description.trim(),
        color,
        knowsWord,
        seesImposter,
        enabled: true,
      });
    }
  };

  return (
    <AppModal visible={visible} title={isNew ? t("newRole") : t("editRole")} onClose={onClose}>
      <TextField label={t("roleNameLabel")} value={name} onChangeText={setName} placeholder="…" />
      <TextField
        label={t("roleDescLabel")}
        value={description}
        onChangeText={setDescription}
        placeholder="…"
        multiline
      />
      <ColorPicker value={color} onChange={setColor} />

      {mafia ? (
        <View style={styles.switchRow}>
          <View style={styles.switchText}>
            <Text style={styles.switchLabel}>{t("evilRole")}</Text>
            <Text style={styles.switchHint}>{t("evilRoleHint")}</Text>
          </View>
          <Toggle value={evil} onChange={setEvil} />
        </View>
      ) : (
        <>
          <View style={styles.switchRow}>
            <View style={styles.switchText}>
              <Text style={styles.switchLabel}>{t("seesWord")}</Text>
              <Text style={styles.switchHint}>{t("seesWordHint")}</Text>
            </View>
            <Toggle value={knowsWord} onChange={setKnowsWord} />
          </View>
          <View style={styles.switchRow}>
            <View style={styles.switchText}>
              <Text style={styles.switchLabel}>{t("seesImposter")}</Text>
              <Text style={styles.switchHint}>{t("seesImposterHint")}</Text>
            </View>
            <Toggle value={seesImposter} onChange={setSeesImposter} />
          </View>
        </>
      )}

      <BigButton label={t("save")} compact disabled={name.trim().length === 0} onPress={save} />
      {!isNew ? (
        <BigButton
          label={t("deleteRole")}
          variant="secondary"
          compact
          onPress={() =>
            confirmDialog(t("deleteRoleQ"), tf("deleteRoleText", { name: role.name }), () =>
              onDelete(role.id)
            )
          }
        />
      ) : null}
    </AppModal>
  );
}

const styles = StyleSheet.create({
  switchRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  switchText: {
    flex: 1,
  },
  switchLabel: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.text,
  },
  switchHint: {
    fontSize: 12,
    color: colors.textDim,
    marginTop: 2,
  },
});
