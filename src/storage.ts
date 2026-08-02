import AsyncStorage from "@react-native-async-storage/async-storage";

export const KEYS = {
  players: "imp.players",
  roles: "imp.roles",
  categories: "imp.categories",
  settings: "imp.settings",
  mode: "imp.mode",
  pairCategories: "imp.paircategories",
  mafiaRoles: "imp.mafiaroles",
  language: "imp.language",
  fakerCategories: "imp.fakercategories",
  playStyle: "imp.playstyle",
  netName: "imp.netname",
  netColor: "imp.netcolor",
  netMode: "imp.netmode",
  // The room this phone was last in, so closing the app (or the battery
  // dying) does not mean losing your seat and your tournament points.
  netRoom: "imp.netroom",
};

// A room worth trying to walk back into. Anything older than this and the
// game it belonged to is long over.
export const REJOIN_WINDOW_MS = 2 * 60 * 60 * 1000;

export type LastRoom = { code: string; at: number };

export async function loadJSON<T>(key: string, fallback: T): Promise<T> {
  try {
    const raw = await AsyncStorage.getItem(key);
    if (raw === null) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export async function saveJSON(key: string, value: unknown): Promise<void> {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Persisting is best-effort; the game keeps working from memory.
  }
}

export async function clearAll(): Promise<void> {
  try {
    await AsyncStorage.multiRemove(Object.values(KEYS));
  } catch {
    // ignore
  }
}
