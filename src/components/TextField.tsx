import React from "react";
import { StyleSheet, Text, TextInput, View } from "react-native";
import { colors, radius, spacing } from "../theme";

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
};

export default function TextField({
  label,
  value,
  onChangeText,
  placeholder,
  multiline = false,
  autoCapitalize = "sentences",
  selectOnFocus = false,
}: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={[styles.input, multiline && styles.multiline]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.textDim}
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
    fontSize: 13,
    fontWeight: "700",
    color: colors.textDim,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  input: {
    backgroundColor: colors.chip,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.sm,
    color: colors.text,
    fontSize: 17,
    paddingHorizontal: spacing.sm,
    paddingVertical: 12,
  },
  multiline: {
    minHeight: 80,
    textAlignVertical: "top",
  },
});
