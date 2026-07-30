import React from "react";
import { Animated, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import Screen from "../components/Screen";
import SectionTitle from "../components/SectionTitle";
import Segmented from "../components/Segmented";
import { usePressScale } from "../components/usePressScale";
import { Settings } from "../game/types";
import { Language, t } from "../i18n";
import { currentVersion } from "../update/appUpdate";
import { alpha, colors, radius, spacing, type } from "../theme";

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
  const back = usePressScale(0.88);
  // Only the installed app knows what build it is; on the web the
  // service worker keeps it current and there is no number to show.
  const version = currentVersion();

  return (
    <Screen glow={colors.party}>
      <View style={styles.header}>
        <Animated.View style={back.style}>
          <Pressable
            onPress={onBack}
            onPressIn={back.onPressIn}
            onPressOut={back.onPressOut}
            hitSlop={12}
            style={styles.backButton}
          >
            <Text style={styles.backArrow}>‹</Text>
          </Pressable>
        </Animated.View>
        <Text style={styles.title}>{t("settings")}</Text>
        {/* Balances the back button so the title sits centred — no
            border or fill, since it is not a button. */}
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView contentContainerStyle={styles.list} showsVerticalScrollIndicator={false}>
        <SectionTitle first>{t("language")}</SectionTitle>
        <Segmented
          value={language}
          onChange={onLanguageChange}
          options={LANGUAGES.map((l) => ({ value: l.code, label: l.label }))}
        />
      </ScrollView>

      {/* The screen has one setting on it; without this it reads as a
          page that failed to load rather than a short one. */}
      <View style={styles.footer}>
        <Text style={styles.wordmark}>IMP</Text>
        {version !== "0.0.0" ? <Text style={styles.version}>{version}</Text> : null}
      </View>
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
    width: 44,
    height: 44,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: alpha(colors.card, 0.8),
    alignItems: "center",
    justifyContent: "center",
  },
  headerSpacer: {
    width: 42,
    height: 42,
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
  footer: {
    alignItems: "center",
    paddingBottom: spacing.sm,
    gap: 2,
  },
  wordmark: {
    fontSize: 30,
    fontWeight: "900",
    letterSpacing: 8,
    color: alpha(colors.text, 0.12),
  },
  version: {
    ...type.caption,
    fontSize: 11,
    letterSpacing: 1,
    color: alpha(colors.text, 0.16),
  },
});
