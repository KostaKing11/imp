// Same Page decides the game on whether two people wrote "the same
// word", so this is the one place where being wrong ends a round that
// should have continued — or worse, refuses one that should have ended.
//
//   node scripts/test-sync-words.mjs
//
// MUST match: the same word in a different form or without diacritics.
// MUST NOT match: two words that merely start alike.

import { wordKey } from "../src/game/types.ts";
import { syncMatches } from "../src/game/syncEngine.ts";

const fails = [];
const check = (cond, msg) => {
  console.log(`${cond ? "ok  " : "FAIL"}  ${msg}`);
  if (!cond) fails.push(msg);
};

const same = (a, b) => wordKey(a) === wordKey(b);

console.log("-- must be the same word --");
for (const [a, b] of [
  ["hladan", "hladno"],
  ["hladno", "hladni"],
  ["hladan", "hladna"],
  ["čuvar", "cuvar"],
  ["Čuvar", "cuvar "],
  ["šuma", "suma"],
  ["žaba", "zaba"],
  ["đak", "djak"],
  ["voda", "vodu"],
  ["sunce", "sunca"],
  ["kuća", "kuca"],
  ["cat", "cats"],
  ["Pizza", "pizza"],
  ["pas ", "pas"],
]) {
  check(same(a, b), `${a} = ${b}`);
}

console.log("");
console.log("-- must NOT be the same word --");
for (const [a, b] of [
  ["led", "leptir"],
  ["more", "morski pas"],
  ["pas", "pasulj"],
  ["sto", "stolica"],
  ["rak", "raketa"],
  ["kiša", "kišobran"],
  ["dan", "danas"],
  ["voda", "vodopad"],
  ["zima", "zimnica"],
  ["cat", "castle"],
]) {
  check(!same(a, b), `${a} ≠ ${b}`);
}

console.log("");
console.log("-- a round is decided by it --");
check(
  syncMatches({ a: "hladan", b: "hladno" })?.winners.length === 2,
  "two people writing hladan/hladno land on the same page"
);
check(syncMatches({ a: "led", b: "vatra" }) === null, "led and vatra are not a match");
check(
  syncMatches({ a: "čuvar", b: "cuvar", c: "vatra" })?.winners.length === 2,
  "diacritics do not keep two people apart"
);
check(syncMatches({ a: "sunce" }) === null, "one person alone never matches");
check(syncMatches({ a: "", b: "" }) === null, "blank answers never match");

console.log("");
if (fails.length) {
  console.log(`${fails.length} FAILED`);
  process.exit(1);
}
console.log("ALL CHECKS PASSED");
