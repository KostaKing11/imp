import React, { useEffect, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { QuestionEntry } from "../../../data/questions";
import AppModal from "../../components/AppModal";
import BigButton from "../../components/BigButton";
import TextField from "../../components/TextField";
import { FakerCategoryState } from "../../game/types";
import { t, tf } from "../../i18n";
import { colors, radius, spacing } from "../../theme";
import { confirmDialog } from "../../utils";

type Props = {
  visible: boolean;
  category: FakerCategoryState | null; // pre-filled blank for new categories
  isNew: boolean;
  onSave: (category: FakerCategoryState) => void;
  onDelete: (id: string) => void;
  onClose: () => void;
};

// Editor for CUSTOM Faker categories: name + question pairs. Everyone
// gets the main question; the Faker secretly gets the odd one.
export default function FakerCategoryEditor({
  visible,
  category,
  isNew,
  onSave,
  onDelete,
  onClose,
}: Props) {
  const [name, setName] = useState("");
  const [questions, setQuestions] = useState<QuestionEntry[]>([]);
  const [mainText, setMainText] = useState("");
  const [oddText, setOddText] = useState("");
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  useEffect(() => {
    if (category) {
      setName(category.name);
      setQuestions(category.questions);
      setMainText("");
      setOddText("");
      setEditingIndex(null);
    }
  }, [category]);

  if (!category) return null;

  const canAdd = mainText.trim().length > 0 && oddText.trim().length > 0;

  const addOrUpdate = () => {
    const entry: QuestionEntry = { main: mainText.trim(), odd: oddText.trim() };
    if (editingIndex !== null) {
      setQuestions(questions.map((q, i) => (i === editingIndex ? entry : q)));
    } else {
      setQuestions([...questions, entry]);
    }
    setMainText("");
    setOddText("");
    setEditingIndex(null);
  };

  const startEditing = (index: number) => {
    setEditingIndex(index);
    setMainText(questions[index].main);
    setOddText(questions[index].odd);
  };

  const removeEntry = (index: number) => {
    setQuestions(questions.filter((_, i) => i !== index));
    if (editingIndex === index) {
      setEditingIndex(null);
      setMainText("");
      setOddText("");
    }
  };

  return (
    <AppModal
      visible={visible}
      title={isNew ? t("newCategory") : t("editCategory")}
      onClose={onClose}
    >
      <TextField label={t("categoryName")} value={name} onChangeText={setName} placeholder="…" />

      <Text style={styles.sectionLabel}>{tf("questionsCount", { n: questions.length })}</Text>
      {questions.map((q, i) => (
        <View key={`${q.main}-${i}`} style={styles.questionRow}>
          <Pressable style={styles.questionInfo} onPress={() => startEditing(i)}>
            <Text style={styles.questionText} numberOfLines={1}>
              {q.main}
            </Text>
            <Text style={styles.questionHint}>{t("tapToEdit")}</Text>
          </Pressable>
          <Pressable onPress={() => removeEntry(i)} hitSlop={8}>
            <Text style={styles.remove}>✕</Text>
          </Pressable>
        </View>
      ))}

      <TextField
        label={t("mainQuestionLabel")}
        value={mainText}
        onChangeText={setMainText}
        placeholder="…"
        multiline
      />
      <TextField
        label={t("oddQuestionLabel")}
        value={oddText}
        onChangeText={setOddText}
        placeholder="…"
        multiline
      />
      <BigButton
        label={editingIndex !== null ? t("updateQuestion") : t("addQuestion")}
        variant="secondary"
        compact
        disabled={!canAdd}
        onPress={addOrUpdate}
      />

      <BigButton
        label={t("saveCategory")}
        compact
        disabled={name.trim().length === 0 || questions.length === 0}
        onPress={() => onSave({ ...category, name: name.trim(), questions })}
      />
      {!isNew ? (
        <BigButton
          label={t("deleteCategory")}
          variant="secondary"
          compact
          onPress={() =>
            confirmDialog(
              t("deleteCategoryQ"),
              tf("deleteCategoryTextQuestions", { name: category.name }),
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
  questionRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.chip,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: 10,
    paddingHorizontal: spacing.sm,
  },
  questionInfo: {
    flex: 1,
  },
  questionText: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.text,
  },
  questionHint: {
    fontSize: 12,
    color: colors.textDim,
  },
  remove: {
    fontSize: 18,
    color: colors.danger,
    paddingHorizontal: spacing.xs,
  },
});
