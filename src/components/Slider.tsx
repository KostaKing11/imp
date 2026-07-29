import React, { useRef, useState } from "react";
import { GestureResponderEvent, StyleSheet, View } from "react-native";
import { colors, elevation } from "../theme";

type Props = {
  min: number;
  max: number;
  step: number;
  value: number;
  onChange: (value: number) => void;
};

// App-styled slider: tap or drag anywhere on the track.
// Uses pageX with the track's own offset so dragging never jumps
// (locationX is relative to whatever child the finger is over).
export default function Slider({ min, max, step, value, onChange }: Props) {
  const [width, setWidth] = useState(1);
  const offsetX = useRef(0);
  const ratio = Math.max(0, Math.min(1, (value - min) / (max - min)));

  const applyPageX = (pageX: number) => {
    const x = Math.max(0, Math.min(width, pageX - offsetX.current));
    let v = min + (x / width) * (max - min);
    v = Math.round(v / step) * step;
    onChange(Math.max(min, Math.min(max, v)));
  };

  const onGrant = (e: GestureResponderEvent) => {
    // locationX is container-relative here (children don't take touches),
    // so this recovers the track's absolute position for the whole drag.
    offsetX.current = e.nativeEvent.pageX - e.nativeEvent.locationX;
    applyPageX(e.nativeEvent.pageX);
  };

  return (
    <View
      style={styles.container}
      onLayout={(e) => setWidth(Math.max(1, e.nativeEvent.layout.width))}
      // Capture the touch before it reaches the ScrollView, otherwise a
      // finger that drifts a few pixels up or down scrolls the page
      // instead of moving the knob. Only x matters here.
      onStartShouldSetResponderCapture={() => true}
      onMoveShouldSetResponderCapture={() => true}
      onStartShouldSetResponder={() => true}
      onMoveShouldSetResponder={() => true}
      onResponderTerminationRequest={() => false}
      onResponderGrant={onGrant}
      onResponderMove={(e) => applyPageX(e.nativeEvent.pageX)}
    >
      <View style={styles.track} pointerEvents="none" />
      <View style={[styles.fill, { width: ratio * width }]} pointerEvents="none" />
      <View
        style={[styles.thumb, { left: Math.max(0, Math.min(width - 22, ratio * width - 11)) }]}
        pointerEvents="none"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 44,
    justifyContent: "center",
    alignSelf: "stretch",
  },
  track: {
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.chip,
    borderWidth: 1,
    borderColor: colors.borderSoft,
  },
  fill: {
    position: "absolute",
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.accent,
  },
  thumb: {
    position: "absolute",
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#FFFFFF",
    borderWidth: 3,
    borderColor: colors.accent,
    ...elevation.card,
  },
});
