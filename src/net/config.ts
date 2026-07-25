import { Platform } from "react-native";

// Where the little room relay lives. It only forwards messages between
// the phones in a room — the host's phone still runs the whole game.
export const RELAY_URL = "wss://low-worm-6346.kostaking11.deno.net/ws";

// The web version of the game. Room QR codes point here with ?join=CODE,
// so scanning one with an iPhone camera opens the game and joins.
export const WEB_APP_URL = "https://kostaking11.github.io/imp/";

// On the web the relay can be overridden with ?relay=ws://... — handy for
// testing against a relay running on this machine.
export function relayUrl(): string {
  if (Platform.OS === "web" && typeof window !== "undefined") {
    try {
      const override = new URL(window.location.href).searchParams.get("relay");
      if (override) return override;
    } catch {
      // malformed URL — fall through to the default
    }
  }
  return RELAY_URL;
}

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
