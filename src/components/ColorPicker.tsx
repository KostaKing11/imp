import React, { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { t } from "../i18n";
import { colors, PLAYER_COLORS, radius, spacing } from "../theme";
import ColorWheel from "./ColorWheel";
import { WheelIcon } from "./icons";

type Props = {
  value: string;
  onChange: (color: string) => void;
};

// Wheel square on the left, preset swatches next to it, hex shown below
// (read-only here — it's editable inside the wheel pop-up).
export default function ColorPicker({ value, onChange }: Props) {
  const [wheelOpen, setWheelOpen] = useState(false);

  const isPreset = PLAYER_COLORS.some((c) => c.toUpperCase() === value.toUpperCase());

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{t("color")}</Text>
      <View style={styles.row}>
        <Pressable
          onPress={() => setWheelOpen(true)}
          style={[
            styles.swatch,
            styles.wheelSwatch,
            !isPreset && { backgroundColor: value, borderColor: "#FFFFFF", borderWidth: 3 },
          ]}
        >
          {isPreset ? <WheelIcon size={26} /> : null}
        </Pressable>
        <View style={styles.presets}>
          {PLAYER_COLORS.map((c) => (
            <Pressable
              key={c}
              onPress={() => onChange(c)}
              style={[
                styles.swatch,
                { backgroundColor: c },
                value.toUpperCase() === c.toUpperCase() && styles.swatchSelected,
              ]}
            />
          ))}
        </View>
      </View>
      <ColorWheel
        visible={wheelOpen}
        initial={value}
        onDone={onChange}
        onClose={() => setWheelOpen(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.xs,
  },
  label: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.textDim,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  row: {
    flexDirection: "row",
    gap: spacing.xs,
  },
  swatch: {
    width: 40,
    height: 40,
    borderRadius: radius.sm,
    borderWidth: 2,
    borderColor: colors.border,
  },
  wheelSwatch: {
    backgroundColor: colors.chip,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  presets: {
    flex: 1,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.xs,
  },
  swatchSelected: {
    borderColor: "#FFFFFF",
    borderWidth: 3,
  },
});
