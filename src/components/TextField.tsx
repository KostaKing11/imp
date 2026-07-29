import React, { useState } from "react";
import { StyleSheet, Text, TextInput, View } from "react-native";
import { colors, radius, spacing, type } from "../theme";

type Props = {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  multiline?: boolean;
  autoCapitalize?: "none" | "sentences" | "words";
  // Tapping in highlights what's there, so a default name can just be
  // typed over.
  selectOnFocus?: boolean;
  // Lets a screen scroll the box into view when the keyboard opens.
  onFocus?: () => void;
};

export default function TextField({
  label,
  value,
  onChangeText,
  placeholder,
  multiline = false,
  autoCapitalize = "sentences",
  selectOnFocus = false,
  onFocus,
}: Props) {
  const [focused, setFocused] = useState(false);

  return (
    <View style={styles.container}>
      <Text style={[styles.label, focused && styles.labelFocused]}>{label}</Text>
      <TextInput
        style={[styles.input, multiline && styles.multiline, focused && styles.inputFocused]}
        value={value}
        onChangeText={onChangeText}
        onFocus={() => {
          setFocused(true);
          onFocus?.();
        }}
        onBlur={() => setFocused(false)}
        placeholder={placeholder}
        placeholderTextColor={colors.textFaint}
        selectionColor={colors.accent}
        multiline={multiline}
        autoCapitalize={autoCapitalize}
        selectTextOnFocus={selectOnFocus}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.xs,
  },
  label: {
    ...type.eyebrow,
    color: colors.textFaint,
  },
  labelFocused: {
    color: colors.accent,
  },
  input: {
    backgroundColor: colors.chip,
    borderWidth: 1.5,
    borderColor: colors.borderSoft,
    borderRadius: radius.md,
    color: colors.text,
    fontSize: 17,
    fontWeight: "600",
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: 14,
  },
  inputFocused: {
    borderColor: colors.accent,
    backgroundColor: colors.card,
  },
  multiline: {
    minHeight: 88,
    textAlignVertical: "top",
  },
});
