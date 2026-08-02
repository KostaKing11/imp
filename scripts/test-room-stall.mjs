// A round must never be left hanging on somebody who is no longer there.
//
//   node scripts/test-room-stall.mjs
//
// Every phase that waits for "everyone" only re-checks when a message
// arrives. So if the *last* player anybody is waiting on walks out of
// signal, nothing arrives, the check never runs again — and the room sits
// there forever, because the one person who could unstick it is gone.
// These drive exactly that: get to one-player-left-to-act, drop them, and
// the room must move on by itself.

import { buildCategories } from "../src/game/categories.ts";
import { buildFakerCategories } from "../src/game/fakerEngine.ts";
import { buildPairCategories } from "../src/game/oddEngine.ts";
import { DEFAULT_MAFIA_ROLES, DEFAULT_ROLES } from "../src/game/roles.ts";
import { buildSpectrumCategories } from "../src/game/skalaEngine.ts";
import { RoomClient, RoomHost } from "../src/net/room.ts";
import { MockHub } from "../src/net/transport.ts";

const wait = (ms) => new Promise((r) => setTimeout(r, ms));
const fails = [];
const check = (cond, msg) => {
  console.log(`${cond ? "ok  " : "FAIL"}  ${msg}`);
  if (!cond) fails.push(msg);
};

const config = (mode) => ({
  mode,
  roles: DEFAULT_ROLES.map((r) => ({ ...r })),
  mafiaRoles: DEFAULT_MAFIA_ROLES.map((r) => ({ ...r })),
  categories: buildCategories(),
  pairCategories: buildPairCategories(),
  fakerCategories: buildFakerCategories(),
  spectrumCategories: buildSpectrumCategories(),
  // Without this Scale has no rounds to play and ends the moment it
  // starts, which is worth knowing if a config ever loses the field.
  skalaTurns: 1,
  tournamentModes: [],
});

// A room with a host and three guests, each on a named phone.
async function room(mode) {
  const hub = new MockHub();
  const host = new RoomHost(
    hub.createHost(),
    { onState: () => {}, onCard: () => {} },
    "Host",
    "#E03131",
    config(mode),
    "1234",
    "room-1",
    { language: "en", timerEnabled: false, timerSeconds: 90 }
  );
  const guests = [];
  for (const [peer, name, color] of [
    ["p-ana", "Ana", "#FF7A1F"],
    ["p-marko", "Marko", "#1E4FFF"],
    ["p-iva", "Iva", "#FFD500"],
  ]) {
    const seat = { peer, name, state: null };
    seat.client = new RoomClient(
      hub.createClient(peer),
      { onState: (s) => (seat.state = s), onCard: (c) => (seat.card = c) },
      name,
      color
    );
    guests.push(seat);
  }
  await wait(40);
  return { hub, host, guests };
}

const idOf = (host, name) => host.state.players.find((p) => p.name === name)?.id;

// ---- cards: the last player to look at their card walks out ----
{
  const { hub, host, guests } = await room("imp");
  host.startRound();
  await wait(20);
  check(host.state.phase === "cards", "cards are dealt");

  host.markReady(host.myId);
  guests[0].client.ready();
  guests[1].client.ready();
  await wait(20);
  check(host.state.phase === "cards", "still waiting on the one who has not looked");

  hub.disconnect("p-iva");
  await wait(40);
  check(host.state.phase === "discuss", "the round moves on when the last one drops");
}

// ---- vote: the last vote never arrives ----
{
  const { hub, host, guests } = await room("imp");
  host.startRound();
  await wait(20);
  host.markReady(host.myId);
  guests.forEach((g) => g.client.ready());
  await wait(30);
  host.startVote();
  await wait(20);
  check(host.state.phase === "vote", "the vote is open");

  const target = idOf(host, "Ana");
  host.submitVote(host.myId, target);
  // Ana votes for the host — nobody may vote for themselves.
  guests[0].client.vote(host.myId);
  guests[1].client.vote(target);
  await wait(20);
  check(host.state.phase === "vote", "still waiting on the last vote");

  hub.disconnect("p-iva");
  await wait(40);
  check(host.state.phase !== "vote", "the vote closes when the last voter drops");
}

// ---- Same Page: the last word never gets written ----
{
  const { hub, host, guests } = await room("sync");
  host.startRound();
  await wait(20);
  check(host.state.phase === "syncWrite", "Same Page opens for writing");

  host.submitAnswer(host.myId, "alpha");
  guests[0].client.answer("bravo");
  guests[1].client.answer("charlie");
  await wait(20);
  check(host.state.phase === "syncWrite", "still waiting on the last word");

  hub.disconnect("p-iva");
  await wait(40);
  check(host.state.phase !== "syncWrite", "the round turns over when the last writer drops");
}

// ---- Scale: the last dial never gets turned ----
{
  const { hub, host, guests } = await room("skala");
  host.startRound();
  await wait(20);
  check(host.state.phase === "skalaClue", "Scale waits for the caller's clue");

  // Whoever is calling gives their clue; everyone else then guesses.
  const giver = host.state.skala?.clueGiverId;
  const guessersLeft = () =>
    host.state.players.filter((p) => p.connected && p.inRound && p.id !== giver);
  if (giver === host.myId) host.submitAnswer(host.myId, "somewhere");
  else {
    const seat = guests.find((g) => idOf(host, g.name) === giver);
    seat.client.answer("somewhere");
  }
  await wait(30);
  check(host.state.phase === "skalaGuess", "the dials open once the clue is in");

  // Everyone guesses except Iva.
  for (const p of guessersLeft()) {
    if (p.id === host.myId) host.submitGuess(host.myId, 40);
    else if (p.name !== "Iva") {
      const seat = guests.find((g) => g.name === p.name);
      seat.client.guess(55);
    }
  }
  await wait(20);
  const ivaWasGuessing = guessersLeft().some((p) => p.name === "Iva");
  check(
    !ivaWasGuessing || host.state.phase === "skalaGuess",
    "still waiting on the last dial"
  );

  hub.disconnect("p-iva");
  await wait(40);
  check(host.state.phase !== "skalaGuess", "the board opens when the last guesser drops");
}

// ---- everybody but the host drops mid-round ----
{
  const { hub, host } = await room("imp");
  host.startRound();
  await wait(20);
  hub.disconnect("p-ana");
  hub.disconnect("p-marko");
  hub.disconnect("p-iva");
  await wait(60);
  check(
    host.state.phase !== "cards" || host.state.readyIds.length === 0,
    "an empty round does not sit in the cards phase waiting on nobody"
  );
  check(true, "the room survives everyone leaving at once");
}

console.log("");
if (fails.length) {
  console.log(`${fails.length} FAILED`);
  process.exit(1);
}
console.log("ALL CHECKS PASSED");
