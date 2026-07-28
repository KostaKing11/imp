import React, { useEffect, useRef } from "react";
import { Animated, Pressable, StyleSheet } from "react-native";
import { colors, elevation } from "../theme";

type Props = {
  value: boolean;
  onChange: (value: boolean) => void;
};

// App-styled switch (replaces the default RN Switch). The thumb springs
// across rather than sliding linearly — the same feel as the segmented
// control's thumb.
export default function Toggle({ value, onChange }: Props) {
  const anim = useRef(new Animated.Value(value ? 1 : 0)).current;

  useEffect(() => {
    Animated.spring(anim, {
      toValue: value ? 1 : 0,
      speed: 20,
      bounciness: 8,
      useNativeDriver: false,
    }).start();
  }, [value, anim]);

  const backgroundColor = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [colors.chip, colors.accent],
  });
  const borderColor = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [colors.border, colors.accent],
  });
  const translateX = anim.interpolate({ inputRange: [0, 1], outputRange: [0, 24] });
  const thumbColor = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [colors.textFaint, "#FFFFFF"],
  });

  return (
    <Pressable onPress={() => onChange(!value)} hitSlop={10}>
      <Animated.View style={[styles.track, { backgroundColor, borderColor }]}>
        <Animated.View
          style={[styles.thumb, { backgroundColor: thumbColor, transform: [{ translateX }] }]}
        />
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  track: {
    width: 56,
    height: 32,
    borderRadius: 16,
    borderWidth: 1.5,
    justifyContent: "center",
    paddingHorizontal: 2,
  },
  thumb: {
    width: 24,
    height: 24,
    borderRadius: 12,
    ...elevation.card,
  },
});
