import React, { useEffect, useRef } from "react";
import { Animated, ViewStyle } from "react-native";
import { motion } from "../theme";

type Props = {
  children: React.ReactNode;
  // Wait this long before it lands.
  delay?: number;
  // How small it starts. Below about 0.7 it reads as a zoom rather than
  // a pop.
  from?: number;
  style?: ViewStyle;
};

// Lands with an overshoot. For the one thing a screen is about — the
// word, the verdict, the winner — where Appear's quiet rise is too
// polite. Everything else should still use Appear; if every element
// pops, nothing does.
export default function Pop({ children, delay = 0, from = 0.82, style }: Props) {
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const run = Animated.spring(anim, {
      toValue: 1,
      ...motion.pop,
      delay,
      useNativeDriver: true,
    });
    run.start();
    return () => run.stop();
  }, [anim, delay]);

  const scale = anim.interpolate({ inputRange: [0, 1], outputRange: [from, 1] });
  const opacity = anim.interpolate({ inputRange: [0, 0.45, 1], outputRange: [0, 1, 1] });

  return (
    <Animated.View style={[style, { opacity, transform: [{ scale }] }]}>{children}</Animated.View>
  );
}
