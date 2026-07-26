import React, { useEffect, useState } from "react";
import AppModal from "../../components/AppModal";
import BigButton from "../../components/BigButton";
import ColorPicker from "../../components/ColorPicker";
import TextField from "../../components/TextField";
import { Player } from "../../game/types";
import { t, tf } from "../../i18n";
import { confirmDialog } from "../../utils";

type Props = {
  visible: boolean;
  player: Player | null; // the player being edited (with defaults pre-filled for new ones)
  isNew: boolean;
  canDelete: boolean;
  // Colors the other players already have.
  takenColors: string[];
  onSave: (player: Player) => void;
  onDelete: (id: string) => void;
  onClose: () => void;
};

export default function PlayerEditor({
  visible,
  player,
  isNew,
  canDelete,
  takenColors,
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
      title={isNew ? t("newPlayer") : t("editPlayer")}
      onClose={onClose}
    >
      <TextField
        label={t("name")}
        value={name}
        onChangeText={setName}
        placeholder={t("name")}
        autoCapitalize="words"
      />
      <ColorPicker value={color} onChange={setColor} taken={takenColors} />
      <BigButton
        label={t("save")}
        compact
        onPress={() => onSave({ ...player, name: name.trim() || player.name, color })}
      />
      {!isNew && canDelete ? (
        <BigButton
          label={t("removePlayer")}
          variant="secondary"
          compact
          onPress={() =>
            confirmDialog(t("removePlayerQ"), tf("removePlayerText", { name: player.name }), () =>
              onDelete(player.id)
            )
          }
        />
      ) : null}
    </AppModal>
  );
}
