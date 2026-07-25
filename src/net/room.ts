// Host-authoritative room logic for local multiplayer. The host owns the
// whole game state and every random draw; clients just render the latest
// STATE plus the private CARD the host dealt them.
// Everything speaks through the Transport interface — no sockets here.

import { createBlefRound } from "../game/blefEngine";
import { createRound } from "../game/engine";
import { createFakerRound } from "../game/fakerEngine";
import { createMafiaRound } from "../game/mafiaEngine";
import { createOddRound } from "../game/oddEngine";
import { CIVILIAN, MAFIA_CIVILIAN } from "../game/roles";
import {
  BlefRound,
  CategoryState,
  FakerCategoryState,
  FakerRound,
  GameMode,
  MafiaRound,
  OddRound,
  PairCategoryState,
  Player,
  RoleDef,
  Round,
} from "../game/types";
import { roleDesc, roleName } from "../i18n";
import { uid } from "../utils";
import {
  ClientMsg,
  HEARTBEAT_MS,
  HEARTBEAT_TIMEOUT_MS,
  HostMsg,
  NetAnswer,
  NetCard,
  NetPlayer,
  NetResults,
  NetRoleInfo,
  netMaxPlayers,
  netMinPlayers,
  RoomState,
} from "./protocol";
import { Transport } from "./transport";

const ANSWER_MAX = 50;

// Everything the host needs to deal a round — the very same lists the
// one-phone setup uses, so custom words/roles come along for the ride.
export type HostConfig = {
  mode: GameMode;
  roles: RoleDef[];
  mafiaRoles: RoleDef[];
  categories: CategoryState[];
  pairCategories: PairCategoryState[];
  fakerCategories: FakerCategoryState[];
};

export type RoomEvents = {
  onState: (state: RoomState) => void;
  onCard: (card: NetCard | null) => void;
  onHostLost?: () => void;
  onKicked?: () => void;
};

export class RoomHost {
  state: RoomState;
  readonly myId: string;
  private transport: Transport;
  private config: HostConfig;
  private events: RoomEvents;

  // current round (only one of these is set, depending on the mode)
  private round: Round | null = null;
  private oddRound: OddRound | null = null;
  private mafiaRound: MafiaRound | null = null;
  private blefRound: BlefRound | null = null;
  private fakerRound: FakerRound | null = null;

  private answers: Record<string, string> = {};
  private votes: Record<string, string> = {};
  private cards: Record<string, NetCard> = {};
  private usedWords: string[] = [];
  private usedPairs: string[] = [];
  private usedQuestions: string[] = [];

  private peerToPlayer = new Map<string, string>();
  private playerToPeer = new Map<string, string>();
  private lastSeen = new Map<string, number>();
  private hbTimer: ReturnType<typeof setInterval> | null = null;
  private nextJoin = 1;

  constructor(
    transport: Transport,
    events: RoomEvents,
    hostName: string,
    hostColor: string,
    config: HostConfig,
    code: string,
    roomId: string
  ) {
    this.transport = transport;
    this.events = events;
    this.config = config;
    this.myId = uid();
    this.state = {
      roomId,
      code,
      hostId: this.myId,
      mode: config.mode,
      phase: "lobby",
      players: [
        {
          id: this.myId,
          name: hostName,
          color: hostColor,
          joinOrder: 0,
          connected: true,
          inRound: true,
        },
      ],
      readyIds: [],
      answeredIds: [],
      votedIds: [],
      firstPlayerId: null,
      answers: null,
      mainQuestion: null,
      answersShown: false,
      results: null,
    };

    transport.onMessage((from, raw) => this.handle(from, raw as ClientMsg));
    transport.onPeerLeave((peer) => this.dropPeer(peer));
    transport.onPeerJoin(() => {
      // Wait for their JOIN message before adding them to the room.
    });

    this.hbTimer = setInterval(() => {
      this.transport.send("all", { type: "HB" } satisfies HostMsg);
      const now = Date.now();
      for (const [peer, seen] of [...this.lastSeen]) {
        if (now - seen > HEARTBEAT_TIMEOUT_MS) this.dropPeer(peer);
      }
    }, HEARTBEAT_MS);

    this.emit();
  }

