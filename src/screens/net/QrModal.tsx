import React from "react";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";
import QRCode from "react-native-qrcode-svg";
import { t } from "../../i18n";
import { colors, radius, spacing } from "../../theme";

type Props = {
  visible: boolean;
  payload: string | null;
  code: string;
  onClose: () => void;
};

// The room's QR code as a pop-up: tap the backdrop or Close to dismiss.
export default function QrModal({ visible, payload, code, onClose }: Props) {
  // Mounted only while open: a hidden modal can stay on screen in the
  // web build.
  if (!visible) return null;
  return (
    <Modal visible transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        {/* Swallow taps on the card itself so it doesn't close. */}
        <Pressable style={styles.card} onPress={() => {}}>
          <Text style={styles.title}>{t("qrTitle")}</Text>
          <View style={styles.qrBox}>
            {payload ? (
              <QRCode value={payload} size={220} backgroundColor="#FFFFFF" />
            ) : (
              <Text style={styles.noQr}>{t("qrUnavailable")}</Text>
            )}
          </View>
          <Text style={styles.code}>{code}</Text>
          <Pressable onPress={onClose} style={styles.closeBtn} hitSlop={8}>
            <Text style={styles.closeText}>{t("close")}</Text>
          </Pressable>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.75)",
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.md,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    alignItems: "center",
    gap: spacing.sm,
  },
  title: {
    fontSize: 17,
    fontWeight: "800",
    color: colors.text,
  },
  qrBox: {
    backgroundColor: "#FFFFFF",
    padding: spacing.sm,
    borderRadius: radius.md,
    minWidth: 236,
    minHeight: 236,
    alignItems: "center",
    justifyContent: "center",
  },
  noQr: {
    fontSize: 14,
    color: "#15171B",
    textAlign: "center",
    paddingHorizontal: spacing.sm,
  },
  code: {
    fontSize: 34,
    fontWeight: "900",
    color: colors.accent,
    letterSpacing: 8,
  },
  closeBtn: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  closeText: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.textDim,
  },
});
