import { PAIR_CATEGORIES, PairEntry } from "../../data/pairs";
import { PAIR_CATEGORIES_SR } from "../../data/pairs-sr";
import { Language } from "../i18n";
import { OddRound, PairCategoryState, Player } from "./types";

function randomInt(max: number): number {
  return Math.floor(Math.random() * max);
}

function pickRandom<T>(arr: T[]): T {
  return arr[randomInt(arr.length)];
}

// Same order regardless of which word ends up with the group.
function pairId(pair: PairEntry): string {
  return [pair.main, pair.odd].sort().join("|");
}

export type StoredPairCategories = {
  builtinEnabled: Record<string, boolean>;
  custom: { id: string; name: string; enabled: boolean; pairs: PairEntry[] }[];
};

// Built-in pair categories always come fresh from data/pairs.ts — only
// their enabled flags are persisted. Custom categories persist fully.
// (Older saves stored just a name -> enabled map.)
export function buildPairCategories(
  stored?: StoredPairCategories | Record<string, boolean> | null,
  lang: Language = "en"
): PairCategoryState[] {
  const isNewShape = !!stored && typeof stored === "object" && "builtinEnabled" in stored;
  const builtinEnabled = isNewShape
    ? (stored as StoredPairCategories).builtinEnabled
    : ((stored ?? {}) as Record<string, boolean>);
  const custom = isNewShape ? (stored as StoredPairCategories).custom : [];
  const source = lang === "sr" ? PAIR_CATEGORIES_SR : PAIR_CATEGORIES;

  return [
    ...source.map((c) => ({
      id: `b:${c.name}`,
      name: c.name,
      enabled: builtinEnabled?.[c.name] ?? true,
      custom: false,
      pairs: c.pairs,
    })),
    ...custom.map((c) => ({ ...c, custom: true })),
  ];
}

export function serializePairCategories(categories: PairCategoryState[]): StoredPairCategories {
  const builtinEnabled: Record<string, boolean> = {};
  for (const c of categories) {
    if (!c.custom) builtinEnabled[c.name] = c.enabled;
  }
  return {
    builtinEnabled,
    custom: categories
      .filter((c) => c.custom)
      .map((c) => ({ id: c.id, name: c.name, enabled: c.enabled, pairs: c.pairs })),
  };
}

export function activePairPool(categories: PairCategoryState[]): PairEntry[] {
  return categories.filter((c) => c.enabled).flatMap((c) => c.pairs);
}

// Builds an Odd One Out round: picks a pair from enabled categories
// (avoiding repeats until the pool runs out), randomly decides which
// word the group gets, and picks one random player to be odd.
export function createOddRound(
  players: Player[],
  categories: PairCategoryState[],
  usedPairs: string[]
): OddRound | null {
  const pool = activePairPool(categories);
  if (pool.length === 0 || players.length < 3) return null;

  const fresh = pool.filter((p) => !usedPairs.includes(pairId(p)));
  const entry = pickRandom(fresh.length > 0 ? fresh : pool);

  const swap = Math.random() < 0.5;
  return {
    pairId: pairId(entry),
    mainWord: swap ? entry.odd : entry.main,
    oddWord: swap ? entry.main : entry.odd,
    oddPlayerId: pickRandom(players).id,
  };
}
