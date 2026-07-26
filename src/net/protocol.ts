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
export const EJECT_TALLY_MS = 2600;
export const EJECT_TOTAL_MS = 6200;

// Blef is a duel; everything else needs a group.
export function netMinPlayers(mode: GameMode): number {
  return mode === "blef" ? 2 : 3;
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
  // Which label goes above `value`.
  valueKind?: "word" | "hint" | "oddWord" | "clue";
  value?: string;
  // Extra line at the bottom of the card (e.g. "Imposter: Ana").
  extraKind?: "imposter";
  extraNames?: string[];
  // Faker only.
  question?: string;
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
  results: NetResults | null;
};

// client -> host
export type ClientMsg =
  | { type: "JOIN"; name: string; color: string }
  | { type: "READY" } // I've seen my card
  | { type: "COLOR"; color: string } // I'd like a different colour
  | { type: "ANSWER"; text: string }
  | { type: "VOTE"; choice: string } // playerId, or "word" / "hint" in Blef
  | { type: "LEAVE" }
  | { type: "HB" };

// host -> client
export type HostMsg =
  | { type: "WELCOME"; playerId: string }
  | { type: "STATE"; state: RoomState }
  | { type: "CARD"; card: NetCard }
  | { type: "KICKED" }
  | { type: "HB" };

// UDP discovery
export type DiscoveryRequest = { t: "WHO"; code: string };
export type DiscoveryReply = {
  t: "ROOM";
  code: string;
  roomId: string;
  port: number;
  hostName: string;
};

// QR payload: imp://<ip>:<port>/<code>/<roomId>
export function encodeQr(ip: string, port: number, code: string, roomId: string): string {
  return `imp://${ip}:${port}/${code}/${roomId}`;
}

export function decodeQr(
  payload: string
): { ip: string; port: number; code: string; roomId: string } | null {
  const m = payload.match(/^imp:\/\/([\d.]+):(\d+)\/(\d{4})\/([\w-]+)$/);
  if (!m) return null;
  return { ip: m[1], port: parseInt(m[2], 10), code: m[3], roomId: m[4] };
}

export function randomRoomCode(): string {
  return String(Math.floor(1000 + Math.random() * 9000));
}
