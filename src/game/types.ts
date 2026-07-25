import { PairEntry } from "../../data/pairs";
import { QuestionEntry } from "../../data/questions";
import { WordEntry } from "../../data/words";

// Shared types for all gamemodes.

export type GameMode = "imp" | "odd" | "mafia" | "blef" | "faker";

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

