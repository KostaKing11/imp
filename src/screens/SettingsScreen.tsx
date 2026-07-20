import React, { useEffect, useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import Screen from "../components/Screen";
import Slider from "../components/Slider";
import Toggle from "../components/Toggle";
import { Settings } from "../game/types";
import { colors, radius, spacing } from "../theme";
import { formatTime, parseTimeInput } from "../utils";

type Props = {
  settings: Settings;
  onChange: (settings: Settings) => void;
  onBack: () => void;
};

export default function SettingsScreen({ settings, onChange, onBack }: Props) {
  const [timeText, setTimeText] = useState(formatTime(settings.timerSeconds));

  // Keep the text box in sync when the slider moves.
  useEffect(() => {
    setTimeText(formatTime(settings.timerSeconds));
  }, [settings.timerSeconds]);

  const commitTimeText = () => {
    const parsed = parseTimeInput(timeText);
    if (parsed !== null) onChange({ ...settings, timerSeconds: parsed });
    else setTimeText(formatTime(settings.timerSeconds));
  };

  return (
    <Screen>
      <View style={styles.header}>
        <Pressable onPress={onBack} hitSlop={12} style={styles.backButton}>
          <Text style={styles.backArrow}>‹</Text>
        </Pressable>
        <Text style={styles.title}>Settings</Text>
        <View style={styles.backButton} />
      </View>

      <View style={styles.card}>
        <View style={styles.row}>
          <Text style={styles.rowLabel}>Discussion timer</Text>
          <Toggle
            value={settings.timerEnabled}
            onChange={(v) => onChange({ ...settings, timerEnabled: v })}
          />
        </View>

        {settings.timerEnabled ? (
          <View style={styles.timerArea}>
            <View style={styles.timeRow}>
              <Text style={styles.timeValue}>{formatTime(settings.timerSeconds)}</Text>
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
              value={settings.timerSeconds}
              onChange={(v) => onChange({ ...settings, timerSeconds: v })}
            />
          </View>
        ) : null}
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
    fontSize: 34,
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
