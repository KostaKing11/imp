import { WordEntry } from "../../data/words";
import { activeWordPool } from "./engine";
import { BlefClue, BlefRound, BlefRoundType, CategoryState, Player } from "./types";

// ---- tweakables ----
// How many clues each player says out loud during the clue phase.
export const BLEF_CLUES_PER_PLAYER = 2;
// Blef is a duel — exactly this many active players.
export const BLEF_PLAYER_COUNT = 2;

const ROUND_TYPES: BlefRoundType[] = ["both_word", "one_hint", "both_hint"];

function randomInt(max: number): number {
  return Math.floor(Math.random() * max);
}

function pickRandom<T>(arr: T[]): T {
  return arr[randomInt(arr.length)];
}

// Two different hints for the same word. Falls back to repeating the only
// hint if a word somehow ships with just one.
function pickTwoHints(entry: WordEntry): [string, string] {
  if (entry.hints.length < 2) return [entry.hints[0], entry.hints[0]];
  const first = randomInt(entry.hints.length);
  let second = randomInt(entry.hints.length - 1);
  if (second >= first) second += 1; // skip the one already taken
  return [entry.hints[first], entry.hints[second]];
}

// Builds a Blef round: picks a word (avoiding repeats until the pool runs
// out), secretly rolls a round type, and hands each player either the real
// word or a hint. Players are never told which the other one got.
export function createBlefRound(
  players: Player[],
  categories: CategoryState[],
  usedWords: string[]
): BlefRound | null {
  const pool = activeWordPool(categories);
  if (pool.length === 0 || players.length !== BLEF_PLAYER_COUNT) return null;

  const fresh = pool.filter((w) => !usedWords.includes(w.word));
  const entry = pickRandom(fresh.length > 0 ? fresh : pool);

  const roundType = pickRandom(ROUND_TYPES);
  const word: BlefClue = { text: entry.word, isWord: true };
  const [hintA, hintB] = pickTwoHints(entry);

  const clues: Record<string, BlefClue> = {};
  if (roundType === "both_word") {
    clues[players[0].id] = word;
    clues[players[1].id] = { ...word };
  } else if (roundType === "both_hint") {
    clues[players[0].id] = { text: hintA, isWord: false };
    clues[players[1].id] = { text: hintB, isWord: false };
  } else {
    // one_hint — a random player gets the word, the other gets a hint
    const wordHolder = randomInt(2);
    clues[players[wordHolder].id] = word;
    clues[players[1 - wordHolder].id] = { text: hintA, isWord: false };
  }

  return { word: entry.word, roundType, clues };
}
