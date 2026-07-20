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
  },
];
