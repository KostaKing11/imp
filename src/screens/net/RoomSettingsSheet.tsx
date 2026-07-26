import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import AppModal from "../../components/AppModal";
import Slider from "../../components/Slider";
import Toggle from "../../components/Toggle";
import { Language, t } from "../../i18n";
import { NetSettings } from "../../net/protocol";
import { colors, radius, spacing } from "../../theme";
import { formatTime } from "../../utils";

type Props = {
  visible: boolean;
  settings: NetSettings;
  onChange: (settings: NetSettings) => void;
  onClose: () => void;
};

const LANGUAGES: { code: Language; label: string }[] = [
  { code: "en", label: "English" },
  { code: "sr", label: "Srpski" },
];

// Language and discussion timer for the whole room. Only the host sees
// this — everyone else's phone follows whatever is set here.
export default function RoomSettingsSheet({ visible, settings, onChange, onClose }: Props) {
  return (
    <AppModal visible={visible} title={t("roomSettings")} onClose={onClose}>
      <Text style={styles.note}>{t("hostDecidesSettings")}</Text>

      <Text style={styles.label}>{t("language")}</Text>
      <View style={styles.row}>
        {LANGUAGES.map((lang) => (
          <Pressable
            key={lang.code}
            onPress={() => onChange({ ...settings, language: lang.code })}
            style={({ pressed }) => [
              styles.langChip,
              settings.language === lang.code && styles.langChipOn,
              pressed && styles.pressed,
            ]}
          >
            <Text
              style={[
                styles.langText,
                settings.language === lang.code && styles.langTextOn,
              ]}
            >
              {lang.label}
            </Text>
          </Pressable>
        ))}
      </View>

      <View style={styles.card}>
        <View style={styles.cardRow}>
          <Text style={styles.rowLabel}>{t("discussionTimers")}</Text>
          <Toggle
            value={settings.timerEnabled}
            onChange={(v) => onChange({ ...settings, timerEnabled: v })}
          />
        </View>
        {settings.timerEnabled ? (
          <View style={styles.timerArea}>
            <Text style={styles.timeValue}>{formatTime(settings.timerSeconds)}</Text>
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
    </AppModal>
  );
}

const styles = StyleSheet.create({
  note: { fontSize: 13, color: colors.textDim, textAlign: "center" },
  label: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.textDim,
    textTransform: "uppercase",
    letterSpacing: 1,
    marginTop: spacing.xs,
  },
  row: { flexDirection: "row", gap: spacing.xs },
  langChip: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: radius.md,
    borderWidth: 2,
    borderColor: colors.border,
    backgroundColor: colors.chip,
    alignItems: "center",
  },
  langChipOn: { borderColor: colors.accent },
  langText: { fontSize: 16, fontWeight: "700", color: colors.textDim },
  langTextOn: { color: colors.text },
  pressed: { opacity: 0.7 },
  card: {
    backgroundColor: colors.chip,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.sm,
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  cardRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  rowLabel: { fontSize: 16, fontWeight: "700", color: colors.text },
  timerArea: { gap: spacing.sm },
  timeValue: {
    fontSize: 28,
    fontWeight: "900",
    color: colors.accent,
    textAlign: "center",
  },
});
