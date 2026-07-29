import { PairEntry } from "../../data/pairs";
import { QuestionEntry } from "../../data/questions";
import { SpectrumEntry } from "../../data/spectrums";
import { WordEntry } from "../../data/words";

// Shared types for all gamemodes.

export type GameMode = "imp" | "odd" | "mafia" | "blef" | "faker" | "skala" | "sync";

export type Player = {
  id: string;
  name: string;
  color: string;
  // Disabled players sit out of the next game (tap a player chip to toggle).
  enabled: boolean;
};

export type RoleKind =
  | "imposter"
  | "jester"
  | "helper"
  | "civilian"
  | "custom"
  | "mafia"
  | "narrator";

export type RoleDef = {
  id: string;
  name: string;
  description: string;
  color: string;
  // Whether this role is shown the secret word (false = gets a hint instead).
  knowsWord: boolean;
  enabled: boolean;
  count: number;
  builtin: boolean;
  kind: RoleKind;
  // IMP Classic: this role is shown who the imposter is (like the Helper).
  seesImposter?: boolean;
  // Mafia mode: evil roles are revealed together with the Mafia.
  evil?: boolean;
};

export type CategoryState = {
  id: string;
  name: string;
  enabled: boolean;
  custom: boolean;
  words: WordEntry[];
};

export type ModeTimer = {
  enabled: boolean;
  seconds: number;
};

export type Settings = {
  impTimer: ModeTimer;
  oddTimer: ModeTimer;
  blefTimer: ModeTimer;
  // Skala plays a whole number of full turns around the table, so every
  // player gives the same number of clues. 1 = one clue each.
  skalaTurns: number;
  // Tournament runs until somebody reaches this many points.
  tournamentTarget: number;
};

export type Assignment = {
  playerId: string;
  roleId: string;
  // Random hint for roles that don't know the word.
  hint?: string;
};

export type Round = {
  word: string;
  assignments: Record<string, Assignment>;
};

// ---- Odd One Out ----

export type PairCategoryState = {
  id: string;
  name: string;
  enabled: boolean;
  custom: boolean;
  pairs: PairEntry[];
};

export type OddRound = {
  // Canonical id of the pair, for no-repeat tracking.
  pairId: string;
  // What the group sees / what the odd player sees.
  mainWord: string;
  oddWord: string;
  oddPlayerId: string;
};

// ---- Mafia ----

// playerId -> roleId ("civilian" fills everyone without a special role)
export type MafiaRound = {
  assignments: Record<string, string>;
};

// ---- Blef (2 players) ----

// Never shown to players — it's what they're trying to work out.
export type BlefRoundType = "both_word" | "one_hint" | "both_hint";

// What a single player secretly sees.
export type BlefClue = {
  text: string;
  // true = they got the real word, false = they only got a hint
  isWord: boolean;
};

export type BlefRound = {
  word: string;
  roundType: BlefRoundType;
  // playerId -> what that player sees
  clues: Record<string, BlefClue>;
};

// ---- Faker ----

export type FakerCategoryState = {
  id: string;
  name: string;
  enabled: boolean;
  custom: boolean;
  questions: QuestionEntry[];
};

export type FakerRound = {
  // Canonical id of the question pair, for no-repeat tracking.
  questionId: string;
  mainQuestion: string;
  oddQuestion: string;
  oddPlayerId: string;
};

// playerId -> their typed answer
export type FakerAnswers = Record<string, string>;

// voterId -> suspectId
export type FakerVotes = Record<string, string>;

// ---- Skala (2+ players) ----

export type SpectrumCategoryState = {
  id: string;
  name: string;
  enabled: boolean;
  custom: boolean;
  spectrums: SpectrumEntry[];
};

// How close a guess has to be, and what it's worth. Read as: within 4 of
// the target scores 4, within 10 scores 3, and so on. These half-widths
// are also the wedges drawn on the dial.
export const SKALA_BANDS: { within: number; points: number }[] = [
  { within: 4, points: 4 },
  { within: 10, points: 3 },
  { within: 18, points: 2 },
  { within: 28, points: 1 },
];

export function skalaPoints(guess: number, target: number): number {
  const off = Math.abs(guess - target);
  for (const band of SKALA_BANDS) if (off <= band.within) return band.points;
  return 0;
}

export type SkalaRound = {
  spectrumId: string;
  left: string;
  right: string;
  // 0..100 along the spectrum. Only the clue giver ever sees this.
  target: number;
  clueGiverId: string;
  // What the clue giver typed. Null until they've submitted it.
  clue: string | null;
  // playerId -> their guess (0..100). The clue giver never guesses.
  guesses: Record<string, number>;
};

// A whole Skala game: several rounds, with the clue giver rotating and
// points adding up.
export type SkalaGame = {
  // Clue givers in order — length is the total number of rounds.
  order: string[];
  roundIndex: number;
  round: SkalaRound | null;
  // playerId -> points so far
  scores: Record<string, number>;
  usedSpectrumIds: string[];
};

// ---- Uskladi se (2+ players) ----

export type SyncRound = {
  // Everyone's word this round: playerId -> word.
  words: Record<string, string>;
};

export type SyncGame = {
  // The word both/all players first reacted to.
  seed: string;
  // Finished rounds, oldest first.
  history: SyncRound[];
  // Everything already said, normalised — nothing may be repeated.
  used: string[];
  // Set once two or more players land on the same word.
  winners: string[] | null;
  // The word they landed on.
  matchedWord: string | null;
};

// Trims, lowercases and drops punctuation so "Hladno." and "hladno" are
// the same answer. Diacritics are left alone — "ćao" and "cao" really are
// different words to a Serbian player.
export function normalizeWord(text: string): string {
  return text
    .trim()
    .toLowerCase()
    .replace(/[.,!?;:"'()\-–—]/g, "")
    .replace(/\s+/g, " ");
}

