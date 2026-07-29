import React, { useEffect, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import Screen from "../components/Screen";
import SectionTitle from "../components/SectionTitle";
import Segmented from "../components/Segmented";
import Slider from "../components/Slider";
import Stepper from "../components/Stepper";
import Toggle from "../components/Toggle";
import { ModeTimer, Settings } from "../game/types";
import { Language, t } from "../i18n";
import { colors, radius, spacing, type } from "../theme";
import { formatTime, parseTimeInput } from "../utils";

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
        <SectionTitle first>{t("language")}</SectionTitle>
        <Segmented
          value={language}
          onChange={onLanguageChange}
          options={LANGUAGES.map((l) => ({ value: l.code, label: l.label }))}
        />

        <SectionTitle>{t("discussionTimers")}</SectionTitle>
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

        <SectionTitle>{t("modeSkala")}</SectionTitle>
        <Stepper
          label={t("skalaTurnsLabel")}
          value={settings.skalaTurns}
          min={1}
          max={5}
          onChange={(v) => onChange({ ...settings, skalaTurns: v })}
          tone="#7BD948"
        />
        <Text style={styles.note}>{t("skalaTurnsNote")}</Text>

        <SectionTitle>{t("tournament")}</SectionTitle>
        <View style={styles.card}>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>{t("tournamentTargetLabel")}</Text>
            <Text style={styles.timeValue}>{settings.tournamentTarget}</Text>
          </View>
          <Slider
            min={5}
            max={30}
            step={1}
            value={settings.tournamentTarget}
            onChange={(v) => onChange({ ...settings, tournamentTarget: v })}
          />
        </View>
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
  card: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.borderSoft,
    padding: spacing.md,
    gap: spacing.sm,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.sm,
  },
  rowLabel: {
    ...type.bodyStrong,
    fontSize: 17,
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
    ...type.title,
    fontSize: 32,
    color: colors.accent,
    fontVariant: ["tabular-nums"],
  },
  note: {
    ...type.caption,
    fontSize: 12,
    lineHeight: 18,
    color: colors.textFaint,
    textAlign: "center",
  },
  timeInput: {
    width: 92,
    backgroundColor: colors.chip,
    borderWidth: 1.5,
    borderColor: colors.borderSoft,
    borderRadius: radius.md,
    color: colors.text,
    fontSize: 17,
    fontWeight: "700",
    textAlign: "center",
    paddingVertical: 10,
  },
});
