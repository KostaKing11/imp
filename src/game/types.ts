import { WordEntry } from "../../data/words";

// Shared types for the IMP gamemode.

export type Player = {
  id: string;
  name: string;
  color: string;
  // Disabled players sit out of the next game (tap a player chip to toggle).
  enabled: boolean;
};

export type RoleKind = "imposter" | "jester" | "helper" | "civilian" | "custom";

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
};

export type CategoryState = {
  id: string;
  name: string;
  enabled: boolean;
  custom: boolean;
  words: WordEntry[];
};

export type Settings = {
  timerEnabled: boolean;
  timerSeconds: number;
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
