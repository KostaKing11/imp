import React, { useEffect, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { PairEntry } from "../../../data/pairs";
import AppModal from "../../components/AppModal";
import BigButton from "../../components/BigButton";
import TextField from "../../components/TextField";
import { PairCategoryState } from "../../game/types";
import { t, tf } from "../../i18n";
import { colors, radius, spacing } from "../../theme";
import { confirmDialog } from "../../utils";

type Props = {
  visible: boolean;
  category: PairCategoryState | null; // pre-filled blank for new categories
  isNew: boolean;
  onSave: (category: PairCategoryState) => void;
  onDelete: (id: string) => void;
  onClose: () => void;
};

// Editor for CUSTOM Odd One Out categories: name + word pairs.
// The game randomly decides which word of a pair the group gets.
export default function PairCategoryEditor({
  visible,
  category,
  isNew,
  onSave,
  onDelete,
  onClose,
}: Props) {
  const [name, setName] = useState("");
  const [pairs, setPairs] = useState<PairEntry[]>([]);
  const [wordA, setWordA] = useState("");
  const [wordB, setWordB] = useState("");
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  useEffect(() => {
    if (category) {
      setName(category.name);
      setPairs(category.pairs);
      setWordA("");
      setWordB("");
      setEditingIndex(null);
    }
  }, [category]);

  if (!category) return null;

  const canAddPair = wordA.trim().length > 0 && wordB.trim().length > 0;

  const addOrUpdatePair = () => {
    const entry: PairEntry = { main: wordA.trim(), odd: wordB.trim() };
    if (editingIndex !== null) {
      setPairs(pairs.map((p, i) => (i === editingIndex ? entry : p)));
    } else {
      setPairs([...pairs, entry]);
    }
    setWordA("");
    setWordB("");
    setEditingIndex(null);
  };

  const startEditing = (index: number) => {
    setEditingIndex(index);
    setWordA(pairs[index].main);
    setWordB(pairs[index].odd);
  };

  const removePair = (index: number) => {
    setPairs(pairs.filter((_, i) => i !== index));
    if (editingIndex === index) {
      setEditingIndex(null);
      setWordA("");
      setWordB("");
    }
  };

  return (
    <AppModal
      visible={visible}
      title={isNew ? t("newCategory") : t("editCategory")}
      onClose={onClose}
    >
      <TextField label={t("categoryName")} value={name} onChangeText={setName} placeholder="…" />

      <Text style={styles.sectionLabel}>{tf("pairsCount", { n: pairs.length })}</Text>
      {pairs.map((p, i) => (
        <View key={`${p.main}-${p.odd}-${i}`} style={styles.pairRow}>
          <Pressable style={styles.pairInfo} onPress={() => startEditing(i)}>
            <Text style={styles.pairText}>
              {p.main}  ·  {p.odd}
            </Text>
            <Text style={styles.pairHint}>{t("tapToEdit")}</Text>
          </Pressable>
          <Pressable onPress={() => removePair(i)} hitSlop={8}>
            <Text style={styles.remove}>✕</Text>
          </Pressable>
        </View>
      ))}

      <View style={styles.inputRow}>
        <View style={styles.inputHalf}>
          <TextField
            label={editingIndex !== null ? t("editWord1") : t("word1")}
            value={wordA}
            onChangeText={setWordA}
            placeholder="…"
          />
        </View>
        <View style={styles.inputHalf}>
          <TextField
            label={editingIndex !== null ? t("editWord2") : t("word2")}
            value={wordB}
            onChangeText={setWordB}
            placeholder="…"
          />
        </View>
      </View>
      <BigButton
        label={editingIndex !== null ? t("updatePair") : t("addPair")}
        variant="secondary"
        compact
        disabled={!canAddPair}
        onPress={addOrUpdatePair}
      />

      <BigButton
        label={t("saveCategory")}
        compact
        disabled={name.trim().length === 0 || pairs.length === 0}
        onPress={() => onSave({ ...category, name: name.trim(), pairs })}
      />
      {!isNew ? (
        <BigButton
          label={t("deleteCategory")}
          variant="secondary"
          compact
          onPress={() =>
            confirmDialog(
              t("deleteCategoryQ"),
              tf("deleteCategoryTextPairs", { name: category.name }),
              () => onDelete(category.id)
            )
          }
        />
      ) : null}
    </AppModal>
  );
}

const styles = StyleSheet.create({
  sectionLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.textDim,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  pairRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.chip,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: 10,
    paddingHorizontal: spacing.sm,
  },
  pairInfo: {
    flex: 1,
  },
  pairText: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.text,
  },
  pairHint: {
    fontSize: 12,
    color: colors.textDim,
  },
  remove: {
    fontSize: 18,
    color: colors.danger,
    paddingHorizontal: spacing.xs,
  },
  inputRow: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  inputHalf: {
    flex: 1,
  },
});
