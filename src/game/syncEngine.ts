import { activeWordPool } from "./engine";
import { CategoryState, Player, SyncGame, SyncRound, wordKey } from "./types";

// Uskladi se needs two people to have any chance of matching, and works
// all the way up — with a big group it becomes a race to be the first
// pair on the same wavelength.
export const SYNC_MIN_PLAYERS = 2;
// After this many rounds the group is offered a way out.
export const SYNC_MAX_ROUNDS = 10;

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

// The seed comes from whichever word categories are switched on — the
// same lists IMP Classic uses. Only the word itself matters here; the
// imposter hints are irrelevant.
export function createSyncGame(
  players: Player[],
  categories: CategoryState[]
): SyncGame | null {
  if (players.length < SYNC_MIN_PLAYERS) return null;
  const words = activeWordPool(categories).map((w) => w.word);
  if (words.length === 0) return null;

  const seed = pickRandom(words);
  return {
    seed,
    history: [],
    used: [wordKey(seed)],
    winners: null,
    matchedWord: null,
  };
}

// A word can't be used twice by anyone — without that rule the whole
// game collapses, because repeating your own last word matches instantly.
export function syncWordTaken(game: SyncGame, word: string): boolean {
  return game.used.includes(wordKey(word));
}

// Groups the round's words by their normalised form and returns every
// player who shares a word with somebody else.
export function syncMatches(words: Record<string, string>): {
  winners: string[];
  word: string;
} | null {
  const byWord = new Map<string, string[]>();
  for (const [playerId, raw] of Object.entries(words)) {
    const key = wordKey(raw);
    if (!key) continue;
    byWord.set(key, [...(byWord.get(key) ?? []), playerId]);
  }

  for (const [, playerIds] of byWord) {
    if (playerIds.length >= 2) {
      // Report the word as it was actually typed by the first of them.
      return { winners: playerIds, word: words[playerIds[0]] };
    }
  }
  return null;
}

// Files the round away. The first two players to land on the same word
// win it there and then — if three of them get there together, all three
// win.
export function resolveSyncRound(game: SyncGame, words: Record<string, string>): SyncGame {
  const round: SyncRound = { words };
  const match = syncMatches(words);
  const used = [...game.used];
  for (const raw of Object.values(words)) {
    const key = wordKey(raw);
    if (key && !used.includes(key)) used.push(key);
  }

  return {
    ...game,
    history: [...game.history, round],
    used,
    winners: match ? match.winners : null,
    matchedWord: match ? match.word : null,
  };
}

// Ends the game on a word the players decided was the same thing even
// though the letters differ ("hladno" / "hladnoća"). They are on the
// same team — there is nobody to cheat.
export function acceptSyncMatch(game: SyncGame, playerIds: string[], word: string): SyncGame {
  return { ...game, winners: playerIds, matchedWord: word };
}

export function syncIsOver(game: SyncGame): boolean {
  return game.winners !== null;
}

// What the players are aiming at this round: the words to find a middle
// for. Round one has only the seed.
export function syncTargets(game: SyncGame): string[] {
  const last = game.history[game.history.length - 1];
  if (!last) return [game.seed];
  return Object.values(last.words);
}
