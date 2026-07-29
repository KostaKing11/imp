import { SPECTRUM_CATEGORIES, SpectrumEntry } from "../../data/spectrums";
import { SPECTRUM_CATEGORIES_SR } from "../../data/spectrums-sr";
import { Language } from "../i18n";
import {
  Player,
  SkalaGame,
  SkalaRound,
  skalaPoints,
  SpectrumCategoryState,
} from "./types";

// Skala works from two players up: one names a point on the dial, the
// rest turn the needle to where they think it is.
export const SKALA_MIN_PLAYERS = 2;

function randomInt(max: number): number {
  return Math.floor(Math.random() * max);
}

function pickRandom<T>(arr: T[]): T {
  return arr[randomInt(arr.length)];
}

function spectrumId(s: SpectrumEntry): string {
  return `${s.left}|${s.right}`;
}

export type StoredSpectrumCategories = {
  builtinEnabled: Record<string, boolean>;
  custom: { id: string; name: string; enabled: boolean; spectrums: SpectrumEntry[] }[];
};

export function buildSpectrumCategories(
  stored?: StoredSpectrumCategories | null,
  lang: Language = "en"
): SpectrumCategoryState[] {
  const source = lang === "sr" ? SPECTRUM_CATEGORIES_SR : SPECTRUM_CATEGORIES;
  return [
    ...source.map((c) => ({
      id: `b:${c.name}`,
      name: c.name,
      enabled: stored?.builtinEnabled?.[c.name] ?? true,
      custom: false,
      spectrums: c.spectrums,
    })),
    ...(stored?.custom ?? []).map((c) => ({ ...c, custom: true })),
  ];
}

export function serializeSpectrumCategories(
  categories: SpectrumCategoryState[]
): StoredSpectrumCategories {
  const builtinEnabled: Record<string, boolean> = {};
  for (const c of categories) {
    if (!c.custom) builtinEnabled[c.name] = c.enabled;
  }
  return {
    builtinEnabled,
    custom: categories
      .filter((c) => c.custom)
      .map((c) => ({ id: c.id, name: c.name, enabled: c.enabled, spectrums: c.spectrums })),
  };
}

export function activeSpectrumPool(categories: SpectrumCategoryState[]): SpectrumEntry[] {
  return categories.filter((c) => c.enabled).flatMap((c) => c.spectrums);
}

// Everyone gives the same number of clues, so the game is always a whole
// number of turns around the table — that is what `turns` counts.
export function createSkalaGame(players: Player[], turns: number): SkalaGame | null {
  if (players.length < SKALA_MIN_PLAYERS) return null;

  // Shuffle once, then repeat that order for each turn: nobody gives two
  // clues before everybody has given one.
  const shuffled = [...players].sort(() => Math.random() - 0.5).map((p) => p.id);
  const order: string[] = [];
  for (let t = 0; t < Math.max(1, turns); t++) order.push(...shuffled);

  return {
    order,
    roundIndex: 0,
    round: null,
    scores: Object.fromEntries(players.map((p) => [p.id, 0])),
    usedSpectrumIds: [],
  };
}

// Deals the round the game is currently pointing at. The target avoids
// the very ends of the dial — a clue for "2 out of 100" is not a game,
// it is just the left-hand word.
export function createSkalaRound(
  game: SkalaGame,
  categories: SpectrumCategoryState[]
): SkalaRound | null {
  const pool = activeSpectrumPool(categories);
  const clueGiverId = game.order[game.roundIndex];
  if (pool.length === 0 || !clueGiverId) return null;

  const fresh = pool.filter((s) => !game.usedSpectrumIds.includes(spectrumId(s)));
  const entry = pickRandom(fresh.length > 0 ? fresh : pool);
  const swap = Math.random() < 0.5;

  return {
    spectrumId: spectrumId(entry),
    left: swap ? entry.right : entry.left,
    right: swap ? entry.left : entry.right,
    target: 8 + randomInt(85),
    clueGiverId,
    clue: null,
    guesses: {},
  };
}

// Scores the round into the game and moves to the next one. The clue
// giver takes the average of what their guessers managed, so a clue
// nobody can read costs them too.
export function scoreSkalaRound(game: SkalaGame, round: SkalaRound): SkalaGame {
  const scores = { ...game.scores };
  const guessers = Object.keys(round.guesses);

  let total = 0;
  for (const playerId of guessers) {
    const points = skalaPoints(round.guesses[playerId], round.target);
    scores[playerId] = (scores[playerId] ?? 0) + points;
    total += points;
  }
  if (guessers.length > 0) {
    scores[round.clueGiverId] =
      (scores[round.clueGiverId] ?? 0) + Math.round(total / guessers.length);
  }

  return {
    ...game,
    scores,
    roundIndex: game.roundIndex + 1,
    round: null,
    usedSpectrumIds: [...game.usedSpectrumIds, round.spectrumId],
  };
}

export function skalaIsOver(game: SkalaGame): boolean {
  return game.roundIndex >= game.order.length;
}

// Highest score wins; several players can share the top.
export function skalaWinners(game: SkalaGame): string[] {
  const entries = Object.entries(game.scores);
  if (entries.length === 0) return [];
  const best = Math.max(...entries.map(([, v]) => v));
  return entries.filter(([, v]) => v === best).map(([id]) => id);
}
