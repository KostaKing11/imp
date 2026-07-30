import { RefObject, useEffect } from "react";
import { Keyboard, ScrollView } from "react-native";

// Scrolls a ScrollView to its end the moment the keyboard actually
// appears, for screens whose text box is the last thing on the page.
//
// The alternative — scrolling on focus after a guessed delay — races the
// keyboard: the scroll happens, then the window resizes underneath it and
// the box is behind the keyboard again. `keyboardDidShow` fires after the
// resize, so by the time this runs the ScrollView already knows how much
// room it has left.
export function useScrollToInputOnKeyboard(ref: RefObject<ScrollView | null>) {
  useEffect(() => {
    const sub = Keyboard.addListener("keyboardDidShow", () => {
      // One frame later still, so the new layout has been committed.
      requestAnimationFrame(() => ref.current?.scrollToEnd({ animated: true }));
    });
    return () => sub.remove();
  }, [ref]);
}
