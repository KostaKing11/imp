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
import { alpha, colors, elevation, motion, radius, spacing, type } from "../theme";

type Props = {
  visible: boolean;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
};

// Far enough to be off the bottom of any phone.
const TRAVEL = 900;
// How far down the drag has to get before the backdrop is fully gone.
const FADE_OVER = 320;

// Bottom sheet used by all pop-ups: tap the empty space above it or
// pull it down (by the handle/title) to dismiss.
//
// Modal's own "slide" slides the *whole* window, backdrop included, so
// closing a pop-up looked like a dark pane sliding off the screen with
// the screen behind it dimmed the whole way down. It fades instead —
// nothing travels, so there is no dark box to watch leave. The sheet
// still springs up on the way in, and while you are dragging it down the
// dimming follows it.
//
// `visible` is handed straight to Modal, so React does the mounting
// exactly as it always did — there is no closing state of our own that
// could get stuck and leave a pop-up that will not go away.
export default function AppModal({ visible, title, onClose, children }: Props) {
  const keyboardInset = useKeyboardInset();
  const translateY = useRef(new Animated.Value(TRAVEL)).current;
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    if (!visible) return;
    translateY.setValue(TRAVEL);
    const run = Animated.spring(translateY, {
      toValue: 0,
      ...motion.soft,
      useNativeDriver: true,
    });
    run.start();
    return () => run.stop();
  }, [visible, translateY]);

  const pan = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_e, g) => g.dy > 4 && Math.abs(g.dy) > Math.abs(g.dx),
      onPanResponderMove: (_e, g) => {
        if (g.dy > 0) translateY.setValue(g.dy);
      },
      onPanResponderRelease: (_e, g) => {
        // Let the parent turn `visible` off and the effect above play the
        // exit — one exit path, so a flick and a tap look the same.
        if (g.dy > 110 || g.vy > 0.9) onCloseRef.current();
        else Animated.spring(translateY, { toValue: 0, friction: 8, useNativeDriver: true }).start();
      },
    })
  ).current;

  // The dimming is tied to the sheet's own position, so it is always
  // exactly as dark as the sheet is far up.
  const backdropOpacity = translateY.interpolate({
    inputRange: [0, FADE_OVER],
    outputRange: [1, 0],
    extrapolate: "clamp",
  });

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      {/* The sheet rides above the keyboard: this modal is its own
          window on Android and would otherwise sit under it. */}
      <View style={[styles.wrap, { paddingBottom: keyboardInset }]}>
        <Animated.View style={[styles.backdrop, { opacity: backdropOpacity }]}>
          <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        </Animated.View>
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
    backgroundColor: alpha(colors.bg, 0.82),
  },
  // No top border: a hairline across the top of the sheet read as a
  // stray line floating above it.
  sheet: {
    backgroundColor: colors.bgSoft,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    maxHeight: "82%",
    overflow: "hidden",
    ...elevation.sheet,
  },
  // With the keyboard up there is far less room; let the sheet use it.
  sheetWithKeyboard: {
    maxHeight: "100%",
  },
  grabArea: {
    alignItems: "center",
    paddingTop: spacing.sm,
    paddingBottom: spacing.sm,
  },
  handle: {
    width: 44,
    height: 5,
    borderRadius: 3,
    backgroundColor: alpha(colors.text, 0.24),
    marginBottom: spacing.sm,
  },
  title: {
    ...type.heading,
    fontSize: 20,
    color: colors.text,
  },
  content: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.xs,
    paddingBottom: spacing.lg,
    gap: spacing.sm,
  },
});
