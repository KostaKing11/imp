import { QUESTION_CATEGORIES, QuestionEntry } from "../../data/questions";
import { QUESTION_CATEGORIES_SR } from "../../data/questions-sr";
import { Language } from "../i18n";
import { FakerCategoryState, FakerRound, FakerVotes, Player } from "./types";

// Faker needs at least this many players for the vote to mean anything.
export const FAKER_MIN_PLAYERS = 3;

function randomInt(max: number): number {
  return Math.floor(Math.random() * max);
}

function pickRandom<T>(arr: T[]): T {
  return arr[randomInt(arr.length)];
}

function questionId(q: QuestionEntry): string {
  return `${q.main}|${q.odd}`;
}

export type StoredFakerCategories = {
  builtinEnabled: Record<string, boolean>;
  custom: { id: string; name: string; enabled: boolean; questions: QuestionEntry[] }[];
};

// Built-in question categories always come fresh from the data files —
// only their enabled flags are persisted. Custom categories persist fully.
export function buildFakerCategories(
  stored?: StoredFakerCategories | null,
  lang: Language = "en"
): FakerCategoryState[] {
  const source = lang === "sr" ? QUESTION_CATEGORIES_SR : QUESTION_CATEGORIES;
  return [
    ...source.map((c) => ({
      id: `b:${c.name}`,
      name: c.name,
      enabled: stored?.builtinEnabled?.[c.name] ?? true,
      custom: false,
      questions: c.questions,
    })),
    ...(stored?.custom ?? []).map((c) => ({ ...c, custom: true })),
  ];
}

export function serializeFakerCategories(
  categories: FakerCategoryState[]
): StoredFakerCategories {
  const builtinEnabled: Record<string, boolean> = {};
  for (const c of categories) {
    if (!c.custom) builtinEnabled[c.name] = c.enabled;
  }
  return {
    builtinEnabled,
    custom: categories
      .filter((c) => c.custom)
      .map((c) => ({ id: c.id, name: c.name, enabled: c.enabled, questions: c.questions })),
  };
}

export function activeQuestionPool(categories: FakerCategoryState[]): QuestionEntry[] {
  return categories.filter((c) => c.enabled).flatMap((c) => c.questions);
}

// Builds a Faker round: picks a question pair from enabled categories
// (avoiding repeats until the pool runs out) and one random player who
// secretly gets the odd question.
export function createFakerRound(
  players: Player[],
  categories: FakerCategoryState[],
  usedQuestions: string[]
): FakerRound | null {
  const pool = activeQuestionPool(categories);
  if (pool.length === 0 || players.length < FAKER_MIN_PLAYERS) return null;

  const fresh = pool.filter((q) => !usedQuestions.includes(questionId(q)));
  const entry = pickRandom(fresh.length > 0 ? fresh : pool);

  return {
    questionId: questionId(entry),
    mainQuestion: entry.main,
    oddQuestion: entry.odd,
    oddPlayerId: pickRandom(players).id,
  };
}

export type FakerTally = {
  // playerId -> number of votes received
  counts: Record<string, number>;
  // playerIds tied for the most votes (empty when nobody voted)
  top: string[];
};

export function tallyFakerVotes(votes: FakerVotes): FakerTally {
  const counts: Record<string, number> = {};
  for (const suspectId of Object.values(votes)) {
    counts[suspectId] = (counts[suspectId] ?? 0) + 1;
  }
  const max = Math.max(0, ...Object.values(counts));
  const top = max === 0 ? [] : Object.keys(counts).filter((id) => counts[id] === max);
  return { counts, top };
}
