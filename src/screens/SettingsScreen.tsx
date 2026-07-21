import React, { useEffect, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import Screen from "../components/Screen";
import Slider from "../components/Slider";
import Toggle from "../components/Toggle";
import { ModeTimer, Settings } from "../game/types";
import { Language, t } from "../i18n";
import { colors, radius, spacing } from "../theme";
import { formatTime, parseTimeInput, textColorFor } from "../utils";

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

function TimerCard({
  title,
  timer,
  onChange,
}: {
  title: string;
  timer: ModeTimer;
  onChange: (timer: ModeTimer) => void;
}) {
  const [timeText, setTimeText] = useState(formatTime(timer.seconds));

  // Keep the text box in sync when the slider moves.
  useEffect(() => {
    setTimeText(formatTime(timer.seconds));
  }, [timer.seconds]);

  const commitTimeText = () => {
    const parsed = parseTimeInput(timeText);
    if (parsed !== null) onChange({ ...timer, seconds: parsed });
    else setTimeText(formatTime(timer.seconds));
  };

  return (
    <View style={styles.card}>
      <View style={styles.row}>
        <Text style={styles.rowLabel}>{title}</Text>
        <Toggle value={timer.enabled} onChange={(v) => onChange({ ...timer, enabled: v })} />
      </View>

      {timer.enabled ? (
        <View style={styles.timerArea}>
          <View style={styles.timeRow}>
            <Text style={styles.timeValue}>{formatTime(timer.seconds)}</Text>
            <TextInput
              style={styles.timeInput}
              value={timeText}
              onChangeText={setTimeText}
              onBlur={commitTimeText}
              onSubmitEditing={commitTimeText}
              keyboardType="numbers-and-punctuation"
              placeholder="2:00"
              placeholderTextColor={colors.textDim}
            />
          </View>
          <Slider
            min={60}
            max={300}
            step={5}
            value={timer.seconds}
            onChange={(v) => onChange({ ...timer, seconds: v })}
          />
        </View>
      ) : null}
    </View>
  );
}

export default function SettingsScreen({
  settings,
  onChange,
  language,
  onLanguageChange,
  onBack,
}: Props) {
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
        <Text style={styles.sectionLabel}>{t("language")}</Text>
        <View style={styles.langRow}>
          {LANGUAGES.map((l) => {
            const active = language === l.code;
            return (
              <Pressable
                key={l.code}
                onPress={() => onLanguageChange(l.code)}
                style={[styles.langButton, active && styles.langButtonActive]}
              >
                <Text
                  style={[
                    styles.langText,
                    { color: active ? textColorFor(colors.accent) : colors.text },
                  ]}
                >
                  {l.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <Text style={styles.sectionLabel}>{t("discussionTimers")}</Text>
        <TimerCard
          title="IMP Classic"
          timer={settings.impTimer}
          onChange={(timer) => onChange({ ...settings, impTimer: timer })}
        />
        <TimerCard
          title="Odd One Out"
          timer={settings.oddTimer}
          onChange={(timer) => onChange({ ...settings, oddTimer: timer })}
        />
        <TimerCard
          title={t("modeBlef")}
          timer={settings.blefTimer}
          onChange={(timer) => onChange({ ...settings, blefTimer: timer })}
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
    width: 44,
    alignItems: "center",
  },
  backArrow: {
    fontSize: 40,
    lineHeight: 42,
    color: colors.text,
    fontWeight: "700",
  },
  title: {
    flex: 1,
    fontSize: 26,
    fontWeight: "900",
    color: colors.text,
    textAlign: "center",
  },
  list: {
    gap: spacing.sm,
  },
  langRow: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  langButton: {
    flex: 1,
    borderRadius: radius.md,
    borderWidth: 2,
    borderColor: colors.border,
    backgroundColor: colors.card,
    paddingVertical: 14,
    alignItems: "center",
  },
  langButtonActive: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  langText: {
    fontSize: 16,
    fontWeight: "800",
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.textDim,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    gap: spacing.sm,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  rowLabel: {
    fontSize: 17,
    fontWeight: "700",
    color: colors.text,
  },
  timerArea: {
    gap: spacing.xs,
    marginTop: spacing.xs,
  },
  timeRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.sm,
  },
  timeValue: {
    fontSize: 32,
    fontWeight: "900",
    color: colors.text,
    fontVariant: ["tabular-nums"],
  },
  timeInput: {
    width: 90,
    backgroundColor: colors.chip,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.sm,
    color: colors.text,
    fontSize: 17,
    textAlign: "center",
    paddingVertical: 8,
  },
});