  // ---- helpers ----

  private player(id: string): NetPlayer | undefined {
    return this.state.players.find((p) => p.id === id);
  }

  get connectedPlayers(): NetPlayer[] {
    return this.state.players.filter((p) => p.connected);
  }

  get inRoundPlayers(): NetPlayer[] {
    return this.state.players.filter((p) => p.connected && p.inRound);
  }

  private asPlayers(list: NetPlayer[]): Player[] {
    return list.map((p) => ({ id: p.id, name: p.name, color: p.color, enabled: true }));
  }

  private uniqueName(name: string): string {
    const base = name.trim().slice(0, 18) || "?";
    let candidate = base;
    let n = 2;
    while (this.state.players.some((p) => p.connected && p.name === candidate)) {
      candidate = `${base} ${n++}`;
    }
    return candidate;
  }

  // ---- incoming ----

  private handle(peer: string, msg: ClientMsg): void {
    this.lastSeen.set(peer, Date.now());
    if (!msg || typeof msg !== "object") return;

    if (msg.type === "JOIN") {
      if (this.peerToPlayer.has(peer)) return;
      if (this.connectedPlayers.length >= netMaxPlayers(this.state.mode)) {
        this.transport.send(peer, { type: "KICKED" } satisfies HostMsg);
        this.transport.kick?.(peer);
        return;
      }
      const playerId = uid();
      this.peerToPlayer.set(peer, playerId);
      this.playerToPeer.set(playerId, peer);
      this.state.players.push({
        id: playerId,
        name: this.uniqueName(msg.name),
        color: msg.color,
        joinOrder: this.nextJoin++,
        connected: true,
        // Mid-round joiners wait in the wings until the next round.
        inRound: this.state.phase === "lobby",
      });
      this.transport.send(peer, { type: "WELCOME", playerId } satisfies HostMsg);
      this.emit();
      return;
    }

    const playerId = this.peerToPlayer.get(peer);
    if (!playerId) return;

    switch (msg.type) {
      case "READY":
        this.markReady(playerId);
        break;
      case "ANSWER":
        this.submitAnswer(playerId, msg.text);
        break;
      case "VOTE":
        this.submitVote(playerId, msg.choice);
        break;
      case "LEAVE":
        this.dropPeer(peer);
        break;
      case "HB":
        break;
    }
  }

  private dropPeer(peer: string): void {
    const playerId = this.peerToPlayer.get(peer);
    this.peerToPlayer.delete(peer);
    this.lastSeen.delete(peer);
    if (!playerId) return;
    this.playerToPeer.delete(playerId);
    // Players who leave disappear from the room entirely — the host can
    // always start again with whoever is still around.
    this.state.players = this.state.players.filter((p) => p.id !== playerId);
    this.state.readyIds = this.state.readyIds.filter((id) => id !== playerId);
    this.state.answeredIds = this.state.answeredIds.filter((id) => id !== playerId);
    this.state.votedIds = this.state.votedIds.filter((id) => id !== playerId);
    this.emit();
  }

  // ---- player actions (the host is a player too, and calls these directly) ----

  markReady(playerId: string): void {
    if (this.state.phase !== "cards") return;
    const p = this.player(playerId);
    if (!p?.inRound) return;
    if (!this.state.readyIds.includes(playerId)) this.state.readyIds.push(playerId);
    this.emit();
  }

  submitAnswer(playerId: string, text: string): void {
    const p = this.player(playerId);
    if (this.state.phase !== "question" || !p?.inRound) return;
    this.answers[playerId] = text.trim().slice(0, ANSWER_MAX);
    if (!this.state.answeredIds.includes(playerId)) this.state.answeredIds.push(playerId);
    this.emit();
  }

