import React from "react";
import { StyleSheet, Text } from "react-native";
import { colors, spacing } from "../theme";

export default function SectionTitle({ children }: { children: string }) {
  return <Text style={styles.title}>{children}</Text>;
}

const styles = StyleSheet.create({
  title: {
    fontSize: 24,
    fontWeight: "800",
    color: colors.text,
    textAlign: "center",
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
});
