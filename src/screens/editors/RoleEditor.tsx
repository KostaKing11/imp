import React, { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import AppModal from "../../components/AppModal";
import BigButton from "../../components/BigButton";
import ColorPicker from "../../components/ColorPicker";
import TextField from "../../components/TextField";
import Toggle from "../../components/Toggle";
import { RoleDef } from "../../game/types";
import { colors, spacing } from "../../theme";
import { confirmDialog } from "../../utils";

type Props = {
  visible: boolean;
  role: RoleDef | null; // pre-filled blank for new roles
  isNew: boolean;
  onSave: (role: RoleDef) => void;
  onDelete: (id: string) => void;
  onClose: () => void;
};

// Info editor for CUSTOM roles only (name, description, color, sees-word).
// How many of a role is in the game is set by tapping the role chip.
export default function RoleEditor({ visible, role, isNew, onSave, onDelete, onClose }: Props) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [color, setColor] = useState("#7B2CBF");
  const [knowsWord, setKnowsWord] = useState(true);

  useEffect(() => {
    if (role) {
      setName(role.name);
      setDescription(role.description);
      setColor(role.color);
      setKnowsWord(role.knowsWord);
    }
  }, [role]);

  if (!role) return null;

  return (
    <AppModal visible={visible} title={isNew ? "New role" : "Edit role"} onClose={onClose}>
      <TextField label="Role name" value={name} onChangeText={setName} placeholder="e.g. Detective" />
      <TextField
        label="Description (shown on the role card)"
        value={description}
        onChangeText={setDescription}
        placeholder="What does this role do?"
        multiline
      />
      <ColorPicker value={color} onChange={setColor} />

      <View style={styles.switchRow}>
        <View style={styles.switchText}>
          <Text style={styles.switchLabel}>Sees the secret word</Text>
          <Text style={styles.switchHint}>
            Off = this role only gets a random hint, like the imposter.
          </Text>
        </View>
        <Toggle value={knowsWord} onChange={setKnowsWord} />
      </View>

      <BigButton
        label="Save"
        compact
        disabled={name.trim().length === 0}
        onPress={() =>
          onSave({
            ...role,
            name: name.trim(),
            description: description.trim(),
            color,
            knowsWord,
            enabled: true,
          })
        }
      />
      {!isNew ? (
        <BigButton
          label="Delete role"
          variant="secondary"
          compact
          onPress={() =>
            confirmDialog("Delete role?", `"${role.name}" will be deleted.`, () => onDelete(role.id))
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
