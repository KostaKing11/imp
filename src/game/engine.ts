import { WordEntry } from "../../data/words";
import { Assignment, CategoryState, Player, RoleDef, Round } from "./types";

function randomInt(max: number): number {
  return Math.floor(Math.random() * max);
}

function pickRandom<T>(arr: T[]): T {
  return arr[randomInt(arr.length)];
}

function shuffle<T>(arr: T[]): T[] {
  const out = [...arr];
  for (let i = out.length - 1; i > 0; i--) {
    const j = randomInt(i + 1);
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

export function activeWordPool(categories: CategoryState[]): WordEntry[] {
  return categories.filter((c) => c.enabled).flatMap((c) => c.words);
}

// How many special-role slots are currently configured.
// A role with count 0 is simply not in the game (imposter is always >= 1).
export function roleSlotCount(roles: RoleDef[]): number {
  return roles.reduce((sum, r) => sum + r.count, 0);
}

// Builds a new round: picks a word from enabled categories (avoiding
// repeats until the pool runs out), shuffles players and deals roles.
// Everyone without a special role becomes a civilian.
export function createRound(
  players: Player[],
  roles: RoleDef[],
  categories: CategoryState[],
  usedWords: string[]
): Round | null {
  const pool = activeWordPool(categories);
  if (pool.length === 0 || players.length < 3) return null;

  const fresh = pool.filter((w) => !usedWords.includes(w.word));
  const entry = pickRandom(fresh.length > 0 ? fresh : pool);

  const slots: RoleDef[] = [];
  for (const role of roles) {
    for (let i = 0; i < role.count; i++) slots.push(role);
  }
  // Always leave at least one civilian in the game.
  const trimmed = slots.slice(0, players.length - 1);

  const shuffled = shuffle(players);
  const assignments: Record<string, Assignment> = {};
  shuffled.forEach((p, i) => {
    const role = trimmed[i];
    if (role) {
      assignments[p.id] = {
        playerId: p.id,
        roleId: role.id,
        hint: role.knowsWord ? undefined : pickRandom(entry.hints),
      };
    } else {
      assignments[p.id] = { playerId: p.id, roleId: "civilian" };
    }
  });

  return { word: entry.word, assignments };
}
