import React from "react";
import { StyleSheet } from "react-native";
import AppModal from "../../components/AppModal";
import SectionTitle from "../../components/SectionTitle";
import Segmented from "../../components/Segmented";
import { Language, t } from "../../i18n";
import { NetSettings } from "../../net/protocol";

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

// The language for the whole room. Only the host sees this — everyone
// else's phone follows whatever is set here. It uses the same control as
// the app's own settings, so the two places are not two different apps.
export default function RoomSettingsSheet({ visible, settings, onChange, onClose }: Props) {
  return (
    <AppModal visible={visible} title={t("roomSettings")} onClose={onClose}>
      <SectionTitle first>{t("language")}</SectionTitle>
      <Segmented
        value={settings.language}
        onChange={(code) => onChange({ ...settings, language: code })}
        options={LANGUAGES.map((l) => ({ value: l.code, label: l.label }))}
      />
    </AppModal>
  );
}

const styles = StyleSheet.create({});
