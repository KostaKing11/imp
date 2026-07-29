import React, { useEffect, useRef, useState } from "react";
import { StyleProp, Text, TextStyle } from "react-native";

type Props = {
  text: string;
  style?: StyleProp<TextStyle>;
  // Milliseconds per character.
  speed?: number;
  // Wait this long before the first character.
  delay?: number;
  onDone?: () => void;
};

// Types a line out one character at a time. The verdict lands better
// read than shown — everyone gets to the name at the same moment.
export default function Typewriter({ text, style, speed = 42, delay = 0, onDone }: Props) {
  const [shown, setShown] = useState(0);
  const doneRef = useRef(false);

  useEffect(() => {
    setShown(0);
    doneRef.current = false;
    if (!text) return;

    let timer: ReturnType<typeof setInterval> | null = null;
    const start = setTimeout(() => {
      timer = setInterval(() => {
        setShown((n) => {
          if (n >= text.length) return n;
          return n + 1;
        });
      }, speed);
    }, delay);

    return () => {
      clearTimeout(start);
      if (timer) clearInterval(timer);
    };
  }, [text, speed, delay]);

  useEffect(() => {
    if (!doneRef.current && text.length > 0 && shown >= text.length) {
      doneRef.current = true;
      onDone?.();
    }
  }, [shown, text, onDone]);

  // The full string is rendered transparent underneath so the block never
  // reflows as characters arrive — a line that grows pushes everything
  // below it around.
  return (
    <Text style={style}>
      {text.slice(0, shown)}
      <Text style={{ opacity: 0 }}>{text.slice(shown)}</Text>
    </Text>
  );
}
