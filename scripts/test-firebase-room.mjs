// Drives the Firebase transports against the local Realtime Database
// emulator: one host and three players, exactly what happens on phones.
//
//   npx firebase emulators:start --only database --project demo-imp
//   node scripts/test-firebase-room.mjs

import { EMULATOR, FIREBASE_CONFIG } from "../src/net/firebase.ts";
import {
  FirebaseClientTransport,
  FirebaseHostTransport,
} from "../src/net/FirebaseTransport.ts";

// Point the SDK at the emulator instead of a real project.
// REAL=1 runs against the project in src/net/firebase.ts instead of the
// emulator — used once, to check a freshly set up project.
if (process.env.REAL !== "1") {
  Object.assign(FIREBASE_CONFIG, {
    apiKey: "demo",
    authDomain: "demo-imp.firebaseapp.com",
    databaseURL: "https://demo-imp-default-rtdb.firebaseio.com",
    projectId: "demo-imp",
    appId: "demo",
  });
  EMULATOR.enabled = true;
}

const wait = (ms) => new Promise((r) => setTimeout(r, ms));
const fails = [];
const lines = [];
const check = (cond, msg) => {
  lines.push(`${cond ? "ok  " : "FAIL"}  ${msg}`);
  if (!cond) fails.push(msg);
};

// Wraps a transport so the test can look at what it received.
function watch(transport) {
  const inbox = [];
  const joins = [];
  const leaves = [];
  transport.onMessage((from, msg) => inbox.push({ from, msg }));
  transport.onPeerJoin((peer) => joins.push(peer));
  transport.onPeerLeave((peer) => leaves.push(peer));
  return { inbox, joins, leaves };
}

const until = async (fn, ms = 6000) => {
  const start = Date.now();
  while (Date.now() - start < ms) {
    const value = fn();
    if (value) return value;
    await wait(50);
  }
  return null;
};

const host = new FirebaseHostTransport("host");
const hostSeen = watch(host);
const code = await host.start();
check(/^\d{4}$/.test(code), `host opened room ${code}`);

// three players join
const players = [];
for (let i = 0; i < 3; i++) {
  const client = new FirebaseClientTransport(`player${i}`);
  const seen = watch(client);
  await client.connect(code);
  players.push({ client, seen });
}
check(!!(await until(() => hostSeen.joins.length === 3)), "host was told about all three players");

const ids = hostSeen.joins;

// host deals a private card to each player
const started = Date.now();
ids.forEach((id, i) => host.send(id, { card: `card ${i}` }));
const delivered = await until(() => players.every((p) => p.seen.inbox.length >= 1));
check(!!delivered, "every player got a card");
lines.push(`      (delivery ${Date.now() - started}ms)`);

const cards = players.map((p) => p.seen.inbox[0]?.msg?.card);
check(new Set(cards).size === 3, `each card went to exactly one player (${cards.join(", ")})`);

// broadcast
host.send("all", { state: "vote" });
check(
  !!(await until(() => players.every((p) => p.seen.inbox.some((m) => m.msg?.state === "vote")))),
  "broadcast reached everyone"
);

// players answer back
players.forEach((p, i) => p.client.send("host", { vote: i }));
check(
  !!(await until(() => hostSeen.inbox.length >= 3)),
  `host got every vote (${hostSeen.inbox.length}/3)`
);
check(
  new Set(hostSeen.inbox.map((m) => m.from)).size === 3,
  "votes carried the right player ids"
);

// kick the second player
const kicked = ids[1];
host.kick(kicked);
check(!!(await until(() => hostSeen.leaves.includes(kicked))), "host saw the kicked player leave");
check(
  !!(await until(() => players[1].seen.leaves.length > 0)),
  "the kicked player's phone noticed"
);

// a player quits by themselves
players[2].client.close();
check(!!(await until(() => hostSeen.leaves.includes(ids[2]))), "host saw a player quit");

// host closes the room
host.close();
check(
  !!(await until(() => players[0].seen.leaves.length > 0)),
  "the last player was told the room closed"
);

players.forEach((p) => p.client.close());

console.log(lines.join("\n"));
console.log(fails.length ? `\nFAILED: ${fails.length}` : "\nALL CHECKS PASSED");
process.exit(fails.length ? 1 : 0);
