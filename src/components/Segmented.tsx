import React, { useEffect, useRef, useState } from "react";
import { Animated, Pressable, StyleSheet, Text, View } from "react-native";
import { alpha, colors, elevation, gradients, motion, radius, spacing, type } from "../theme";
import Gradient from "./Gradient";

type Option<T extends string> = {
  value: T;
  label: string;
  // Greyed out and unselectable (e.g. Wi-Fi rooms in the browser).
  disabled?: boolean;
};

type Props<T extends string> = {
  options: Option<T>[];
  value: T;
  onChange: (value: T) => void;
};

// Two-or-three-way switch with a thumb that slides to the choice. Used
// wherever the options are mutually exclusive and few — picking one is
// then a single tap with no state to read.
//
// Two ways of placing the thumb, because neither alone is enough. Until
// the row has been measured it sits at a percentage offset, which is
// always right but cannot animate; once onLayout has given a slot width
// it springs across on a transform. Percentages keep it from ever going
// missing, the transform gives it the slide.
export default function Segmented<T extends string>({ options, value, onChange }: Props<T>) {
  const [slotWidth, setSlotWidth] = useState(0);
  const index = Math.max(
    0,
    options.findIndex((o) => o.value === value)
  );
  const slot = 100 / options.length;
  const measured = slotWidth > 0;

  const anim = useRef(new Animated.Value(index)).current;
  useEffect(() => {
    // Before the first measurement the percentage is doing the placing,
    // so jump the value rather than animating to it — otherwise the
    // thumb slides in from wherever it was the moment we start using it.
    if (!measured) {
      anim.setValue(index);
      return;
    }
    Animated.spring(anim, {
      toValue: index,
      ...motion.snap,
      useNativeDriver: true,
    }).start();
  }, [index, anim, measured]);

  const translateX = anim.interpolate({
    inputRange: options.map((_, i) => i),
    outputRange: options.map((_, i) => i * slotWidth),
  });

  return (
    <View
      style={styles.track}
      onLayout={(e) =>
        setSlotWidth(Math.max(0, e.nativeEvent.layout.width - PAD * 2) / options.length)
      }
    >
      {/* Inset by the track's padding so the thumb's percentages are of
          the row of options, not of the whole track. */}
      <View style={styles.thumbLayer} pointerEvents="none">
        <Animated.View
          style={[
            styles.thumb,
            { width: `${slot}%` },
            measured
              ? { left: 0, transform: [{ translateX }] }
              : { left: `${index * slot}%` },
          ]}
        >
          {/* The thumb is the app's orange, not another shade of grey —
              which choice is live should be obvious from arm's length. */}
          <Gradient from={gradients.primary[0]} to={gradients.primary[1]} />
          <View style={styles.thumbCap} />
        </Animated.View>
      </View>

      {options.map((o) => {
        const on = o.value === value;
        return (
          <Pressable
            key={o.value}
            onPress={() => !o.disabled && onChange(o.value)}
            style={({ pressed }) => [styles.option, pressed && styles.pressed]}
          >
            <Text
              style={[styles.label, on && styles.labelOn, o.disabled && styles.labelOff]}
              numberOfLines={1}
            >
              {o.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const PAD = 4;

const styles = StyleSheet.create({
  track: {
    flexDirection: "row",
    backgroundColor: alpha(colors.bg, 0.55),
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.borderSoft,
    padding: PAD,
  },
  thumbLayer: {
    position: "absolute",
    top: PAD,
    left: PAD,
    right: PAD,
    bottom: PAD,
  },
  thumb: {
    position: "absolute",
    top: 0,
    bottom: 0,
    borderRadius: radius.pill,
    backgroundColor: colors.accent,
    overflow: "hidden",
    ...elevation.glow(colors.accent),
  },
  thumbCap: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 1.5,
    backgroundColor: "rgba(255,255,255,0.4)",
  },
  option: {
    flex: 1,
    minHeight: 42,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.xs,
  },
  pressed: {
    opacity: 0.6,
  },
  label: {
    ...type.button,
    fontSize: 15,
    color: colors.textDim,
  },
  labelOn: {
    color: colors.accentText,
    fontWeight: "900",
  },
  labelOff: {
    color: colors.disabled,
  },
});
