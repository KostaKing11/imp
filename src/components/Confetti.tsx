import React, { useEffect, useRef } from "react";
import { Animated, Easing, StyleSheet, useWindowDimensions, View } from "react-native";
import { PLAYER_COLORS } from "../theme";

type Props = {
  // Usually the winners' colours; falls back to the whole palette.
  colors?: string[];
  count?: number;
};

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
    drift: (Math.random() - 0.5) * 90,
    delay: Math.random() * 450,
    spin: (Math.random() > 0.5 ? 1 : -1) * (360 + Math.random() * 360),
    size: 7 + Math.random() * 7,
    duration: 1700 + Math.random() * 900,
  }).current;

  useEffect(() => {
    Animated.timing(anim, {
      toValue: 1,
      duration: seed.duration,
      delay: seed.delay,
      easing: Easing.out(Easing.quad),
      useNativeDriver: true,
    }).start();
  }, [anim, seed]);

  const translateY = anim.interpolate({ inputRange: [0, 1], outputRange: [-40, height + 40] });
  const translateX = anim.interpolate({ inputRange: [0, 1], outputRange: [0, seed.drift] });
  const rotate = anim.interpolate({ inputRange: [0, 1], outputRange: ["0deg", `${seed.spin}deg`] });
  // Fades only at the very end, so the fall is not a slow disappearance.
  const opacity = anim.interpolate({ inputRange: [0, 0.8, 1], outputRange: [1, 1, 0] });

  return (
    <Animated.View
      style={{
        position: "absolute",
        left: seed.x,
        width: seed.size,
        height: seed.size * 1.6,
        borderRadius: 2,
        backgroundColor: color,
        opacity,
        transform: [{ translateY }, { translateX }, { rotate }],
      }}
    />
  );
}

// A short fall of paper over a winning screen. Purely decorative and
// never in the way — it ignores touches and runs once.
export default function Confetti({ colors, count = 26 }: Props) {
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
