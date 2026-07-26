// Drives the room state machine over the in-memory transport, so the
// new automatic steps can be checked without any phones or network.
//
//   node scripts/test-room-flow.mjs

import { buildCategories } from "../src/game/categories.ts";
import { buildFakerCategories } from "../src/game/fakerEngine.ts";
import { buildPairCategories } from "../src/game/oddEngine.ts";
import { DEFAULT_MAFIA_ROLES, DEFAULT_ROLES } from "../src/game/roles.ts";
import { EJECT_TOTAL_MS } from "../src/net/protocol.ts";
import { RoomClient, RoomHost } from "../src/net/room.ts";
import { MockHub } from "../src/net/transport.ts";

const wait = (ms) => new Promise((r) => setTimeout(r, ms));
const fails = [];
const lines = [];
const check = (cond, msg) => {
  lines.push(`${cond ? "ok  " : "FAIL"}  ${msg}`);
  if (!cond) fails.push(msg);
};

function config(mode) {
  return {
    mode,
    roles: DEFAULT_ROLES.map((r) => ({ ...r })),
    mafiaRoles: DEFAULT_MAFIA_ROLES.map((r) => ({ ...r })),
    categories: buildCategories(),
    pairCategories: buildPairCategories(),
    fakerCategories: buildFakerCategories(),
  };
}

const hub = new MockHub();
let hostState = null;
const host = new RoomHost(
  hub.createHost(),
  { onState: (s) => (hostState = s), onCard: () => {} },
  "Host",
  "#E03131",
  config("imp"),
  "1234",
  "room-1",
  { language: "sr", timerEnabled: true, timerSeconds: 90 }
);

// three players, two of them asking for a colour that is already taken
const guests = [];
for (const [name, color] of [
  ["Ana", "#E03131"],
  ["Marko", "#E03131"],
  ["Iva", "#1E4FFF"],
]) {
  const seat = { state: null, card: null };
  seat.client = new RoomClient(
    hub.createClient(),
    { onState: (s) => (seat.state = s), onCard: (c) => (seat.card = c) },
    name,
    color
  );
  guests.push(seat);
}
await wait(30);

const colors = host.state.players.map((p) => p.color.toUpperCase());
check(new Set(colors).size === colors.length, `every player has their own colour (${colors.join(", ")})`);
check(
  host.state.settings.language === "sr" && host.state.settings.timerSeconds === 90,
  "the room carries the host's language and timer"
);
check(
  guests.every((g) => g.state?.settings?.language === "sr"),
  "players are told which language the room uses"
);

// a player picks a different colour in the lobby
const free = "#8E44AD";
guests[0].client.color(free);
await wait(50);
check(
  host.state.players.find((p) => p.name === "Ana")?.color === free,
  "a player can pick a free colour in the lobby"
);
const hostColor = host.state.players[0].color;
guests[1].client.color(hostColor);
await wait(50);
check(
  host.state.players.find((p) => p.name === "Marko")?.color !== hostColor,
  "a colour someone else holds is refused"
);

host.startRound();
await wait(30);
check(host.state.phase === "cards", "the round deals cards");

// everyone confirms their card — nobody presses anything else
host.markReady(host.myId);
guests.forEach((g) => g.client.ready());
await wait(60);
check(host.state.phase === "discuss", "cards move on by themselves once everyone has looked");
check(!!host.state.firstPlayerId, "someone is named to go first");
check(host.state.phaseAt > 0, "the phase is stamped so the timer can run");

host.startVote();
await wait(30);
check(host.state.phase === "vote", "the host opens the vote");
check(host.state.voteMap === null, "nobody can see the votes while voting is open");

const target = guests[0].client.myId;
host.submitVote(host.myId, target);
guests[0].client.vote(host.myId);
guests[1].client.vote(target);
await wait(60);
check(host.state.phase === "vote", "still voting while one player has not voted");
guests[2].client.vote(target);
await wait(80);

check(host.state.phase === "eject", "the last vote moves the room on by itself");
check(host.state.voteMap !== null, "who voted for whom is revealed with the result");
check(host.state.results?.votedOutId === target, "the player with the most votes is the one voted out");
check(
  guests.every((g) => g.state?.phase === "eject" && g.state?.voteMap),
  "every player sees the same votes"
);

await wait(EJECT_TOTAL_MS + 400);
check(host.state.phase === "results", "the results follow on their own");
check(
  guests.every((g) => g.state?.phase === "results"),
  "everyone lands on the results"
);

host.backToLobby();
await wait(30);
check(host.state.phase === "lobby" && host.state.voteMap === null, "back to a clean lobby");

console.log(lines.join("\n"));
console.log(fails.length ? `\nFAILED: ${fails.length}` : "\nALL CHECKS PASSED");
process.exit(fails.length ? 1 : 0);
