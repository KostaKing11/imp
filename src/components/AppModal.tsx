import React, { useEffect, useRef } from "react";
import {
  Animated,
  Modal,
  PanResponder,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useKeyboardInset } from "./useKeyboardInset";
import { colors, radius, spacing } from "../theme";

type Props = {
  visible: boolean;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
};

// Bottom sheet used by all pop-ups: tap the empty space above it or
// pull it down (by the handle/title) to dismiss.
export default function AppModal({ visible, title, onClose, children }: Props) {
  const keyboardInset = useKeyboardInset();
  const translateY = useRef(new Animated.Value(0)).current;
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    if (visible) translateY.setValue(0);
  }, [visible, translateY]);

  const pan = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_e, g) => g.dy > 4 && Math.abs(g.dy) > Math.abs(g.dx),
      onPanResponderMove: (_e, g) => {
        if (g.dy > 0) translateY.setValue(g.dy);
      },
      onPanResponderRelease: (_e, g) => {
        if (g.dy > 110 || g.vy > 0.9) {
          Animated.timing(translateY, { toValue: 700, duration: 150, useNativeDriver: true }).start(
            () => onCloseRef.current()
          );
        } else {
          Animated.spring(translateY, { toValue: 0, friction: 8, useNativeDriver: true }).start();
        }
      },
    })
  ).current;

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      {/* The sheet rides above the keyboard: this modal is its own
          window on Android and would otherwise sit under it. */}
      <View style={[styles.wrap, { paddingBottom: keyboardInset }]}>
        <Pressable style={styles.backdrop} onPress={onClose} />
        <Animated.View
          style={[
            styles.sheet,
            keyboardInset > 0 && styles.sheetWithKeyboard,
            { transform: [{ translateY }] },
          ]}
        >
          <View style={styles.grabArea} {...pan.panHandlers}>
            <View style={styles.handle} />
            <Text style={styles.title}>{title}</Text>
          </View>
          <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
            {children}
          </ScrollView>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    justifyContent: "flex-end",
  },
  backdrop: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.6)",
  },
  sheet: {
    backgroundColor: colors.card,
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
    maxHeight: "82%",
  },
  // With the keyboard up there is far less room; let the sheet use it.
  sheetWithKeyboard: {
    maxHeight: "100%",
  },
  grabArea: {
    alignItems: "center",
    paddingTop: spacing.xs,
    paddingBottom: spacing.xs,
  },
  handle: {
    width: 44,
    height: 5,
    borderRadius: 3,
    backgroundColor: colors.border,
    marginBottom: spacing.xs,
  },
  title: {
    fontSize: 19,
    fontWeight: "800",
    color: colors.text,
  },
  content: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.xs,
    paddingBottom: spacing.lg,
    gap: spacing.sm,
  },
});