  submitVote(playerId: string, choice: string): void {
    const p = this.player(playerId);
    if (this.state.phase !== "vote" || !p?.inRound) return;
    // Blef votes "word"/"hint"; every other mode votes for a player.
    if (this.state.mode !== "blef" && playerId === choice) return;
    this.votes[playerId] = choice;
    if (!this.state.votedIds.includes(playerId)) this.state.votedIds.push(playerId);
    this.emit();
  }

  // ---- host controls ----

  setConfig(config: HostConfig): void {
    this.config = config;
    if (this.state.phase === "lobby" && this.state.mode !== config.mode) {
      this.state.mode = config.mode;
      this.emit();
    }
  }

  kick(playerId: string): void {
    if (playerId === this.myId) return;
    const peer = this.playerToPeer.get(playerId);
    if (peer) {
      this.transport.send(peer, { type: "KICKED" } satisfies HostMsg);
      this.peerToPlayer.delete(peer);
      this.playerToPeer.delete(playerId);
      this.lastSeen.delete(peer);
      // Give the message a moment to flush before dropping the socket.
      setTimeout(() => this.transport.kick?.(peer), 250);
    }
    this.state.players = this.state.players.filter((p) => p.id !== playerId);
    this.emit();
  }

  // null when the room is ready to start, otherwise why it isn't.
  startProblem(): "few" | "many" | "content" | null {
    const n = this.connectedPlayers.length;
    if (n < netMinPlayers(this.state.mode)) return "few";
    if (n > netMaxPlayers(this.state.mode)) return "many";
    const { mode, categories, pairCategories, fakerCategories, roles, mafiaRoles } = this.config;
    if (mode === "imp" || mode === "blef") {
      if (categories.filter((c) => c.enabled).flatMap((c) => c.words).length === 0) return "content";
    }
    if (mode === "odd") {
      if (pairCategories.filter((c) => c.enabled).flatMap((c) => c.pairs).length === 0)
        return "content";
    }
    if (mode === "faker") {
      if (fakerCategories.filter((c) => c.enabled).flatMap((c) => c.questions).length === 0)
        return "content";
    }
    if (mode === "imp" && roles.reduce((s, r) => s + r.count, 0) > n - 1) return "content";
    if (mode === "mafia" && mafiaRoles.reduce((s, r) => s + r.count, 0) > n) return "content";
    return null;
  }

  startRound(): void {
    if (this.state.phase !== "lobby" && this.state.phase !== "results") return;
    if (this.startProblem() !== null) return;
    for (const p of this.state.players) if (p.connected) p.inRound = true;
    this.beginRound();
  }

  backToLobby(): void {
    this.state.phase = "lobby";
    this.state.readyIds = [];
    this.state.answeredIds = [];
    this.state.votedIds = [];
    this.state.answers = null;
    this.state.mainQuestion = null;
    this.state.answersShown = false;
    this.state.results = null;
    this.state.firstPlayerId = null;
    this.state.mode = this.config.mode;
    for (const p of this.state.players) if (p.connected) p.inRound = true;
    this.cards = {};
    this.events.onCard(null);
    this.emit();
  }

  // Cards -> discussion / play. Faker skips this (its card IS the question).
  continueFromCards(): void {
    if (this.state.phase !== "cards") return;
    if (this.state.mode === "mafia") {
      this.state.phase = "playing";
    } else {
      const list = this.inRoundPlayers;
      this.state.firstPlayerId = list.length
        ? list[Math.floor(Math.random() * list.length)].id
        : null;
      this.state.phase = "discuss";
    }
    this.emit();
  }

  // Faker: question -> the shared question, then the answers.
  revealAnswers(): void {
    if (this.state.phase !== "question" || !this.fakerRound) return;
    const list: NetAnswer[] = this.inRoundPlayers.map((p) => ({
      playerId: p.id,
      name: p.name,
      answer: this.answers[p.id] ?? "",
    }));
    this.state.answers = list;
    this.state.mainQuestion = this.fakerRound.mainQuestion;
    this.state.answersShown = false;
    this.state.phase = "answers";
    this.emit();
  }

