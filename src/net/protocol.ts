// Wire protocol for LOCAL MULTIPLAYER (every player on their own phone).
// Newline-delimited JSON over TCP on the local network — no internet and
// no server. The HOST is the single source of truth; clients only render
// the last STATE they received plus their own private CARD.

import { GameMode, RoleKind } from "../game/types";

export const DISCOVERY_PORT = 47777;
export const GAME_PORT = 47778;
export const HEARTBEAT_MS = 3000;
export const HEARTBEAT_TIMEOUT_MS = 10000;
export const NET_MAX_PLAYERS = 20;
// How long the ejection screen holds before the full results.
// How long the votes stay on the board before the verdict. Long enough
// to actually read who pointed at whom — the dots land one by one, and
// then you want a beat to take the board in.
export const EJECT_TALLY_MS = 5000;
// Tally + the verdict (the name types itself out and the ejected player
// drifts off) before the room moves to the results.
export const EJECT_TOTAL_MS = 11000;

// Blef is a duel; Skala and Uskladi se work from two players all the way
// up; everything else needs a group.
export function netMinPlayers(mode: GameMode): number {
  if (mode === "blef") return 2;
  if (mode === "skala" || mode === "sync") return 2;
  return 3;
}
export function netMaxPlayers(mode: GameMode): number {
  return mode === "blef" ? 2 : NET_MAX_PLAYERS;
}

export type NetPhase =
  | "lobby"
  | "cards" // everyone peeks at their own private card
  | "discuss" // "X goes first" — talk it out (imp / odd / blef)
  | "question" // faker: read your question and type an answer
  | "answers" // faker: the shared question first, then the answers
  | "playing" // mafia: played out loud, host reveals at the end
  | "vote"
  | "eject" // the votes appear, then who was voted out and what they were
  | "skalaClue" // skala: the caller sets a clue, everyone else waits
  | "skalaGuess" // skala: everyone else turns the dial
  | "skalaReveal" // skala: the target and every guess land on the dial
  | "syncWrite" // uskladi se: everyone secretly writes a word
  | "syncReveal" // uskladi se: the words turn over together
  | "tourVote" // tournament: five seconds to pick the next game
  | "tourTable" // tournament: the standings between games
  | "results";

export type NetPlayer = {
  id: string;
  name: string;
  color: string;
  // Lowest number joined first — that is who takes over if the host drops.
  joinOrder: number;
  connected: boolean;
  // false = joined mid-round; they sit out until the next round
  inRound: boolean;
};

// The host decides these for the whole room.
export type NetSettings = {
  language: "en" | "sr";
  timerEnabled: boolean;
  timerSeconds: number;
};

// What a single player privately sees when a round starts. Role names and
// descriptions are resolved by the host (they can be custom); the small
// labels around them are translated on each device.
export type NetCard = {
  mode: GameMode;
  roleName?: string;
  roleDesc?: string;
  roleColor?: string;
  // Which label goes above `value`. The two blef* kinds tell the holder
  // which half of the duel they got — they still learn nothing about the
  // other player's card.
  valueKind?: "word" | "hint" | "oddWord" | "clue" | "blefWord" | "blefHint";
  value?: string;
  // Extra line at the bottom of the card (e.g. "Imposter: Ana").
  extraKind?: "imposter";
  extraNames?: string[];
  // Faker only.
  question?: string;
  // Skala: the caller's secret point, and the two ends to draw.
  target?: number;
  left?: string;
  right?: string;
};

export type NetAnswer = { playerId: string; name: string; answer: string };

export type NetRoleInfo = {
  playerId: string;
  roleName: string;
  roleColor: string;
  kind: RoleKind;
  evil: boolean;
};

export type NetOutcome = "caught" | "escaped" | "tie" | "jester" | "none";

export type NetResults = {
  mode: GameMode;
  // playerId -> votes received
  counts: Record<string, number>;
  votedOutId: string | null; // null = tie or nobody voted
  // The hidden player of the round: imposter / odd one out / faker.
  targetId: string | null;
  outcome: NetOutcome;
  word?: string;
  mainWord?: string;
  oddWord?: string;
  mainQuestion?: string;
  oddQuestion?: string;
  // imp + mafia
  roles?: NetRoleInfo[];
  // blef
  clues?: { playerId: string; text: string; isWord: boolean }[];
  guesses?: Record<string, "word" | "hint">;
};

// Skala's shared board. `target` stays null for everybody until the
// reveal — until then it lives only on the caller's private card.
export type NetSkala = {
  left: string;
  right: string;
  clueGiverId: string;
  clue: string | null;
  target: number | null;
  guesses: Record<string, number>;
  scores: Record<string, number>;
  roundPoints: Record<string, number> | null;
  roundIndex: number;
  totalRounds: number;
};

// Uskladi se. `words` is null while people are still typing, so nobody
// can read the room before committing.
export type NetSync = {
  seed: string;
  targets: string[];
  roundNo: number;
  words: Record<string, string> | null;
  winners: string[] | null;
  matchedWord: string | null;
};

// How long the room has to pick the next tournament game.
export const TOUR_VOTE_MS = 5000;

// Every mode a tournament may deal. Mafia is left out — it is played out
// loud with a narrator and has no winner the app can score.
export const TOUR_MODES: GameMode[] = ["imp", "odd", "faker", "blef", "skala", "sync"];

export type NetTournament = {
  target: number;
  scores: Record<string, number>;
  // The three modes on offer this round.
  options: GameMode[];
  // playerId -> the mode they tapped
  votes: Record<string, GameMode>;
  // Wall-clock moment the vote closes, so every phone counts down together.
  closesAt: number;
  gameNo: number;
  // What the game just played was worth.
  lastAward: Record<string, number> | null;
  lastMode: GameMode | null;
  // Set once somebody reaches the target.
  winners: string[] | null;
};

export type RoomState = {
  roomId: string;
  code: string;
  hostId: string;
  mode: GameMode;
  phase: NetPhase;
  players: NetPlayer[];
  // who has already looked at their card / answered / voted
  readyIds: string[];
  answeredIds: string[];
  votedIds: string[];
  firstPlayerId: string | null;
  // When the current phase began — the discussion timer counts from here.
  phaseAt: number;
  settings: NetSettings;
  // Who voted for whom. Only filled in once voting is over, so nobody can
  // peek at it while the vote is still running.
  voteMap: Record<string, string> | null;
  answers: NetAnswer[] | null;
  // Faker: the shared question is revealed before the answers are.
  mainQuestion: string | null;
  answersShown: boolean;
  skala: NetSkala | null;
  sync: NetSync | null;
  tournament: NetTournament | null;
  results: NetResults | null;
};

// client -> host
export type ClientMsg =
  | { type: "JOIN"; name: string; color: string }
  | { type: "READY" } // I've seen my card
  | { type: "COLOR"; color: string } // I'd like a different colour
  | { type: "ANSWER"; text: string }
  | { type: "VOTE"; choice: string } // playerId, or "word" / "hint" in Blef
  | { type: "GUESS"; value: number } // skala: where I turned the dial
  | { type: "LEAVE" }
  | { type: "HB" };

// host -> client
export type HostMsg =
  | { type: "WELCOME"; playerId: string }
  | { type: "STATE"; state: RoomState }
  | { type: "CARD"; card: NetCard }
  | { type: "KICKED" }
  | { type: "HB" };

export function randomRoomCode(): string {
  return String(Math.floor(1000 + Math.random() * 9000));
}
