import { useRef } from "react";
import { Animated } from "react-native";

// Every tappable thing in the app shrinks a little under the finger and
// springs back. One hook so the feel is identical everywhere.
export function usePressScale(to = 0.96) {
  const scale = useRef(new Animated.Value(1)).current;

  const spring = (toValue: number, speed: number) =>
    Animated.spring(scale, {
      toValue,
      speed,
      bounciness: toValue === 1 ? 8 : 0,
      useNativeDriver: true,
    }).start();

  return {
    scale,
    onPressIn: () => spring(to, 40),
    onPressOut: () => spring(1, 20),
    style: { transform: [{ scale }] },
  };
}
