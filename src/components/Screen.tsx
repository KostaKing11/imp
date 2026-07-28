import React from "react";
import { StatusBar, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Svg, { Defs, Ellipse, RadialGradient, Stop } from "react-native-svg";
import { colors, spacing } from "../theme";

type Props = {
  children: React.ReactNode;
  // Colour of the soft light behind the screen. Reveal screens pass the
  // role/player colour so the background agrees with the card on top.
  glow?: string;
  // Screens that fill edge to edge turn the side padding off.
  flush?: boolean;
};

// Wrapper every screen uses: dark background, one soft bloom near the
// top, safe area + padding.
export default function Screen({ children, glow = colors.accent, flush = false }: Props) {
  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={colors.bg} />

      {/* Pure decoration — it keeps the background from reading as a flat
          black rectangle, and tints the screen towards whatever is on it. */}
      <Svg
        style={StyleSheet.absoluteFill}
        width="100%"
        height="100%"
        pointerEvents="none"
      >
        <Defs>
          <RadialGradient id="bloom" cx="50%" cy="50%" rx="50%" ry="50%">
            <Stop offset="0" stopColor={glow} stopOpacity={0.17} />
            <Stop offset="0.55" stopColor={glow} stopOpacity={0.055} />
            <Stop offset="1" stopColor={glow} stopOpacity={0} />
          </RadialGradient>
        </Defs>
        <Ellipse cx="50%" cy="3%" rx="88%" ry="28%" fill="url(#bloom)" />
      </Svg>

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
