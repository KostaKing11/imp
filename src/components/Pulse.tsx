import React, { useEffect, useRef } from "react";
import { Animated, Easing, ViewStyle } from "react-native";

type Props = {
  children: React.ReactNode;
  // How far it breathes, as a scale.
  to?: number;
  // One breath in and out, in milliseconds.
  period?: number;
  style?: ViewStyle;
};

// Breathes, forever. For anything the game is waiting on — a room code
// nobody has typed yet, "waiting for the others" — so a screen that
// cannot move still looks alive rather than frozen.
export default function Pulse({ children, to = 1.04, period = 1600, style }: Props) {
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(anim, {
          toValue: 1,
          duration: period,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(anim, {
          toValue: 0,
          duration: period,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [anim, period]);

  const scale = anim.interpolate({ inputRange: [0, 1], outputRange: [1, to] });

  return <Animated.View style={[style, { transform: [{ scale }] }]}>{children}</Animated.View>;
}
