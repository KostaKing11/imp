import React, { useEffect, useRef } from "react";
import { Animated, Easing, StyleSheet, useWindowDimensions, View } from "react-native";
import Svg, { Circle, Defs, RadialGradient, Stop } from "react-native-svg";

let nextId = 0;

type BlobProps = {
  color: string;
  // Where it sits, as a fraction of the screen.
  x: number;
  y: number;
  // Its diameter, as a fraction of the screen width.
  size: number;
  opacity: number;
  // How far it wanders, in pixels, and how long one round trip takes.
  travel: number;
  period: number;
  delay: number;
};

// One soft ball of light. It never stops moving — slowly enough that you
// only notice it if you look, fast enough that the screen is never quite
// the same twice.
function Blob({ color, x, y, size, opacity, travel, period, delay }: BlobProps) {
  const { width, height } = useWindowDimensions();
  const anim = useRef(new Animated.Value(0)).current;
  const id = useRef(`blob${nextId++}`).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(anim, {
          toValue: 1,
          duration: period,
          delay,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(anim, {
          toValue: 0,
          duration: period,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [anim, period, delay]);

  const d = size * width;
  const translateX = anim.interpolate({ inputRange: [0, 1], outputRange: [-travel, travel] });
  const translateY = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [travel * 0.6, -travel * 0.6],
  });
  const scale = anim.interpolate({ inputRange: [0, 1], outputRange: [0.88, 1.12] });

  return (
    <Animated.View
      style={{
        position: "absolute",
        left: x * width - d / 2,
        top: y * height - d / 2,
        width: d,
        height: d,
        transform: [{ translateX }, { translateY }, { scale }],
      }}
      pointerEvents="none"
    >
      <Svg width="100%" height="100%" viewBox="0 0 100 100">
        <Defs>
          <RadialGradient id={id} cx="50%" cy="50%" r="50%">
            <Stop offset="0" stopColor={color} stopOpacity={opacity} />
            <Stop offset="0.5" stopColor={color} stopOpacity={opacity * 0.4} />
            <Stop offset="1" stopColor={color} stopOpacity={0} />
          </RadialGradient>
        </Defs>
        <Circle cx="50" cy="50" r="50" fill={`url(#${id})`} />
      </Svg>
    </Animated.View>
  );
}

type Props = {
  // The colour of the biggest blob — screens hand it whatever the screen
  // is about (a mode's colour, a player's, a role's) so the room the game
  // is played in changes colour with the game.
  tint: string;
  // Second and third voices. Left alone they are the app's purple and
  // cyan, which is what keeps the orange from taking the whole screen.
  second: string;
  third: string;
};

// The lights behind every screen. Three coloured blobs on a slow drift —
// the background of a party, not a form.
export default function Ambient({ tint, second, third }: Props) {
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {/* The main light sits a little below the top edge on purpose:
          several screens park an opaque bar up there, and a blob centred
          at y=0 would be sliced off by it in a visible straight line. */}
      <Blob color={tint} x={0.5} y={0.13} size={1.6} opacity={0.26} travel={26} period={9000} delay={0} />
      <Blob color={second} x={0.04} y={0.45} size={1.25} opacity={0.22} travel={34} period={11000} delay={700} />
      <Blob color={third} x={0.98} y={0.8} size={1.35} opacity={0.17} travel={30} period={13000} delay={1500} />
    </View>
  );
}