  showAnswers(): void {
    if (this.state.phase !== "answers") return;
    this.state.answersShown = true;
    this.emit();
  }

  startVote(): void {
    if (this.state.phase !== "discuss" && this.state.phase !== "answers") return;
    this.state.phase = "vote";
    this.state.votedIds = [];
    this.votes = {};
    this.emit();
  }

  revealResults(): void {
    if (this.state.phase !== "vote" && this.state.phase !== "playing") return;
    this.state.results = this.buildResults();
    this.state.phase = "results";
    this.emit();
  }

  // ---- dealing ----

  private beginRound(): void {
    const participants = this.asPlayers(this.inRoundPlayers);
    const { mode } = this.config;
    this.round = null;
    this.oddRound = null;
    this.mafiaRound = null;
    this.blefRound = null;
    this.fakerRound = null;

    if (mode === "imp") {
      const r = createRound(participants, this.config.roles, this.config.categories, this.usedWords);
      if (!r) return;
      this.round = r;
      this.usedWords = this.usedWords.includes(r.word) ? [r.word] : [...this.usedWords, r.word];
    } else if (mode === "odd") {
      const r = createOddRound(participants, this.config.pairCategories, this.usedPairs);
      if (!r) return;
      this.oddRound = r;
      this.usedPairs = this.usedPairs.includes(r.pairId) ? [r.pairId] : [...this.usedPairs, r.pairId];
    } else if (mode === "mafia") {
      const r = createMafiaRound(participants, this.config.mafiaRoles);
      if (!r) return;
      this.mafiaRound = r;
    } else if (mode === "blef") {
      const r = createBlefRound(participants, this.config.categories, this.usedWords);
      if (!r) return;
      this.blefRound = r;
      this.usedWords = this.usedWords.includes(r.word) ? [r.word] : [...this.usedWords, r.word];
    } else {
      const r = createFakerRound(participants, this.config.fakerCategories, this.usedQuestions);
      if (!r) return;
      this.fakerRound = r;
      this.usedQuestions = this.usedQuestions.includes(r.questionId)
        ? [r.questionId]
        : [...this.usedQuestions, r.questionId];
    }

    this.answers = {};
    this.votes = {};
    this.cards = {};
    this.state.mode = mode;
    // Faker starts straight at its question; the others deal cards first.
    this.state.phase = mode === "faker" ? "question" : "cards";
    this.state.readyIds = [];
    this.state.answeredIds = [];
    this.state.votedIds = [];
    this.state.firstPlayerId = null;
    this.state.answers = null;
    this.state.mainQuestion = null;
    this.state.answersShown = false;
    this.state.results = null;
    this.emit();

    // Private cards — each phone only ever receives its own.
    for (const p of this.inRoundPlayers) {
      const card = this.buildCard(p.id);
      this.cards[p.id] = card;
      if (p.id === this.myId) {
        this.events.onCard(card);
      } else {
        const peer = this.playerToPeer.get(p.id);
        if (peer) this.transport.send(peer, { type: "CARD", card } satisfies HostMsg);
      }
    }
  }

  private impRole(playerId: string): RoleDef {
    const roleId = this.round?.assignments[playerId]?.roleId;
    return this.config.roles.find((r) => r.id === roleId) ?? CIVILIAN;
  }

  private mafiaRole(playerId: string): RoleDef {
    const roleId = this.mafiaRound?.assignments[playerId];
    return this.config.mafiaRoles.find((r) => r.id === roleId) ?? MAFIA_CIVILIAN;
  }

