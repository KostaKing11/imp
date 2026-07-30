import React, { useEffect, useRef } from "react";
import { Animated, Easing, StyleSheet, useWindowDimensions, View } from "react-native";
import { PLAYER_COLORS } from "../theme";

type Props = {
  // Usually the winners' colours; falls back to the whole palette.
  colors?: string[];
  count?: number;
};

// Three shapes, because a fall of identical rectangles reads as a loading
// bar coming apart: strips tumble, discs drift, squares flutter.
type Shape = "strip" | "disc" | "square";

function Piece({
  color,
  index,
  total,
  width,
  height,
}: {
  color: string;
  index: number;
  total: number;
  width: number;
  height: number;
}) {
  const anim = useRef(new Animated.Value(0)).current;
  // Fixed per piece so nothing jumps between frames.
  const seed = useRef({
    x: (index / total) * width + (Math.random() - 0.5) * 40,
    // Two drifts, so a piece can change its mind halfway down instead of
    // travelling in a straight diagonal.
    drift1: (Math.random() - 0.5) * 70,
    drift2: (Math.random() - 0.5) * 130,
    delay: Math.random() * 500,
    spin: (Math.random() > 0.5 ? 1 : -1) * (360 + Math.random() * 720),
    size: 7 + Math.random() * 8,
    duration: 1800 + Math.random() * 1100,
    shape: (["strip", "disc", "square"] as Shape[])[index % 3],
    // A little of the fall is spent growing in, so pieces do not simply
    // exist at full size on frame one.
    startScale: 0.4 + Math.random() * 0.4,
  }).current;

  useEffect(() => {
    const run = Animated.timing(anim, {
      toValue: 1,
      duration: seed.duration,
      delay: seed.delay,
      easing: Easing.bezier(0.25, 0.6, 0.4, 1),
      useNativeDriver: true,
    });
    run.start();
    return () => run.stop();
  }, [anim, seed]);

  const translateY = anim.interpolate({ inputRange: [0, 1], outputRange: [-50, height + 60] });
  const translateX = anim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0, seed.drift1, seed.drift2],
  });
  const rotate = anim.interpolate({ inputRange: [0, 1], outputRange: ["0deg", `${seed.spin}deg`] });
  const scale = anim.interpolate({
    inputRange: [0, 0.12, 1],
    outputRange: [seed.startScale, 1, 1],
  });
  // Fades only at the very end, so the fall is not a slow disappearance.
  const opacity = anim.interpolate({ inputRange: [0, 0.82, 1], outputRange: [1, 1, 0] });

  const shape =
    seed.shape === "disc"
      ? { width: seed.size, height: seed.size, borderRadius: seed.size }
      : seed.shape === "square"
        ? { width: seed.size, height: seed.size, borderRadius: 2 }
        : { width: seed.size * 0.6, height: seed.size * 2, borderRadius: 2 };

  return (
    <Animated.View
      style={{
        position: "absolute",
        left: seed.x,
        backgroundColor: color,
        opacity,
        ...shape,
        transform: [{ translateY }, { translateX }, { rotate }, { scale }],
      }}
    />
  );
}

// A short fall of paper over a winning screen. Purely decorative and
// never in the way — it ignores touches and runs once.
export default function Confetti({ colors, count = 34 }: Props) {
  const { width, height } = useWindowDimensions();
  const palette = colors && colors.length > 0 ? colors : PLAYER_COLORS;

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {Array.from({ length: count }, (_, i) => (
        <Piece
          key={i}
          index={i}
          total={count}
          color={palette[i % palette.length]}
          width={width}
          height={height}
        />
      ))}
    </View>
  );
}
