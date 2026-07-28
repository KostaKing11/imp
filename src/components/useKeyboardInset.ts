import { useEffect, useRef, useState } from "react";
import { Keyboard, useWindowDimensions } from "react-native";

// How much room the keyboard is taking that the layout does NOT already
// know about.
//
// A normal screen shrinks by itself when the keyboard opens (the activity
// is adjustResize), so nothing extra is needed. A Modal on Android is its
// own window and does not shrink — that is why the box you were typing in
// could end up behind the keyboard. Comparing the window height before
// and after tells us which of the two we are in, so the padding is only
// added when it is actually missing.
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
