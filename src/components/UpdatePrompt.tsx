import React, { useEffect, useRef, useState } from "react";
import { Animated, Modal, StyleSheet, Text, View } from "react-native";
import { t, tf } from "../i18n";
import { alpha, colors, elevation, radius, spacing, type } from "../theme";
import { checkForUpdate, downloadAndInstall, Release, updatesSupported } from "../update/appUpdate";
import BigButton from "./BigButton";

// Offers the new version once per app start. "Later" simply closes it —
// nothing is remembered, so the next launch asks again, which is what a
// game that people open for five minutes at a time wants.
export default function UpdatePrompt() {
  const [release, setRelease] = useState<Release | null>(null);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState(0);
  const [failed, setFailed] = useState(false);
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!updatesSupported()) return;
    let alive = true;
    // A beat after launch, so the check never competes with the first
    // render or with joining a room from a scanned link.
    const timer = setTimeout(() => {
      checkForUpdate().then((found) => {
        if (alive && found) setRelease(found);
      });
    }, 1500);
    return () => {
      alive = false;
      clearTimeout(timer);
    };
  }, []);

  useEffect(() => {
    if (!release) return;
    anim.setValue(0);
    Animated.spring(anim, {
      toValue: 1,
      speed: 18,
      bounciness: 8,
      useNativeDriver: true,
    }).start();
  }, [release, anim]);

  const install = async () => {
    if (!release) return;
    setBusy(true);
    setFailed(false);
    try {
      await downloadAndInstall(release, setProgress);
      // Android's installer is now in front. Leave the sheet up behind
      // it — if they back out of it, the button is still there.
    } catch {
      setFailed(true);
    } finally {
      setBusy(false);
    }
  };

  const scale = anim.interpolate({ inputRange: [0, 1], outputRange: [0.9, 1] });

  return (
    <Modal
      visible={release !== null}
      transparent
      animationType="fade"
      onRequestClose={() => !busy && setRelease(null)}
      statusBarTranslucent
    >
      <View style={styles.wrap}>
        <Animated.View style={[styles.card, { opacity: anim, transform: [{ scale }] }]}>
          <View style={styles.tagRow}>
            <View style={styles.tag}>
              <Text style={styles.tagText}>{release?.version ?? ""}</Text>
            </View>
          </View>

          <Text style={styles.title}>{t("updateTitle")}</Text>
          <Text style={styles.message}>
            {busy ? t("updateDownloading") : t("updateBody")}
          </Text>

          {release?.notes && !busy ? (
            <Text style={styles.notes} numberOfLines={4}>
              {release.notes}
            </Text>
          ) : null}

          {busy ? (
            <View style={styles.progressTrack}>
              <View style={[styles.progressFill, { width: `${Math.round(progress * 100)}%` }]} />
            </View>
          ) : null}

          {failed ? <Text style={styles.failed}>{t("updateFailed")}</Text> : null}

          {!busy ? (
            <View style={styles.buttons}>
              <BigButton
                style={styles.button}
                label={t("updateLater")}
                variant="secondary"
                compact
                onPress={() => setRelease(null)}
              />
              <BigButton
                style={styles.button}
                label={t("updateNow")}
                compact
                onPress={install}
              />
            </View>
          ) : null}
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.md,
    backgroundColor: alpha("#000000", 0.72),
  },
  card: {
    alignSelf: "stretch",
    maxWidth: 400,
    width: "100%",
    borderRadius: radius.xl,
    backgroundColor: colors.bgSoft,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    gap: spacing.sm,
    ...elevation.sheet,
  },
  tagRow: { flexDirection: "row" },
  tag: {
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.accentGlow,
    backgroundColor: colors.accentSoft,
    paddingVertical: 4,
    paddingHorizontal: spacing.sm,
  },
  tagText: { ...type.eyebrow, fontSize: 12, color: colors.accent },
  title: { ...type.title, fontSize: 24, color: colors.text },
  message: { ...type.body, lineHeight: 23, color: colors.textDim },
  notes: {
    ...type.caption,
    fontSize: 13,
    lineHeight: 20,
    color: colors.textFaint,
    backgroundColor: colors.chip,
    borderRadius: radius.md,
    padding: spacing.sm,
  },
  progressTrack: {
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.chip,
    overflow: "hidden",
    marginVertical: spacing.xs,
  },
  progressFill: { height: "100%", borderRadius: 3, backgroundColor: colors.accent },
  failed: { ...type.caption, fontSize: 13, color: colors.danger },
  buttons: { flexDirection: "row", gap: spacing.sm, marginTop: spacing.xs },
  button: { flex: 1 },
});
