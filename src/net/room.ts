// Host-authoritative room logic for local multiplayer. The host owns the
// whole game state and every random draw; clients just render the latest
// STATE plus the private CARD the host dealt them.
// Everything speaks through the Transport interface — no sockets here.

import { createBlefRound } from "../game/blefEngine";
import { createRound } from "../game/engine";
import { createFakerRound } from "../game/fakerEngine";
import { createMafiaRound } from "../game/mafiaEngine";
import {
  createSkalaGame,
  createSkalaRound,
  scoreSkalaRound,
  skalaIsOver,
} from "../game/skalaEngine";
import { createSyncGame, resolveSyncRound, syncTargets, syncWordTaken } from "../game/syncEngine";
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
  SkalaGame,
  SkalaRound,
  SpectrumCategoryState,
  SyncGame,
  skalaPoints,
} from "../game/types";
import { roleDesc, roleName } from "../i18n";
import { freeColor } from "../theme";
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
  NetSettings,
  RoomState,
  EJECT_TOTAL_MS,
  TOUR_MODES,
  TOUR_VOTE_MS,
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
  spectrumCategories: SpectrumCategoryState[];
  // How many clues each player gives in a Skala game.
  skalaTurns: number;
  // Which modes a tournament may deal. Empty means all of them.
  tournamentModes: GameMode[];
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
  private skalaGame: SkalaGame | null = null;
  private skalaRound: SkalaRound | null = null;
  private syncGame: SyncGame | null = null;

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
  private ejectTimer: ReturnType<typeof setTimeout> | null = null;
  private tourTimer: ReturnType<typeof setTimeout> | null = null;
  private nextJoin = 1;

  constructor(
    transport: Transport,
    events: RoomEvents,
    hostName: string,
    hostColor: string,
    config: HostConfig,
    code: string,
    roomId: string,
    settings: NetSettings = { language: "en", timerEnabled: false, timerSeconds: 120 }
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
      phaseAt: Date.now(),
      settings,
      voteMap: null,
      answers: null,
      mainQuestion: null,
      answersShown: false,
      skala: null,
      sync: null,
      tournament: null,
      results: null,
    };

    transport.onMessage((from, raw) => this.handle(from, raw as ClientMsg));
    transport.onPeerLeave((peer) => this.dropPeer(peer));
    transport.onPeerJoin(() => {
      // Wait for their JOIN message before adding them to the room.
    });

    // Only raw sockets need pinging; the relay reports leaves itself.
    if (transport.needsHeartbeat) {
      this.hbTimer = setInterval(() => {
        this.transport.send("all", { type: "HB" } satisfies HostMsg);
        const now = Date.now();
        for (const [peer, seen] of [...this.lastSeen]) {
          if (now - seen > HEARTBEAT_TIMEOUT_MS) this.dropPeer(peer);
        }
      }, HEARTBEAT_MS);
    }

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

  // Two players in one room never share a colour — whoever asks second
  // gets the next free one.
  // Everyone still holding a seat counts, connected or not — a player
  // who is away for a minute must not come back to find somebody else
  // wearing their colour.
  private uniqueColor(wanted: string): string {
    const taken = this.state.players.map((p) => p.color);
    const free = !taken.some((c) => c.toUpperCase() === wanted.toUpperCase());
    return free ? wanted : freeColor(taken);
  }

  private uniqueName(name: string): string {
    const base = name.trim().slice(0, 18) || "?";
    let candidate = base;
    let n = 2;
    while (this.state.players.some((p) => p.name === candidate)) {
      candidate = `${base} ${n++}`;
    }
    return candidate;
  }

  // ---- incoming ----

  private handle(peer: string, msg: ClientMsg): void {
    this.lastSeen.set(peer, Date.now());
    if (!msg || typeof msg !== "object") return;

    if (msg.type === "JOIN") {
      // A phone that slept, lost signal or was killed and reopened comes
      // back with the same peer id (it is their anonymous account), so if
      // we are still holding a seat for it, give that seat back rather
      // than seating them again as somebody new. That is what keeps a
      // tournament score — the scores are keyed by player id.
      const held = this.peerToPlayer.get(peer);
      if (held) {
        const seat = this.player(held);
        if (seat && !seat.connected) {
          seat.connected = true;
          this.playerToPeer.set(held, peer);
          // Mid-round they wait in the wings, exactly like a new joiner.
          seat.inRound = this.state.phase === "lobby";
          this.transport.send(peer, { type: "WELCOME", playerId: held } satisfies HostMsg);
          this.emit();
        }
        // Already connected: a duplicate JOIN, nothing to do.
        return;
      }
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
        color: this.uniqueColor(msg.color),
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
      case "COLOR":
        this.changeColor(playerId, msg.color);
        break;
      case "ANSWER":
        this.submitAnswer(playerId, msg.text);
        break;
      case "GUESS":
        this.submitGuess(playerId, msg.value);
        break;
      case "VOTE":
        this.submitVote(playerId, msg.choice);
        break;
      case "LEAVE":
        this.dropPeer(peer, true);
        break;
      case "HB":
        break;
    }
  }

  // `deliberate` means they pressed leave. Anything else — a sleeping
  // phone, a dead battery, a tunnel — is treated as "back in a minute".
  private dropPeer(peer: string, deliberate = false): void {
    const playerId = this.peerToPlayer.get(peer);
    this.lastSeen.delete(peer);
    if (!playerId) {
      this.peerToPlayer.delete(peer);
      return;
    }
    this.playerToPeer.delete(playerId);

    // Keep their seat while there is something to come back to: a game in
    // progress, or a tournament they have points in. In a plain lobby
    // there is nothing to lose, so they just go.
    const holdSeat =
      !deliberate && (this.state.phase !== "lobby" || this.state.tournament !== null);

    if (holdSeat) {
      const seat = this.player(playerId);
      if (seat) {
        seat.connected = false;
        seat.inRound = false;
      }
      // peerToPlayer is deliberately left alone: it is the only thing
      // that can recognise them when they come back.
    } else {
      this.peerToPlayer.delete(peer);
      this.state.players = this.state.players.filter((p) => p.id !== playerId);
    }

    this.state.readyIds = this.state.readyIds.filter((id) => id !== playerId);
    this.state.answeredIds = this.state.answeredIds.filter((id) => id !== playerId);
    this.state.votedIds = this.state.votedIds.filter((id) => id !== playerId);
    this.emit();
    // Losing a player can be the thing that completes a phase — the room
    // may have been waiting on precisely them.
    this.recheckPhase();
  }

  // Every phase that waits for "everyone" is only ever re-checked when a
  // message arrives. So when the last player anybody is waiting on walks
  // out of signal, no message ever arrives, and the round sits there for
  // good — the one person who could unstick it is the one who left. Any
  // time the set of players in the round shrinks, ask again.
  private recheckPhase(): void {
    const waitingOn = this.inRoundPlayers;
    if (waitingOn.length === 0) return;

    switch (this.state.phase) {
      case "cards":
        if (this.state.readyIds.length >= waitingOn.length) this.continueFromCards();
        break;
      case "vote":
        if (this.state.votedIds.length >= waitingOn.length) this.showEjection();
        break;
      case "skalaGuess": {
        const round = this.skalaRound;
        if (!round) break;
        const guessers = waitingOn.filter((x) => x.id !== round.clueGiverId);
        if (guessers.length > 0 && guessers.every((x) => round.guesses[x.id] !== undefined)) {
          this.revealSkala();
        }
        break;
      }
      case "syncWrite":
        if (this.syncGame && waitingOn.every((x) => this.answers[x.id])) this.revealSync();
        break;
      case "tourVote": {
        const tour = this.state.tournament;
        if (tour && Object.keys(tour.votes).length >= waitingOn.length) {
          if (this.tourTimer) clearTimeout(this.tourTimer);
          this.tourTimer = null;
          this.closeModeVote();
        }
        break;
      }
    }
  }

  // Seats held for players who never came back are cleared whenever the
  // room settles into a lobby with nothing running, so they do not pile
  // up across games.
  private releaseHeldSeats(): void {
    const gone = this.state.players.filter((p) => !p.connected).map((p) => p.id);
    if (gone.length === 0) return;
    this.state.players = this.state.players.filter((p) => p.connected);
    for (const [peer, playerId] of [...this.peerToPlayer]) {
      if (gone.includes(playerId)) this.peerToPlayer.delete(peer);
    }
  }

  // ---- player actions (the host is a player too, and calls these directly) ----

  markReady(playerId: string): void {
    if (this.state.phase !== "cards") return;
    const p = this.player(playerId);
    if (!p?.inRound) return;
    if (!this.state.readyIds.includes(playerId)) this.state.readyIds.push(playerId);
    // Nobody has to press anything: the last card closes the phase.
    if (this.state.readyIds.length >= this.inRoundPlayers.length) {
      this.continueFromCards();
      return;
    }
    this.emit();
  }

  // Players pick their own colour in the lobby; two of them can never
  // end up with the same one.
  changeColor(playerId: string, color: string): void {
    if (this.state.phase !== "lobby") return;
    const player = this.player(playerId);
    if (!player) return;
    const taken = this.state.players
      .filter((p) => p.connected && p.id !== playerId)
      .map((c) => c.color.toUpperCase());
    if (taken.includes(color.toUpperCase())) return;
    player.color = color;
    this.emit();
  }

  submitAnswer(playerId: string, text: string): void {
    const p = this.player(playerId);
    if (!p?.inRound) return;
    const clean = text.trim().slice(0, ANSWER_MAX);
    if (!clean) return;

    // Skala: only the caller may set the clue, and it moves the room on.
    if (this.state.phase === "skalaClue") {
      if (!this.skalaRound || playerId !== this.skalaRound.clueGiverId) return;
      this.skalaRound = { ...this.skalaRound, clue: clean };
      if (this.state.skala) this.state.skala.clue = clean;
      this.setPhase("skalaGuess");
      this.state.answeredIds = [];
      this.emit();
      return;
    }

    // Uskladi se: everybody writes, nothing is shown until the last one.
    if (this.state.phase === "syncWrite") {
      if (!this.syncGame) return;
      // Only words from earlier rounds are off limits. Two players landing
      // on the same word this round is the whole point of the game.
      if (syncWordTaken(this.syncGame, clean)) return;
      this.answers[playerId] = clean;
      if (!this.state.answeredIds.includes(playerId)) this.state.answeredIds.push(playerId);
      if (this.inRoundPlayers.every((x) => this.answers[x.id])) this.revealSync();
      else this.emit();
      return;
    }

    if (this.state.phase !== "question") return;
    this.answers[playerId] = clean;
    if (!this.state.answeredIds.includes(playerId)) this.state.answeredIds.push(playerId);
    this.emit();
  }

  // Skala: everyone but the caller turns a dial.
  submitGuess(playerId: string, value: number): void {
    const p = this.player(playerId);
    if (this.state.phase !== "skalaGuess" || !p?.inRound) return;
    if (!this.skalaRound || playerId === this.skalaRound.clueGiverId) return;

    const v = Math.max(0, Math.min(100, Math.round(value)));
    this.skalaRound = { ...this.skalaRound, guesses: { ...this.skalaRound.guesses, [playerId]: v } };
    if (this.state.skala) this.state.skala.guesses = { ...this.skalaRound.guesses };
    if (!this.state.answeredIds.includes(playerId)) this.state.answeredIds.push(playerId);

    const guessers = this.inRoundPlayers.filter((x) => x.id !== this.skalaRound!.clueGiverId);
    if (guessers.every((x) => this.skalaRound!.guesses[x.id] !== undefined)) this.revealSkala();
    else this.emit();
  }

  // The board opens: the target and everyone's markers go into the state
  // that every phone can see, along with what the round was worth.
  private revealSkala(): void {
    if (!this.skalaGame || !this.skalaRound || !this.state.skala) return;
    const round = this.skalaRound;
    const points: Record<string, number> = {};
    for (const [id, g] of Object.entries(round.guesses)) points[id] = skalaPoints(g, round.target);

    const scored = scoreSkalaRound(this.skalaGame, round);
    this.skalaGame = scored;
    this.state.skala = {
      ...this.state.skala,
      target: round.target,
      guesses: { ...round.guesses },
      roundPoints: points,
      scores: { ...scored.scores },
    };
    this.setPhase("skalaReveal");
    this.emit();
  }

  // Host taps on: next caller, or the final table.
  nextSkalaRound(): void {
    if (this.state.phase !== "skalaReveal" || !this.skalaGame) return;
    if (skalaIsOver(this.skalaGame)) {
      this.setPhase("results");
      this.emit();
      return;
    }
    this.dealSkalaRound();
  }

  private dealSkalaRound(): void {
    if (!this.skalaGame) return;
    const round = createSkalaRound(this.skalaGame, this.config.spectrumCategories);
    if (!round) {
      this.setPhase("results");
      this.emit();
      return;
    }
    this.skalaRound = round;
    this.answers = {};
    this.state.answeredIds = [];
    this.state.skala = {
      left: round.left,
      right: round.right,
      clueGiverId: round.clueGiverId,
      clue: null,
      target: null,
      guesses: {},
      scores: { ...this.skalaGame.scores },
      roundPoints: null,
      roundIndex: this.skalaGame.roundIndex,
      totalRounds: this.skalaGame.order.length,
    };
    // Only the caller is dealt the secret point.
    this.cards = {};
    this.cards[round.clueGiverId] = {
      mode: "skala",
      target: round.target,
      left: round.left,
      right: round.right,
    };
    this.setPhase("skalaClue");
    this.emit();
    const peer = this.playerToPeer.get(round.clueGiverId);
    if (peer) {
      this.transport.send(peer, {
        type: "CARD",
        card: this.cards[round.clueGiverId],
      } satisfies HostMsg);
    } else if (round.clueGiverId === this.myId) {
      this.events.onCard(this.cards[this.myId]);
    }
  }

  // Uskladi se: the words turn over together.
  private revealSync(): void {
    if (!this.syncGame) return;
    const resolved = resolveSyncRound(this.syncGame, { ...this.answers });
    this.syncGame = resolved;
    this.state.sync = {
      seed: resolved.seed,
      targets: syncTargets(resolved),
      roundNo: resolved.history.length,
      words: { ...this.answers },
      winners: resolved.winners,
      matchedWord: resolved.matchedWord,
    };
    this.setPhase("syncReveal");
    this.emit();
  }

  // Nobody matched — go round again. If they did, this ends the game.
  nextSyncRound(): void {
    if (this.state.phase !== "syncReveal" || !this.syncGame) return;
    if (this.syncGame.winners) {
      this.setPhase("results");
      this.emit();
      return;
    }
    this.answers = {};
    this.state.answeredIds = [];
    this.state.sync = {
      seed: this.syncGame.seed,
      targets: syncTargets(this.syncGame),
      roundNo: this.syncGame.history.length + 1,
      words: null,
      winners: null,
      matchedWord: null,
    };
    this.setPhase("syncWrite");
    this.emit();
  }

  // The players agreed two different-looking words meant the same thing.
  acceptSyncMatch(playerIds: string[], word: string): void {
    if (this.state.phase !== "syncReveal" || !this.syncGame) return;
    this.syncGame = { ...this.syncGame, winners: playerIds, matchedWord: word };
    if (this.state.sync) {
      this.state.sync = { ...this.state.sync, winners: playerIds, matchedWord: word };
    }
    this.emit();
  }

  submitVote(playerId: string, choice: string): void {
    // During a tournament vote the choice is a gamemode, not a player.
    if (this.state.phase === "tourVote") {
      this.submitModeVote(playerId, choice as GameMode);
      return;
    }
    const p = this.player(playerId);
    if (this.state.phase !== "vote" || !p?.inRound) return;
    // Blef votes "word"/"hint"; every other mode votes for a player.
    if (this.state.mode !== "blef" && playerId === choice) return;
    this.votes[playerId] = choice;
    if (!this.state.votedIds.includes(playerId)) this.state.votedIds.push(playerId);
    if (this.state.votedIds.length >= this.inRoundPlayers.length) {
      this.showEjection();
      return;
    }
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

  setSettings(settings: NetSettings): void {
    this.state.settings = settings;
    this.emit();
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
    this.state.readyIds = this.state.readyIds.filter((id) => id !== playerId);
    this.state.answeredIds = this.state.answeredIds.filter((id) => id !== playerId);
    this.state.votedIds = this.state.votedIds.filter((id) => id !== playerId);
    this.emit();
    // Throwing someone out can complete a phase too.
    this.recheckPhase();
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
    if (mode === "skala") {
      const pool = this.config.spectrumCategories
        .filter((c) => c.enabled)
        .flatMap((c) => c.spectrums);
      if (pool.length === 0) return "content";
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
    this.setPhase("lobby");
    // Nothing left to come back to unless a tournament is still running,
    // so anyone who never returned gives their seat up here.
    if (!this.state.tournament) this.releaseHeldSeats();
    this.state.readyIds = [];
    this.state.answeredIds = [];
    this.state.votedIds = [];
    this.state.answers = null;
    this.state.mainQuestion = null;
    this.state.answersShown = false;
    this.state.results = null;
    this.state.voteMap = null;
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
        this.setPhase("playing");
    } else {
      const list = this.inRoundPlayers;
      this.state.firstPlayerId = list.length
        ? list[Math.floor(Math.random() * list.length)].id
        : null;
      this.setPhase("discuss");
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
    this.setPhase("answers");
    this.emit();
  }

  showAnswers(): void {
    if (this.state.phase !== "answers") return;
    this.state.answersShown = true;
    this.emit();
  }

  startVote(): void {
    if (this.state.phase !== "discuss" && this.state.phase !== "answers") return;
    this.setPhase("vote");
    this.state.votedIds = [];
    this.votes = {};
    this.emit();
  }

  // Voting is over: show who got the votes, hold, then the full results.
  showEjection(): void {
    if (this.state.phase !== "vote") return;
    this.state.results = this.buildResults();
    this.state.voteMap = { ...this.votes };

    // Blef has nobody to eject — the calls are about the other player's
    // card, not about who leaves — so it goes straight to the reveal
    // instead of sitting on an empty tally board.
    if (this.state.mode === "blef") {
      this.setPhase("results");
      this.emit();
      return;
    }

    this.setPhase("eject");
    this.emit();
    if (this.ejectTimer) clearTimeout(this.ejectTimer);
    this.ejectTimer = setTimeout(() => {
      this.ejectTimer = null;
      if (this.state.phase !== "eject") return;
      this.setPhase("results");
      this.emit();
    }, EJECT_TOTAL_MS);
  }

  revealResults(): void {
    if (this.state.phase === "vote") {
      this.showEjection();
      return;
    }
    if (this.state.phase !== "playing") return;
    this.state.results = this.buildResults();
    this.setPhase("results");
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
    this.skalaGame = null;
    this.skalaRound = null;
    this.syncGame = null;
    this.state.skala = null;
    this.state.sync = null;

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
    } else if (mode === "skala") {
      const g = createSkalaGame(participants, this.config.skalaTurns);
      if (!g) return;
      this.skalaGame = g;
    } else if (mode === "sync") {
      const g = createSyncGame(participants, this.config.categories);
      if (!g) return;
      this.syncGame = g;
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
    // Faker starts straight at its question; Skala and Uskladi se open
    // with their own first beat; the others deal cards first.
    this.setPhase(
      mode === "faker"
        ? "question"
        : mode === "skala"
          ? "skalaClue"
          : mode === "sync"
            ? "syncWrite"
            : "cards"
    );
    this.state.readyIds = [];
    this.state.answeredIds = [];
    this.state.votedIds = [];
    this.state.firstPlayerId = null;
    this.state.answers = null;
    this.state.mainQuestion = null;
    this.state.answersShown = false;
    this.state.results = null;
    this.state.voteMap = null;

    // Skala and Uskladi se do not deal a card to everybody — Skala hands
    // the secret point to the caller alone, and Uskladi se has no secret
    // at all — so they set their own board up and stop here.
    if (mode === "skala") {
      this.dealSkalaRound();
      return;
    }
    if (mode === "sync" && this.syncGame) {
      this.state.sync = {
        seed: this.syncGame.seed,
        targets: syncTargets(this.syncGame),
        roundNo: 1,
        words: null,
        winners: null,
        matchedWord: null,
      };
      this.emit();
      return;
    }

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
      const clue = this.blefRound.clues[playerId];
      return {
        mode,
        valueKind: clue?.isWord ? "blefWord" : "blefHint",
        value: clue?.text ?? "",
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

  // ---- tournament ----

  // Which modes this room can actually deal right now. Blef is a duel, so
  // it only shows up in a two-player room; the group modes need three.
  private tournamentPool(): GameMode[] {
    const n = this.connectedPlayers.length;
    const allowed = this.config.tournamentModes;
    return TOUR_MODES.filter((m) => {
      if (allowed.length > 0 && !allowed.includes(m)) return false;
      if (m === "blef") return n === 2;
      if (m === "skala" || m === "sync") return n >= 2;
      return n >= 3;
    });
  }

  startTournament(target: number): void {
    if (this.state.phase !== "lobby") return;
    const pool = this.tournamentPool();
    if (pool.length === 0) return;
    for (const p of this.state.players) if (p.connected) p.inRound = true;
    this.state.tournament = {
      target,
      scores: Object.fromEntries(this.inRoundPlayers.map((p) => [p.id, 0])),
      options: [],
      votes: {},
      closesAt: 0,
      gameNo: 0,
      lastAward: null,
      lastMode: null,
      winners: null,
    };
    this.openModeVote();
  }

  // Three modes on the table and five seconds on the clock. Everybody
  // votes at once and the room watches the dots pile up.
  private openModeVote(): void {
    const tour = this.state.tournament;
    if (!tour) return;
    const shuffled = [...this.tournamentPool()].sort(() => Math.random() - 0.5);
    this.state.tournament = {
      ...tour,
      options: shuffled.slice(0, Math.min(3, shuffled.length)),
      votes: {},
      closesAt: Date.now() + TOUR_VOTE_MS,
      lastAward: null,
    };
    this.setPhase("tourVote");
    this.emit();

    if (this.tourTimer) clearTimeout(this.tourTimer);
    this.tourTimer = setTimeout(() => {
      this.tourTimer = null;
      this.closeModeVote();
    }, TOUR_VOTE_MS + 250);
  }

  private closeModeVote(): void {
    const tour = this.state.tournament;
    if (!tour || this.state.phase !== "tourVote") return;

    const counts = new Map<GameMode, number>();
    for (const mode of Object.values(tour.votes)) {
      counts.set(mode, (counts.get(mode) ?? 0) + 1);
    }
    let best = tour.options[0];
    let bestN = -1;
    // Ties break at random so a draw does not always go the same way.
    for (const mode of [...tour.options].sort(() => Math.random() - 0.5)) {
      const n = counts.get(mode) ?? 0;
      if (n > bestN) {
        best = mode;
        bestN = n;
      }
    }

    this.state.tournament = { ...tour, gameNo: tour.gameNo + 1 };
    this.config = { ...this.config, mode: best };
    this.state.mode = best;
    this.beginRound();
  }

  submitModeVote(playerId: string, mode: GameMode): void {
    const tour = this.state.tournament;
    if (!tour || this.state.phase !== "tourVote") return;
    if (!tour.options.includes(mode)) return;
    if (!this.player(playerId)?.inRound) return;
    this.state.tournament = { ...tour, votes: { ...tour.votes, [playerId]: mode } };
    this.emit();
    // Everybody in early? Get on with it.
    if (Object.keys(this.state.tournament.votes).length >= this.inRoundPlayers.length) {
      if (this.tourTimer) clearTimeout(this.tourTimer);
      this.tourTimer = null;
      this.closeModeVote();
    }
  }

  // What the game that just finished was worth. The losing side scores
  // nothing; a hidden player who got away with it scores double.
  private awardPoints(): Record<string, number> {
    const award: Record<string, number> = {};
    const add = (id: string, n: number) => {
      award[id] = (award[id] ?? 0) + n;
    };
    const mode = this.state.mode;
    const results = this.state.results;

    if (mode === "skala" && this.state.skala) {
      const scores = this.state.skala.scores;
      const best = Math.max(0, ...Object.values(scores));
      for (const [id, v] of Object.entries(scores)) if (v === best && best > 0) add(id, 2);
      return award;
    }
    if (mode === "sync" && this.state.sync?.winners) {
      for (const id of this.state.sync.winners) add(id, 2);
      return award;
    }
    if (!results) return award;

    if (mode === "blef") {
      // Each duellist scores for calling the other one right.
      for (const p of this.inRoundPlayers) {
        const other = this.inRoundPlayers.find((x) => x.id !== p.id);
        const clue = results.clues?.find((c) => c.playerId === other?.id);
        const guess = results.guesses?.[p.id];
        if (clue && guess && (guess === "word") === clue.isWord) add(p.id, 2);
      }
      return award;
    }

    const caught = results.outcome === "caught";
    if (mode === "imp") {
      if (results.outcome === "jester") {
        if (results.votedOutId) add(results.votedOutId, 2);
        return award;
      }
      const roles = results.roles ?? [];
      const imposters = roles.filter((r) => r.kind === "imposter").map((r) => r.playerId);
      if (caught) {
        for (const p of this.inRoundPlayers) if (!imposters.includes(p.id)) add(p.id, 1);
      } else {
        for (const id of imposters) add(id, 2);
      }
      return award;
    }

    // Odd One Out and Faker share a shape: one hidden player against the room.
    const hidden = results.targetId;
    if (caught) {
      for (const p of this.inRoundPlayers) if (p.id !== hidden) add(p.id, 1);
    } else if (hidden) {
      add(hidden, 2);
    }
    return award;
  }

  // The host presses on from a finished game: points land, standings show.
  tournamentContinue(): void {
    const tour = this.state.tournament;
    if (!tour || this.state.phase !== "results") return;

    const award = this.awardPoints();
    const scores = { ...tour.scores };
    for (const [id, n] of Object.entries(award)) scores[id] = (scores[id] ?? 0) + n;

    const best = Math.max(0, ...Object.values(scores));
    const winners =
      best >= tour.target
        ? Object.entries(scores)
            .filter(([, v]) => v === best)
            .map(([id]) => id)
        : null;

    this.state.tournament = {
      ...tour,
      scores,
      lastAward: award,
      lastMode: this.state.mode,
      winners,
    };
    this.setPhase("tourTable");
    this.emit();
  }

  // From the standings: the next vote, or back to the lobby once it is won.
  tournamentNext(): void {
    const tour = this.state.tournament;
    if (!tour || this.state.phase !== "tourTable") return;
    if (tour.winners) {
      this.state.tournament = null;
      this.setPhase("lobby");
      this.emit();
      return;
    }
    for (const p of this.state.players) if (p.connected) p.inRound = true;
    this.openModeVote();
  }

  private setPhase(phase: RoomState["phase"]): void {
    this.state.phase = phase;
    this.state.phaseAt = Date.now();
  }

  private emit(): void {
    this.transport.send("all", { type: "STATE", state: this.state } satisfies HostMsg);
    this.events.onState({ ...this.state, players: [...this.state.players] });
  }

  myCard(): NetCard | null {
    return this.cards[this.myId] ?? null;
  }

  close(): void {
    if (this.tourTimer) clearTimeout(this.tourTimer);
    if (this.hbTimer) clearInterval(this.hbTimer);
    if (this.ejectTimer) clearTimeout(this.ejectTimer);
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
  private ejectTimer: ReturnType<typeof setTimeout> | null = null;
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

    if (transport.needsHeartbeat) {
      this.hbTimer = setInterval(() => {
        if (Date.now() - this.lastHostSeen > HEARTBEAT_TIMEOUT_MS) this.hostLost();
      }, HEARTBEAT_MS);
    }

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
  color(color: string): void {
    this.transport.send("host", { type: "COLOR", color } satisfies ClientMsg);
  }
  answer(text: string): void {
    this.transport.send("host", { type: "ANSWER", text } satisfies ClientMsg);
  }
  vote(choice: string): void {
    this.transport.send("host", { type: "VOTE", choice } satisfies ClientMsg);
  }

  guess(value: number): void {
    this.transport.send("host", { type: "GUESS", value } satisfies ClientMsg);
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
