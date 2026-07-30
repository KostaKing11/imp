import React from "react";
import { StatusBar, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Ambient from "./Ambient";
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
export default function Screen({
  children,
  glow = colors.accent,
  flush = false,
  still = false,
}: Props) {
  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={colors.bg} />

      {still ? null : <Ambient tint={glow} second={colors.party} third={colors.cool} />}

      <SafeAreaView style={styles.safe}>
        <View style={[styles.inner, flush && styles.flush]}>{children}</View>
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
