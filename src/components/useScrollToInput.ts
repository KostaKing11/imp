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
    const timers: ReturnType<typeof setTimeout>[] = [];
    const sub = Keyboard.addListener("keyboardDidShow", () => {
      // Screen gives up the keyboard's room on this same event, so the
      // ScrollView is about to get shorter. Scroll once on the next frame
      // and again once that relayout has certainly landed — whichever
      // comes second is the one that ends up right, and scrolling to the
      // end twice looks identical to doing it once.
      requestAnimationFrame(() => ref.current?.scrollToEnd({ animated: true }));
      timers.push(setTimeout(() => ref.current?.scrollToEnd({ animated: true }), 180));
    });
    return () => {
      sub.remove();
      timers.forEach(clearTimeout);
    };
  }, [ref]);
}