  private buildCard(playerId: string): NetCard {
    const mode = this.state.mode;
    if (mode === "imp" && this.round) {
      const role = this.impRole(playerId);
      const hint = this.round.assignments[playerId]?.hint;
      const imposters = this.inRoundPlayers
        .filter((p) => this.impRole(p.id).kind === "imposter")
        .map((p) => p.name);
      return {
        mode,
        roleName: roleName(role),
        roleDesc: roleDesc(role),
        roleColor: role.color,
        valueKind: role.knowsWord ? "word" : "hint",
        value: role.knowsWord ? this.round.word : hint ?? "",
        extraKind: role.kind === "helper" || role.seesImposter ? "imposter" : undefined,
        extraNames: role.kind === "helper" || role.seesImposter ? imposters : undefined,
      };
    }
    if (mode === "odd" && this.oddRound) {
      return {
        mode,
        valueKind: "oddWord",
        value: playerId === this.oddRound.oddPlayerId ? this.oddRound.oddWord : this.oddRound.mainWord,
      };
    }
    if (mode === "mafia" && this.mafiaRound) {
      const role = this.mafiaRole(playerId);
      return {
        mode,
        roleName: roleName(role),
        roleDesc: roleDesc(role),
        roleColor: role.color,
      };
    }
    if (mode === "blef" && this.blefRound) {
      return {
        mode,
        valueKind: "clue",
        value: this.blefRound.clues[playerId]?.text ?? "",
      };
    }
    if (mode === "faker" && this.fakerRound) {
      return {
        mode,
        question:
          playerId === this.fakerRound.oddPlayerId
            ? this.fakerRound.oddQuestion
            : this.fakerRound.mainQuestion,
      };
    }
    return { mode };
  }

  // ---- results ----

  private tally(): { counts: Record<string, number>; votedOutId: string | null } {
    const counts: Record<string, number> = {};
    for (const choice of Object.values(this.votes)) {
      counts[choice] = (counts[choice] ?? 0) + 1;
    }
    const max = Math.max(0, ...Object.values(counts));
    const top = max === 0 ? [] : Object.keys(counts).filter((id) => counts[id] === max);
    return { counts, votedOutId: top.length === 1 ? top[0] : null };
  }

  private buildResults(): NetResults {
    const mode = this.state.mode;
    const { counts, votedOutId } = this.tally();
    const base: NetResults = { mode, counts, votedOutId, targetId: null, outcome: "none" };

    if (mode === "imp" && this.round) {
      const roles: NetRoleInfo[] = this.inRoundPlayers.map((p) => {
        const role = this.impRole(p.id);
        return {
          playerId: p.id,
          roleName: roleName(role),
          roleColor: role.color,
          kind: role.kind,
          evil: role.kind === "imposter",
        };
      });
      const imposters = roles.filter((r) => r.kind === "imposter");
      const votedRole = roles.find((r) => r.playerId === votedOutId);
      const outcome =
        votedOutId === null
          ? "tie"
          : votedRole?.kind === "jester"
            ? "jester"
            : votedRole?.kind === "imposter"
              ? "caught"
              : "escaped";
      return {
        ...base,
        roles,
        targetId: imposters[0]?.playerId ?? null,
        word: this.round.word,
        outcome,
      };
    }

    if (mode === "odd" && this.oddRound) {
      return {
        ...base,
        targetId: this.oddRound.oddPlayerId,
        mainWord: this.oddRound.mainWord,
        oddWord: this.oddRound.oddWord,
        outcome:
          votedOutId === null
            ? "tie"
            : votedOutId === this.oddRound.oddPlayerId
              ? "caught"
              : "escaped",
      };
    }

    if (mode === "mafia" && this.mafiaRound) {
      const roles: NetRoleInfo[] = this.inRoundPlayers.map((p) => {
        const role = this.mafiaRole(p.id);
        return {
          playerId: p.id,
          roleName: roleName(role),
          roleColor: role.color,
          kind: role.kind,
          evil: role.evil === true || role.kind === "mafia",
        };
      });
      return { ...base, roles };
    }

    if (mode === "blef" && this.blefRound) {
      const clues = this.inRoundPlayers.map((p) => ({
        playerId: p.id,
        text: this.blefRound?.clues[p.id]?.text ?? "",
        isWord: this.blefRound?.clues[p.id]?.isWord ?? false,
      }));
      const guesses: Record<string, "word" | "hint"> = {};
      for (const [voter, choice] of Object.entries(this.votes)) {
        if (choice === "word" || choice === "hint") guesses[voter] = choice;
      }
      return { ...base, word: this.blefRound.word, clues, guesses, votedOutId: null };
    }

    if (mode === "faker" && this.fakerRound) {
      return {
        ...base,
        targetId: this.fakerRound.oddPlayerId,
        mainQuestion: this.fakerRound.mainQuestion,
        oddQuestion: this.fakerRound.oddQuestion,
        outcome:
          votedOutId === null
            ? "tie"
            : votedOutId === this.fakerRound.oddPlayerId
              ? "caught"
              : "escaped",
      };
    }

    return base;
  }

