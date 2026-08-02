import { useEffect, useRef, useState } from "react";
import { Keyboard, useWindowDimensions } from "react-native";

// How much room the keyboard is taking that the layout does NOT already
// know about.
//
// The activity asks for adjustResize, but the app is edge-to-edge
// (`edgeToEdgeEnabled=true`), and under edge-to-edge Android stops
// resizing the window for the keyboard altogether — the app keeps its
// full height and the keyboard is simply drawn on top of it. So nothing
// moves out of the way by itself, and any box near the bottom of a screen
// ends up behind the keyboard. A Modal, being its own window, never
// resized either.
//
// Comparing the window height before and after tells us which world we
// are in, so this returns the *missing* room: the whole keyboard where
// nothing resized, and zero where the window already gave the space up.
// That way it stays correct if edge-to-edge is ever turned off.
export function useKeyboardInset(): number {
  const { height } = useWindowDimensions();
  const [keyboard, setKeyboard] = useState(0);
  const fullHeight = useRef(height);

  // Remember how tall the window is with no keyboard up.
  if (keyboard === 0 && height > fullHeight.current) fullHeight.current = height;

  useEffect(() => {
    const show = Keyboard.addListener("keyboardDidShow", (e) =>
      setKeyboard(e.endCoordinates.height)
    );
    const hide = Keyboard.addListener("keyboardDidHide", () => setKeyboard(0));
    return () => {
      show.remove();
      hide.remove();
    };
  }, []);

  if (keyboard === 0) return 0;
  // The window already gave up the space — adding more would overshoot.
  const shrunk = fullHeight.current - height;
  return Math.max(0, keyboard - shrunk);
}
