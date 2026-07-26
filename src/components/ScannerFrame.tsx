import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { t } from "../i18n";
import { colors, radius, spacing } from "../theme";

type Props = {
  onClose: () => void;
  message?: string | null;
};

// The dimmed surround with a clear square in the middle. Sits on top of
// whatever is showing the camera — the real one on a phone, a <video> in
// the browser.
export default function ScannerFrame({ onClose, message }: Props) {
  return (
    <View style={styles.overlay} pointerEvents="box-none">
      <View style={styles.dim} />
      <View style={styles.middleRow}>
        <View style={styles.dim} />
        <View style={styles.window}>
          <View style={[styles.corner, styles.tl]} />
          <View style={[styles.corner, styles.tr]} />
          <View style={[styles.corner, styles.bl]} />
          <View style={[styles.corner, styles.br]} />
        </View>
        <View style={styles.dim} />
      </View>
      <View style={styles.bottom}>
        <Text style={styles.hint}>{message ?? t("scanFrameHint")}</Text>
        <Pressable onPress={onClose} style={styles.closeBtn} hitSlop={8}>
          <Text style={styles.closeText}>{t("close")}</Text>
        </Pressable>
      </View>
    </View>
  );
}

const DIM = "rgba(0,0,0,0.62)";

const styles = StyleSheet.create({
  overlay: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0 },
  dim: { flex: 1, backgroundColor: DIM },
  middleRow: { flexDirection: "row", aspectRatio: 1 },
  window: {
    aspectRatio: 1,
    height: "100%",
    borderRadius: radius.md,
  },
  corner: {
    position: "absolute",
    width: 34,
    height: 34,
    borderColor: "#FFFFFF",
  },
  tl: { top: 0, left: 0, borderTopWidth: 4, borderLeftWidth: 4, borderTopLeftRadius: radius.md },
  tr: { top: 0, right: 0, borderTopWidth: 4, borderRightWidth: 4, borderTopRightRadius: radius.md },
  bl: {
    bottom: 0,
    left: 0,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
    borderBottomLeftRadius: radius.md,
  },
  br: {
    bottom: 0,
    right: 0,
    borderBottomWidth: 4,
    borderRightWidth: 4,
    borderBottomRightRadius: radius.md,
  },
  bottom: {
    flex: 1,
    backgroundColor: DIM,
    alignItems: "center",
    justifyContent: "flex-start",
    paddingTop: spacing.lg,
    gap: spacing.md,
  },
  hint: {
    fontSize: 15,
    color: "#FFFFFF",
    textAlign: "center",
    paddingHorizontal: spacing.lg,
  },
  closeBtn: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xl,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: "#FFFFFF",
    backgroundColor: colors.bg,
  },
  closeText: { fontSize: 16, fontWeight: "800", color: "#FFFFFF" },
});
