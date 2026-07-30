import { useRef } from "react";
import { Animated } from "react-native";
import { motion } from "../theme";

// Every tappable thing in the app shrinks a little under the finger and
// springs back past where it started. One hook so the feel is identical
// everywhere — and the overshoot on release is what makes the app feel
// like a toy rather than a form.
export function usePressScale(to = 0.96) {
  const scale = useRef(new Animated.Value(1)).current;

  const spring = (toValue: number, config: { speed: number; bounciness: number }) =>
    Animated.spring(scale, {
      toValue,
      ...config,
      useNativeDriver: true,
    }).start();

  return {
    scale,
    onPressIn: () => spring(to, motion.pressIn),
    onPressOut: () => spring(1, motion.pressOut),
    style: { transform: [{ scale }] },
  };
}
