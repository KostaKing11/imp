import { Platform } from "react-native";

// The web version of the game. Room QR codes point here with ?join=CODE,
// so scanning one with an iPhone camera opens the game and joins.
export const WEB_APP_URL = "https://kostaking11.github.io/imp/";

// The 4-digit code carried in ?join=1234 when the app was opened from a
// room link or QR code.
export function joinCodeFromUrl(): string | null {
  if (Platform.OS !== "web" || typeof window === "undefined") return null;
  try {
    const code = new URL(window.location.href).searchParams.get("join");
    return code && /^\d{4}$/.test(code) ? code : null;
  } catch {
    return null;
  }
}

// Link that opens the web game straight into a room.
export function roomLink(code: string): string {
  const base = WEB_APP_URL.endsWith("/") ? WEB_APP_URL : `${WEB_APP_URL}/`;
  return `${base}?join=${code}`;
}

// Pulls the room code out of a scanned room link (any host, any path).
export function codeFromLink(payload: string): string | null {
  const m = payload.match(/[?&]join=(\d{4})\b/);
  return m ? m[1] : null;
}