  // ---- plumbing ----

  private emit(): void {
    this.transport.send("all", { type: "STATE", state: this.state } satisfies HostMsg);
    this.events.onState({ ...this.state, players: [...this.state.players] });
  }

  myCard(): NetCard | null {
    return this.cards[this.myId] ?? null;
  }

  close(): void {
    if (this.hbTimer) clearInterval(this.hbTimer);
    this.transport.close();
  }
}

export class RoomClient {
  state: RoomState | null = null;
  card: NetCard | null = null;
  myId: string | null = null;
  private transport: Transport;
  private events: RoomEvents;
  private lastHostSeen = Date.now();
  private hbTimer: ReturnType<typeof setInterval> | null = null;
  private closed = false;

  constructor(transport: Transport, events: RoomEvents, myName: string, myColor: string) {
    this.transport = transport;
    this.events = events;

    transport.onMessage((_from, raw) => {
      const msg = raw as HostMsg;
      this.lastHostSeen = Date.now();
      if (!msg || typeof msg !== "object") return;
      if (msg.type === "WELCOME") {
        this.myId = msg.playerId;
      } else if (msg.type === "STATE") {
        this.state = msg.state;
        // A fresh lobby/round clears whatever card we were holding.
        if (msg.state.phase === "lobby") {
          this.card = null;
          this.events.onCard(null);
        }
        this.events.onState(msg.state);
      } else if (msg.type === "CARD") {
        this.card = msg.card;
        this.events.onCard(msg.card);
      } else if (msg.type === "KICKED") {
        this.closed = true;
        if (this.hbTimer) clearInterval(this.hbTimer);
        this.transport.close();
        this.events.onKicked?.();
      } else if (msg.type === "HB") {
        this.transport.send("host", { type: "HB" } satisfies ClientMsg);
      }
    });
    transport.onPeerLeave(() => this.hostLost());

    this.hbTimer = setInterval(() => {
      if (Date.now() - this.lastHostSeen > HEARTBEAT_TIMEOUT_MS) this.hostLost();
    }, HEARTBEAT_MS);

    transport.send("host", { type: "JOIN", name: myName, color: myColor } satisfies ClientMsg);
  }

  private hostLost(): void {
    if (this.closed) return;
    this.closed = true;
    if (this.hbTimer) clearInterval(this.hbTimer);
    this.transport.close();
    this.events.onHostLost?.();
  }

  ready(): void {
    this.transport.send("host", { type: "READY" } satisfies ClientMsg);
  }
  answer(text: string): void {
    this.transport.send("host", { type: "ANSWER", text } satisfies ClientMsg);
  }
  vote(choice: string): void {
    this.transport.send("host", { type: "VOTE", choice } satisfies ClientMsg);
  }
  leave(): void {
    this.transport.send("host", { type: "LEAVE" } satisfies ClientMsg);
    this.close();
  }
  close(): void {
    this.closed = true;
    if (this.hbTimer) clearInterval(this.hbTimer);
    this.transport.close();
  }
}
