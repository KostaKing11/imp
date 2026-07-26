import React, { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { t } from "../i18n";
import { colors, PLAYER_COLORS, radius, spacing } from "../theme";
import { textColorFor } from "../utils";
import ColorWheel from "./ColorWheel";
import { WheelIcon } from "./icons";

type Props = {
  value: string;
  onChange: (color: string) => void;
  // Colors other players already have — shown crossed out and not pickable.
  taken?: string[];
  // Roles may be any color; players are held to the twenty.
  allowCustom?: boolean;
};

// The fixed set of player colors. There is no free-form picker on purpose:
// two players with slightly different shades of blue is exactly the mess
// this avoids.
export default function ColorPicker({ value, onChange, taken = [], allowCustom = false }: Props) {
  const [wheelOpen, setWheelOpen] = useState(false);
  const isPreset = PLAYER_COLORS.some((c) => c.toUpperCase() === value.toUpperCase());
  const isTaken = (color: string) =>
    taken.some((c) => c.toUpperCase() === color.toUpperCase()) &&
    value.toUpperCase() !== color.toUpperCase();

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{t("color")}</Text>
      <View style={styles.grid}>
        {allowCustom ? (
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
        ) : null}
        {PLAYER_COLORS.map((c) => {
          const used = isTaken(c);
          const selected = value.toUpperCase() === c.toUpperCase();
          return (
            <Pressable
              key={c}
              disabled={used}
              onPress={() => onChange(c)}
              style={({ pressed }) => [
                styles.swatch,
                { backgroundColor: c },
                selected && styles.swatchSelected,
                used && styles.swatchTaken,
                pressed && !used && styles.pressed,
              ]}
            >
              {used ? (
                <Text style={[styles.takenMark, { color: textColorFor(c) }]}>✕</Text>
              ) : null}
            </Pressable>
          );
        })}
      </View>
      {allowCustom ? (
        <ColorWheel
          visible={wheelOpen}
          initial={value}
          onDone={onChange}
          onClose={() => setWheelOpen(false)}
        />
      ) : null}
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
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.xs,
  },
  swatch: {
    width: 40,
    height: 40,
    borderRadius: radius.sm,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  wheelSwatch: {
    backgroundColor: colors.chip,
    overflow: "hidden",
  },
  swatchSelected: {
    borderColor: "#FFFFFF",
    borderWidth: 3,
  },
  swatchTaken: {
    opacity: 0.3,
  },
  takenMark: {
    fontSize: 16,
    fontWeight: "900",
  },
  pressed: {
    opacity: 0.7,
  },
});
