import { CATEGORIES, WordEntry } from "../../data/words";
import { CATEGORIES_SR } from "../../data/words-sr";
import { Language } from "../i18n";
import { CategoryState } from "./types";

// Built-in category words always come fresh from the data files so file
// edits show up; only the enabled flag + custom categories are persisted.
// English and Serbian have SEPARATE built-in category sets — the app
// language decides which set is shown. Custom categories appear in both.

export type StoredCategories = {
  builtinEnabled: Record<string, boolean>;
  custom: { id: string; name: string; enabled: boolean; words: WordEntry[] }[];
};

export function buildCategories(
  stored?: StoredCategories | null,
  lang: Language = "en"
): CategoryState[] {
  const source = lang === "sr" ? CATEGORIES_SR : CATEGORIES;
  const builtin: CategoryState[] = source.map((c) => ({
    id: `b:${c.name}`,
    name: c.name,
    enabled: stored?.builtinEnabled?.[c.name] ?? true,
    custom: false,
    words: c.words,
  }));
  const custom: CategoryState[] = (stored?.custom ?? []).map((c) => ({
    id: c.id,
    name: c.name,
    enabled: c.enabled,
    custom: true,
    words: c.words,
  }));
  return [...builtin, ...custom];
}

export function serializeCategories(categories: CategoryState[]): StoredCategories {
  const builtinEnabled: Record<string, boolean> = {};
  for (const c of categories) {
    if (!c.custom) builtinEnabled[c.name] = c.enabled;
  }
  return {
    builtinEnabled,
    custom: categories
      .filter((c) => c.custom)
      .map((c) => ({ id: c.id, name: c.name, enabled: c.enabled, words: c.words })),
  };
}
