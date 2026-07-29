import React from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import Screen from "../components/Screen";
import SectionTitle from "../components/SectionTitle";
import Segmented from "../components/Segmented";
import { Settings } from "../game/types";
import { Language, t } from "../i18n";
import { colors, radius, spacing, type } from "../theme";

type Props = {
  settings: Settings;
  onChange: (settings: Settings) => void;
  language: Language;
  onLanguageChange: (lang: Language) => void;
  onBack: () => void;
};

const LANGUAGES: { code: Language; label: string }[] = [
  { code: "en", label: "English" },
  { code: "sr", label: "Srpski" },
];

// Just the language for now. The discussion timers went unused, and the
// things that belong to one gamemode — Skala's round count, the
// tournament's target — now live where that mode is being set up.
export default function SettingsScreen({ language, onLanguageChange, onBack }: Props) {
  return (
    <Screen>
      <View style={styles.header}>
        <Pressable onPress={onBack} hitSlop={12} style={styles.backButton}>
          <Text style={styles.backArrow}>‹</Text>
        </Pressable>
        <Text style={styles.title}>{t("settings")}</Text>
        <View style={styles.backButton} />
      </View>

      <ScrollView contentContainerStyle={styles.list} showsVerticalScrollIndicator={false}>
        <SectionTitle first>{t("language")}</SectionTitle>
        <Segmented
          value={language}
          onChange={onLanguageChange}
          options={LANGUAGES.map((l) => ({ value: l.code, label: l.label }))}
        />
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.md,
  },
  backButton: {
    width: 42,
    height: 42,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.borderSoft,
    backgroundColor: colors.card,
    alignItems: "center",
    justifyContent: "center",
  },
  backArrow: {
    fontSize: 32,
    lineHeight: 36,
    color: colors.text,
    fontWeight: "700",
  },
  title: {
    flex: 1,
    ...type.title,
    fontSize: 26,
    color: colors.text,
    textAlign: "center",
  },
  list: {
    gap: spacing.sm,
    paddingBottom: spacing.lg,
  },
});
