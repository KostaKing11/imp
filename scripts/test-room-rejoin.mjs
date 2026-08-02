// A phone that drops out and comes back must land in the same seat with
// the same points. Driven over the in-memory transport, so it needs no
// phones, no network and no emulator:
//
//   node scripts/test-room-rejoin.mjs
//
// The real thing a player loses is their tournament score, and the
// scores are keyed by player id — so "same seat" and "same points" are
// the same assertion.

import { buildCategories } from "../src/game/categories.ts";
import { buildFakerCategories } from "../src/game/fakerEngine.ts";
import { buildPairCategories } from "../src/game/oddEngine.ts";
import { DEFAULT_MAFIA_ROLES, DEFAULT_ROLES } from "../src/game/roles.ts";
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
  // Empty means "every mode is in the draw".
  tournamentModes: [],
});

const hub = new MockHub();
const host = new RoomHost(
  hub.createHost(),
  { onState: () => {}, onCard: () => {} },
  "Host",
  "#E03131",
  config("imp"),
  "1234",
  "room-1",
  { language: "en", timerEnabled: false, timerSeconds: 90 }
);

// Two guests. The second one is the phone that will die.
const seats = [];
for (const [peer, name, color] of [
  ["phone-ana", "Ana", "#FF7A1F"],
  ["phone-marko", "Marko", "#1E4FFF"],
]) {
  const seat = { peer, name, state: null };
  seat.client = new RoomClient(
    hub.createClient(peer),
    { onState: (s) => (seat.state = s), onCard: () => {} },
    name,
    color
  );
  seats.push(seat);
}
await wait(40);

const marko = () => host.state.players.find((p) => p.name === "Marko");
const before = marko();
check(!!before, "Marko is in the room");
const markoId = before.id;
const markoColor = before.color;

// ---- a tournament is running, so there are points to lose ----
host.startTournament(5);
await wait(20);
check(host.state.tournament !== null, "a tournament is running");

// Give Marko something to lose. The scores map is the tournament's own.
host.state.tournament.scores[markoId] = 4;

// ---- his phone dies ----
hub.disconnect("phone-marko");
await wait(40);

const held = host.state.players.find((p) => p.id === markoId);
check(!!held, "his seat is still there after the phone drops");
check(held?.connected === false, "the room knows he is away");
check(
  host.state.players.filter((p) => p.connected).length === 2,
  "he does not count towards who is playing while away"
);
check(host.state.tournament.scores[markoId] === 4, "his points are untouched");

// ---- he opens the app again ----
// Same peer id, because a phone's id is its anonymous account and that
// survives the app being killed.
const returning = { state: null };
returning.client = new RoomClient(
  hub.createClient("phone-marko"),
  { onState: (s) => (returning.state = s), onCard: () => {} },
  "Marko",
  markoColor
);
await wait(60);

const back = host.state.players.find((p) => p.id === markoId);
check(!!back && back.connected, "he is back in the room");
check(
  host.state.players.filter((p) => p.name.startsWith("Marko")).length === 1,
  "he is not seated a second time as a stranger"
);
check(back?.color === markoColor, "he keeps his colour");
check(host.state.tournament.scores[markoId] === 4, "he keeps his 4 points");
check(returning.client.myId === markoId, "his phone is told it is the same player");

// ---- leaving on purpose is still leaving ----
// close() is "this app is going away" and holds the seat; leave() is the
// button, and that gives it up. The two must not be confused.
seats[0].client.leave();
await wait(40);
check(
  !host.state.players.some((p) => p.name === "Ana"),
  "somebody who presses leave is gone for good, not held"
);

console.log("");
if (fails.length) {
  console.log(`${fails.length} FAILED`);
  process.exit(1);
}
console.log("ALL CHECKS PASSED");
