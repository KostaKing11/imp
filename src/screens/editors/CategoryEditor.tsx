import React, { useEffect, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { WordEntry } from "../../../data/words";
import AppModal from "../../components/AppModal";
import BigButton from "../../components/BigButton";
import TextField from "../../components/TextField";
import { CategoryState } from "../../game/types";
import { t, tf } from "../../i18n";
import { colors, radius, spacing } from "../../theme";
import { confirmDialog } from "../../utils";

type Props = {
  visible: boolean;
  category: CategoryState | null; // pre-filled blank for new categories
  isNew: boolean;
  onSave: (category: CategoryState) => void;
  onDelete: (id: string) => void;
  onClose: () => void;
};

// Editor for CUSTOM categories: name + word list, where each word
// has comma-separated hints.
export default function CategoryEditor({
  visible,
  category,
  isNew,
  onSave,
  onDelete,
  onClose,
}: Props) {
  const [name, setName] = useState("");
  const [words, setWords] = useState<WordEntry[]>([]);
  const [wordText, setWordText] = useState("");
  const [hintsText, setHintsText] = useState("");
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  useEffect(() => {
    if (category) {
      setName(category.name);
      setWords(category.words);
      setWordText("");
      setHintsText("");
      setEditingIndex(null);
    }
  }, [category]);

  if (!category) return null;

  const parsedHints = hintsText
    .split(",")
    .map((h) => h.trim())
    .filter(Boolean);
  const canAddWord = wordText.trim().length > 0 && parsedHints.length > 0;

  const addOrUpdateWord = () => {
    const entry: WordEntry = { word: wordText.trim(), hints: parsedHints };
    if (editingIndex !== null) {
      setWords(words.map((w, i) => (i === editingIndex ? entry : w)));
    } else {
      setWords([...words, entry]);
    }
    setWordText("");
    setHintsText("");
    setEditingIndex(null);
  };

  const startEditing = (index: number) => {
    setEditingIndex(index);
    setWordText(words[index].word);
    setHintsText(words[index].hints.join(", "));
  };

  const removeWord = (index: number) => {
    setWords(words.filter((_, i) => i !== index));
    if (editingIndex === index) {
      setEditingIndex(null);
      setWordText("");
      setHintsText("");
    }
  };

  return (
    <AppModal
      visible={visible}
      title={isNew ? t("newCategory") : t("editCategory")}
      onClose={onClose}
    >
      <TextField label={t("categoryName")} value={name} onChangeText={setName} placeholder="…" />

      <Text style={styles.sectionLabel}>{tf("wordsCount", { n: words.length })}</Text>
      {words.map((w, i) => (
        <View key={`${w.word}-${i}`} style={styles.wordRow}>
          <Pressable style={styles.wordInfo} onPress={() => startEditing(i)}>
            <Text style={styles.wordText}>{w.word}</Text>
            <Text style={styles.hintCount}>{tf("hintsTapEdit", { n: w.hints.length })}</Text>
          </Pressable>
          <Pressable onPress={() => removeWord(i)} hitSlop={8}>
            <Text style={styles.remove}>✕</Text>
          </Pressable>
        </View>
      ))}

      <TextField
        label={editingIndex !== null ? t("editWordLabel") : t("addWordLabel")}
        value={wordText}
        onChangeText={setWordText}
        placeholder="…"
      />
      <TextField
        label={t("hintsLabel")}
        value={hintsText}
        onChangeText={setHintsText}
        placeholder="…, …, …"
        autoCapitalize="none"
      />
      <BigButton
        label={editingIndex !== null ? t("updateWord") : t("addWord")}
        variant="secondary"
        compact
        disabled={!canAddWord}
        onPress={addOrUpdateWord}
      />

      <BigButton
        label={t("saveCategory")}
        compact
        disabled={name.trim().length === 0 || words.length === 0}
        onPress={() => onSave({ ...category, name: name.trim(), words })}
      />
      {!isNew ? (
        <BigButton
          label={t("deleteCategory")}
          variant="secondary"
          compact
          onPress={() =>
            confirmDialog(
              t("deleteCategoryQ"),
              tf("deleteCategoryTextWords", { name: category.name }),
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
  wordRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.chip,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: 10,
    paddingHorizontal: spacing.sm,
  },
  wordInfo: {
    flex: 1,
  },
  wordText: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.text,
  },
  hintCount: {
    fontSize: 12,
    color: colors.textDim,
  },
  remove: {
    fontSize: 18,
    color: colors.danger,
    paddingHorizontal: spacing.xs,
  },
});
