import React from "react";
import { StatusBar, StyleSheet, View } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import Ambient from "./Ambient";
import { useKeyboardInset } from "./useKeyboardInset";
import { colors, spacing } from "../theme";

type Props = {
  children: React.ReactNode;
  // Colour of the light behind the screen. Reveal screens pass the
  // role/player colour so the background agrees with the card on top.
  glow?: string;
  // Screens that fill edge to edge turn the side padding off.
  flush?: boolean;
  // Turns the drifting lights off for screens that already have a lot
  // going on (the camera scanner, say).
  still?: boolean;
};

// Wrapper every screen uses: dark room, three slowly drifting lights,
// safe area + padding.
//
// It also gives up the keyboard's room for the whole app. The app is
// edge-to-edge, so Android does not resize the window when the keyboard
// opens — every screen keeps its full height and the keyboard covers
// whatever was at the bottom. Handling that here rather than screen by
// screen means every text box in the app sits above the keyboard,
// including ones nobody has written yet. See useKeyboardInset.
export default function Screen({
  children,
  glow = colors.accent,
  flush = false,
  still = false,
}: Props) {
  const keyboard = useKeyboardInset();
  const insets = useSafeAreaInsets();
  // The safe area already reserves the gesture bar's strip at the bottom,
  // and the keyboard is drawn over it — so only the difference is missing.
  const keyboardPad = keyboard > 0 ? Math.max(0, keyboard - insets.bottom) : 0;

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={colors.bg} />

      {still ? null : <Ambient tint={glow} second={colors.party} third={colors.cool} />}

      <SafeAreaView style={styles.safe}>
        <View
          style={[
            styles.inner,
            flush && styles.flush,
            keyboardPad > 0 && { paddingBottom: keyboardPad },
          ]}
        >
          {children}
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.bg,
    overflow: "hidden",
  },
  safe: {
    flex: 1,
  },
  inner: {
    flex: 1,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.xs,
    paddingBottom: spacing.md,
  },
  flush: {
    paddingHorizontal: 0,
  },
});
