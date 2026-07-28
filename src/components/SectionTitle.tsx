import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { colors, spacing, type } from "../theme";

type Props = {
  children: string;
  // A short note or control on the right of the rule (e.g. "3 of 8 on").
  hint?: string | null;
  // Tighter top margin for the first section on a screen.
  first?: boolean;
};

// Section header: a small uppercase label, then a hairline running to the
// edge. Quieter than the old centred 24px heading, so the content under
// it — which is what people actually tap — carries the screen.
export default function SectionTitle({ children, hint, first = false }: Props) {
  return (
    <View style={[styles.row, first && styles.first]}>
      <Text style={styles.title}>{children}</Text>
      <View style={styles.rule} />
      {hint ? <Text style={styles.hint}>{hint}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  first: {
    marginTop: spacing.md,
  },
  title: {
    ...type.eyebrow,
    color: colors.textDim,
  },
  rule: {
    flex: 1,
    height: 1,
    backgroundColor: colors.borderSoft,
  },
  hint: {
    ...type.caption,
    fontSize: 12,
    color: colors.textFaint,
  },
});
