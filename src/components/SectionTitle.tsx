import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { alpha, colors, radius, spacing, type } from "../theme";

type Props = {
  children: string;
  // A short note or control on the right of the rule (e.g. "3 of 8 on").
  hint?: string | null;
  // Tighter top margin for the first section on a screen.
  first?: boolean;
  // Paints the tick — sections that belong to a mode take its colour.
  tone?: string;
};

// Section header: a short coloured tick, a small uppercase label, then a
// hairline running to the edge. Quiet enough that the content under it —
// which is what people actually tap — still carries the screen, but the
// tick keeps a long setup page from reading as one grey list.
export default function SectionTitle({ children, hint, first = false, tone }: Props) {
  const tint = tone ?? colors.accent;
  return (
    <View style={[styles.row, first && styles.first]}>
      <View style={[styles.tick, { backgroundColor: tint }]} />
      <Text style={styles.title}>{children}</Text>
      <View style={styles.rule} />
      {hint ? (
        <View style={[styles.hintPill, { borderColor: alpha(tint, 0.3) }]}>
          <Text style={styles.hint}>{hint}</Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs + 2,
    marginTop: spacing.md,
    marginBottom: spacing.xs,
  },
  first: {
    marginTop: spacing.md,
  },
  tick: {
    width: 4,
    height: 15,
    borderRadius: 2,
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
  hintPill: {
    borderRadius: radius.pill,
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 2,
    backgroundColor: alpha(colors.text, 0.04),
  },
  hint: {
    ...type.caption,
    fontSize: 11,
    color: colors.textDim,
  },
});
