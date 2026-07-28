import React, { useCallback, useEffect, useRef, useState } from "react";
import { Animated, Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { t } from "../i18n";
import { alpha, colors, elevation, radius, spacing, type } from "../theme";
import BigButton from "./BigButton";
import { ConfirmRequest, registerConfirmHost } from "./confirm";

// The app's own "are you sure?". Mounted once at the root; everything
// else asks for it through confirmDialog(). Replaces the OS alert, which
// arrived in the system's font and the system's grey and broke the spell
// every time somebody backed out of a round.
export default function ConfirmHost() {
  const [request, setRequest] = useState<ConfirmRequest | null>(null);
  const anim = useRef(new Animated.Value(0)).current;

  const show = useCallback((next: ConfirmRequest) => setRequest(next), []);

  useEffect(() => {
    registerConfirmHost(show);
    return () => registerConfirmHost(null);
  }, [show]);

  // Every question is destructive, so the card drops in rather than
  // fading — it should feel like something stopped you.
  useEffect(() => {
    if (!request) return;
    anim.setValue(0);
    Animated.spring(anim, {
      toValue: 1,
      speed: 18,
      bounciness: 8,
      useNativeDriver: true,
    }).start();
  }, [request, anim]);

  const close = () => setRequest(null);

  const confirm = () => {
    const yes = request?.onYes;
    setRequest(null);
    yes?.();
  };

  const scale = anim.interpolate({ inputRange: [0, 1], outputRange: [0.9, 1] });

  return (
    <Modal
      visible={request !== null}
      transparent
      animationType="fade"
      onRequestClose={close}
      statusBarTranslucent
    >
      <View style={styles.wrap}>
        <Pressable style={StyleSheet.absoluteFill} onPress={close} />

        <Animated.View style={[styles.card, { opacity: anim, transform: [{ scale }] }]}>
          <Text style={styles.title}>{request?.title ?? ""}</Text>
          <Text style={styles.message}>{request?.message ?? ""}</Text>

          <View style={styles.buttons}>
            <BigButton
              style={styles.button}
              label={t("no")}
              variant="secondary"
              compact
              onPress={close}
            />
            <BigButton
              style={styles.button}
              label={t("yes")}
              variant="danger"
              compact
              onPress={confirm}
            />
          </View>
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
  title: {
    ...type.title,
    fontSize: 24,
    color: colors.text,
  },
  message: {
    ...type.body,
    lineHeight: 23,
    color: colors.textDim,
  },
  buttons: {
    flexDirection: "row",
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  button: {
    flex: 1,
  },
});
