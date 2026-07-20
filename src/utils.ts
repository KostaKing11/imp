import { Alert, Platform } from "react-native";

export function uid(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

// Black or white text depending on how bright a background color is.
export function textColorFor(bg: string): string {
  const hex = bg.replace("#", "");
  if (hex.length < 6) return "#FFFFFF";
  const r = parseInt(hex.slice(0, 2), 16);
  const g = parseInt(hex.slice(2, 4), 16);
  const b = parseInt(hex.slice(4, 6), 16);
  const luminance = 0.299 * r + 0.587 * g + 0.114 * b;
  return luminance > 150 ? "#15171B" : "#FFFFFF";
}

// "ff5a1f" / "#FF5A1F" -> "#FF5A1F"; null if not a valid 6-digit hex.
export function normalizeHex(input: string): string | null {
  const cleaned = input.trim().replace(/^#/, "");
  if (!/^[0-9a-fA-F]{6}$/.test(cleaned)) return null;
  return `#${cleaned.toUpperCase()}`;
}

// h: 0-360, s/v: 0-1 -> "#RRGGBB"
export function hsvToHex(h: number, s: number, v: number): string {
  const c = v * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = v - c;
  let r = 0;
  let g = 0;
  let b = 0;
  if (h < 60) [r, g] = [c, x];
  else if (h < 120) [r, g] = [x, c];
  else if (h < 180) [g, b] = [c, x];
  else if (h < 240) [g, b] = [x, c];
  else if (h < 300) [r, b] = [x, c];
  else [r, b] = [c, x];
  const to = (n: number) => Math.round((n + m) * 255).toString(16).padStart(2, "0");
  return `#${to(r)}${to(g)}${to(b)}`.toUpperCase();
}

export function hexToHsv(hex: string): { h: number; s: number; v: number } {
  const h6 = hex.replace("#", "");
  if (!/^[0-9a-fA-F]{6}$/.test(h6)) return { h: 0, s: 0, v: 1 };
  const r = parseInt(h6.slice(0, 2), 16) / 255;
  const g = parseInt(h6.slice(2, 4), 16) / 255;
  const b = parseInt(h6.slice(4, 6), 16) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const d = max - min;
  let h = 0;
  if (d !== 0) {
    if (max === r) h = 60 * (((g - b) / d) % 6);
    else if (max === g) h = 60 * ((b - r) / d + 2);
    else h = 60 * ((r - g) / d + 4);
  }
  if (h < 0) h += 360;
  return { h, s: max === 0 ? 0 : d / max, v: max };
}

// "123" -> 123s (2:03); "3:47" -> 227s. Clamped to 10s..59:59. Null if invalid.
export function parseTimeInput(text: string): number | null {
  const t = text.trim();
  const clamp = (s: number) => Math.max(10, Math.min(3599, s));
  if (/^\d+$/.test(t)) return clamp(parseInt(t, 10));
  const m = t.match(/^(\d+):([0-5]?\d)$/);
  if (m) return clamp(parseInt(m[1], 10) * 60 + parseInt(m[2], 10));
  return null;
}

export function formatTime(s: number): string {
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}

// Alert.alert is a no-op on react-native-web, so fall back to confirm().
export function confirmDialog(title: string, message: string, onYes: () => void): void {
  if (Platform.OS === "web") {
    // eslint-disable-next-line no-alert
    if (typeof window !== "undefined" && window.confirm(`${title}\n\n${message}`)) onYes();
    return;
  }
  Alert.alert(title, message, [
    { text: "No", style: "cancel" },
    { text: "Yes", style: "destructive", onPress: onYes },
  ]);
}
