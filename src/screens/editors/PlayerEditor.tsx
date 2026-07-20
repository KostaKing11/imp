import React, { useEffect, useState } from "react";
import AppModal from "../../components/AppModal";
import BigButton from "../../components/BigButton";
import ColorPicker from "../../components/ColorPicker";
import TextField from "../../components/TextField";
import { Player } from "../../game/types";
import { confirmDialog } from "../../utils";

type Props = {
  visible: boolean;
  player: Player | null; // the player being edited (with defaults pre-filled for new ones)
  isNew: boolean;
  canDelete: boolean;
  onSave: (player: Player) => void;
  onDelete: (id: string) => void;
  onClose: () => void;
};

export default function PlayerEditor({
  visible,
  player,
  isNew,
  canDelete,
  onSave,
  onDelete,
  onClose,
}: Props) {
  const [name, setName] = useState("");
  const [color, setColor] = useState("#1E4FFF");

  useEffect(() => {
    if (player) {
      setName(player.name);
      setColor(player.color);
    }
  }, [player]);

  if (!player) return null;

  return (
    <AppModal
      visible={visible}
      title={isNew ? "New player" : "Edit player"}
      onClose={onClose}
    >
      <TextField label="Name" value={name} onChangeText={setName} placeholder="Name" autoCapitalize="words" />
      <ColorPicker value={color} onChange={setColor} />
      <BigButton
        label="Save"
        compact
        onPress={() => onSave({ ...player, name: name.trim() || player.name, color })}
      />
      {!isNew && canDelete ? (
        <BigButton
          label="Remove player"
          variant="secondary"
          compact
          onPress={() =>
            confirmDialog("Remove player?", `${player.name} will be removed.`, () =>
              onDelete(player.id)
            )
          }
        />
      ) : null}
    </AppModal>
  );
}
