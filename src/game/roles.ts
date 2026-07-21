import { RoleDef } from "./types";

// The default role everyone gets when no special role is assigned.
export const CIVILIAN: RoleDef = {
  id: "civilian",
  name: "Innocent",
  description: "You know the secret word. Give clever associations and sniff out the imposter!",
  color: "#2F9E44",
  knowsWord: true,
  enabled: true,
  count: 0,
  builtin: true,
  kind: "civilian",
};

export const DEFAULT_ROLES: RoleDef[] = [
  {
    id: "imposter",
    name: "Imposter",
    description: "You DON'T know the word — only one clue. Blend in and don't get voted out.",
    color: "#C1121F",
    knowsWord: false,
    enabled: true,
    count: 1,
    builtin: true,
    kind: "imposter",
  },
  {
    id: "jester",
    name: "Jester",
    description: "You know the word, but you WIN if the group votes you out. Act suspicious!",
    color: "#7B2CBF",
    knowsWord: true,
    enabled: false,
    count: 1,
    builtin: true,
    kind: "jester",
  },
  {
    id: "helper",
    name: "Helper",
    description: "You know the word AND who the imposter is. Secretly help them — if the imposter wins, you win too. But if YOU got voted out, only the imposter wins.",
    color: "#C77800",
    knowsWord: true,
    enabled: false,
    count: 1,
    builtin: true,
    kind: "helper",
    seesImposter: true,
  },
];

// ---- Mafia mode ----

// The filler role everyone gets when no special role is assigned.
// Always in the game — no toggle.
export const MAFIA_CIVILIAN: RoleDef = {
  id: "civilian",
  name: "Civilian",
  description: "An innocent townsperson with no special powers. Pay attention during the day, join the discussion and help vote out the Mafia.",
  color: "#2F9E44",
  knowsWord: true,
  enabled: true,
  count: 0,
  builtin: true,
  kind: "civilian",
};

export const DEFAULT_MAFIA_ROLES: RoleDef[] = [
  {
    id: "mafia",
    name: "Mafia",
    description: "Each night, wake up with your fellow Mafia and silently choose a victim. By day, act innocent and deny everything. You win when the Mafia outnumbers the town.",
    color: "#8B0F1E",
    knowsWord: true,
    enabled: true,
    count: 1,
    builtin: true,
    kind: "mafia",
    evil: true,
  },
  {
    id: "lady",
    name: "Lady",
    description: "You work with the Mafia. Each night, visit one player — they're distracted and their power does nothing that night. You win with the Mafia.",
    color: "#E85D9E",
    knowsWord: true,
    enabled: true,
    count: 0,
    builtin: true,
    kind: "custom",
    evil: true,
  },
  {
    id: "police",
    name: "Police",
    description: "Each night, point at one player — you're told whether they're evil. Use what you learn to steer the town's vote without exposing yourself.",
    color: "#1E4FFF",
    knowsWord: true,
    enabled: true,
    count: 0,
    builtin: true,
    kind: "custom",
  },
  {
    id: "doctor",
    name: "Doctor",
    description: "Each night, choose one player to protect — if the Mafia attacks them, they survive. You may protect yourself too.",
    color: "#12B5B0",
    knowsWord: true,
    enabled: true,
    count: 0,
    builtin: true,
    kind: "custom",
  },
  {
    id: "mjester",
    name: "Jester",
    description: "You win alone: trick the town into voting YOU out. Act suspicious — but not too obviously. You're neither good nor evil.",
    color: "#7B2CBF",
    knowsWord: true,
    enabled: true,
    count: 0,
    builtin: true,
    kind: "jester",
  },
  {
    id: "narrator",
    name: "Narrator",
    description: "You're not playing — you're running the show. Put the town to sleep, wake the night roles one by one, and narrate the story of each day.",
    color: "#5B6472",
    knowsWord: true,
    enabled: true,
    count: 0,
    builtin: true,
    kind: "narrator",
  },
];
