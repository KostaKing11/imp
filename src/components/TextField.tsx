import React, { useEffect, useRef, useState } from "react";
import { Animated, Platform, StyleSheet, Text, TextInput, View } from "react-native";
import { alpha, colors, motion, radius, spacing, type } from "../theme";

type Props = {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  multiline?: boolean;
  autoCapitalize?: "none" | "sentences" | "words";
  // Tapping in highlights what's there, so a default name can just be
  // typed over.
  selectOnFocus?: boolean;
  // Lets a screen scroll the box into view when the keyboard opens.
  onFocus?: () => void;
};

export default function TextField({
  label,
  value,
  onChangeText,
  placeholder,
  multiline = false,
  autoCapitalize = "sentences",
  selectOnFocus = false,
  onFocus,
}: Props) {
  const [focused, setFocused] = useState(false);

  // The ring grows into place rather than switching on — a field you have
  // just tapped should feel like it woke up.
  const ring = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.spring(ring, {
      toValue: focused ? 1 : 0,
      ...motion.snap,
      useNativeDriver: false,
    }).start();
  }, [focused, ring]);

  const borderColor = ring.interpolate({
    inputRange: [0, 1],
    outputRange: [colors.borderSoft, colors.accent],
  });
  const backgroundColor = ring.interpolate({
    inputRange: [0, 1],
    outputRange: [colors.chip, colors.card],
  });

  return (
    <View style={styles.container}>
      <Text style={[styles.label, focused && styles.labelFocused]}>{label}</Text>
      <Animated.View style={[styles.ring, { borderColor, backgroundColor }]}>
        <TextInput
          style={[styles.input, multiline && styles.multiline]}
          value={value}
          onChangeText={onChangeText}
          onFocus={() => {
            setFocused(true);
            onFocus?.();
          }}
          onBlur={() => setFocused(false)}
          placeholder={placeholder}
          placeholderTextColor={colors.textFaint}
          selectionColor={colors.accent}
          multiline={multiline}
          autoCapitalize={autoCapitalize}
          selectTextOnFocus={selectOnFocus}
          underlineColorAndroid="transparent"
        />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.xs,
  },
  label: {
    ...type.eyebrow,
    color: colors.textFaint,
  },
  labelFocused: {
    color: colors.accent,
  },
  ring: {
    borderWidth: 1.5,
    borderRadius: radius.md,
    backgroundColor: alpha(colors.bg, 0.5),
  },
  input: {
    color: colors.text,
    fontSize: 17,
    fontWeight: "600",
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: 14,
    // The wrapper draws the border, so the field itself must not — and
    // the browser's own focus ring would sit inside our rounded one.
    borderWidth: 0,
    backgroundColor: "transparent",
    ...Platform.select({ web: { outlineStyle: "none" } as object, default: {} }),
  },
  multiline: {
    minHeight: 88,
    textAlignVertical: "top",
  },
});
