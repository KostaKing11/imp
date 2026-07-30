import React, { useEffect, useRef } from "react";
import { Animated, ViewStyle } from "react-native";

type Props = {
  children: React.ReactNode;
  // Position in a list — each one starts a beat after the one above it.
  index?: number;
  // Milliseconds between neighbours.
  stagger?: number;
  // How far it travels on the way in.
  distance?: number;
  // Wait this long before the whole run starts.
  delay?: number;
  style?: ViewStyle;
};

// Rises and fades into place. Used on lists and on the things a screen is
// really about, so a screen arrives rather than simply being there.
export default function Appear({
  children,
  index = 0,
  stagger = 55,
  distance = 14,
  delay = 0,
  style,
}: Props) {
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const run = Animated.spring(anim, {
      toValue: 1,
      speed: 14,
      bounciness: 6,
      delay: delay + index * stagger,
      useNativeDriver: true,
    });
    run.start();
    return () => run.stop();
  }, [anim, index, stagger, delay]);

  const translateY = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [distance, 0],
  });

  return (
    <Animated.View style={[style, { opacity: anim, transform: [{ translateY }] }]}>
      {children}
    </Animated.View>
  );
}
