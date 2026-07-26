// The host's phone drops off mid-room. The player who joined first has
// to be able to pick the room up, keep the same code, and let the others
// walk back in.
//
//   REAL=1 node scripts/test-firebase-migration.mjs

import { goOffline } from "firebase/database";
import { connection, EMULATOR, FIREBASE_CONFIG } from "../src/net/firebase.ts";
import {
  FirebaseClientTransport,
  FirebaseHostTransport,
} from "../src/net/FirebaseTransport.ts";

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
const until = async (fn, ms = 8000) => {
  const start = Date.now();
  while (Date.now() - start < ms) {
    const v = fn();
    if (v) return v;
    await wait(100);
  }
  return null;
};

const watch = (transport) => {
  const seen = { inbox: [], joins: [], leaves: [] };
  transport.onMessage((from, msg) => seen.inbox.push({ from, msg }));
  transport.onPeerJoin((peer) => seen.joins.push(peer));
  transport.onPeerLeave((peer) => seen.leaves.push(peer));
  return seen;
};

// ---- a room with a host and two players ----
const host = new FirebaseHostTransport("host");
const hostSeen = watch(host);
const code = await host.start();
check(/^\d{4}$/.test(code), `room ${code} is open`);

const first = new FirebaseClientTransport("first");
const firstSeen = watch(first);
await first.connect(code);
await wait(600); // so "first" really is the earlier joiner

const second = new FirebaseClientTransport("second");
const secondSeen = watch(second);
await second.connect(code);
check(!!(await until(() => hostSeen.joins.length === 2)), "both players are in");

// ---- the host's phone falls off the network ----
goOffline(connection("host").db);
check(
  !!(await until(() => firstSeen.leaves.length > 0 && secondSeen.leaves.length > 0)),
  "both players notice the host is gone"
);

// ---- the earliest player picks the room up ----
const newHost = new FirebaseHostTransport("first");
const newHostSeen = watch(newHost);
let tookOver = true;
try {
  await newHost.takeOver(code);
} catch {
  tookOver = false;
}
check(tookOver, "the first player took the room over");
check(newHost.code === code, "the room kept its code");

// ---- the other player walks back in ----
const rejoined = new FirebaseClientTransport("second");
const rejoinedSeen = watch(rejoined);
let backIn = true;
try {
  await rejoined.connect(code);
} catch {
  backIn = false;
}
check(backIn, "the other player rejoined the same room");
check(!!(await until(() => newHostSeen.joins.length >= 1)), "the new host sees them arrive");

newHost.send("all", { hello: "from the new host" });
check(
  !!(await until(() => rejoinedSeen.inbox.some((m) => m.msg?.hello))),
  "the new host can reach the room"
);

newHost.close();
rejoined.close();
second.close();
first.close();
host.close();

console.log(lines.join("\n"));
console.log(fails.length ? `\nFAILED: ${fails.length}` : "\nALL CHECKS PASSED");
process.exit(fails.length ? 1 : 0);
