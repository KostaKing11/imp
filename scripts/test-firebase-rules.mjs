// Tries to cheat against the database rules: read someone else's card,
// snoop on the room, hijack a room. Everything here must be refused.
//
//   npx firebase emulators:start --only database,auth --project demo-imp
//   node scripts/test-firebase-rules.mjs

import { get, push, ref, remove, set } from "firebase/database";
import { connection, EMULATOR, FIREBASE_CONFIG } from "../src/net/firebase.ts";
import {
  FirebaseClientTransport,
  FirebaseHostTransport,
} from "../src/net/FirebaseTransport.ts";

Object.assign(FIREBASE_CONFIG, {
  apiKey: "demo",
  authDomain: "demo-imp.firebaseapp.com",
  databaseURL: "https://demo-imp-default-rtdb.firebaseio.com",
  projectId: "demo-imp",
  appId: "demo",
});
EMULATOR.enabled = true;

const wait = (ms) => new Promise((r) => setTimeout(r, ms));
const lines = [];
const fails = [];
const check = (cond, msg) => {
  lines.push(`${cond ? "ok  " : "FAIL"}  ${msg}`);
  if (!cond) fails.push(msg);
};
// Runs an operation that MUST be refused by the rules.
const refused = async (label, fn) => {
  try {
    await fn();
    check(false, `${label} — WAS ALLOWED`);
  } catch (e) {
    const denied = /permission[_ ]denied/i.test(String(e));
    check(denied, denied ? `${label} — refused` : `${label} — failed for another reason: ${e}`);
  }
};

const host = new FirebaseHostTransport("rules-host");
const code = await host.start();
const alice = new FirebaseClientTransport("rules-alice");
await alice.connect(code);
const mallory = new FirebaseClientTransport("rules-mallory");
await mallory.connect(code);
await wait(600);

const aliceUid = await connection("rules-alice").uid();
const malloryUid = await connection("rules-mallory").uid();
const outsider = connection("rules-outsider");
const outsiderDb = outsider.db;
await outsider.uid();

// the host deals a secret card to Alice
host.send(aliceUid, { word: "SECRET WORD" });
await wait(500);

const malloryDb = connection("rules-mallory").db;

await refused("a player reading someone else's card", () =>
  get(ref(malloryDb, `rooms/${code}/toPeer/${aliceUid}`))
);
await refused("a player reading the whole room", () => get(ref(malloryDb, `rooms/${code}`)));
await refused("a player reading what others send the host", () =>
  get(ref(malloryDb, `rooms/${code}/toHost`))
);
await refused("a player kicking someone else", () =>
  remove(ref(malloryDb, `rooms/${code}/peers/${aliceUid}`))
);
await refused("a player taking over the room", () =>
  set(ref(malloryDb, `rooms/${code}/host`), { uid: malloryUid, at: Date.now() })
);
await refused("a player closing someone else's room", () => remove(ref(malloryDb, `rooms/${code}`)));
await refused("an outsider reading a room", () => get(ref(outsiderDb, `rooms/${code}`)));
await refused("writing outside the rooms area", () =>
  set(ref(malloryDb, "somewhere-else"), { junk: true })
);
await refused("faking who a message came from", () =>
  push(ref(malloryDb, `rooms/${code}/toHost`), { from: aliceUid, data: { vote: "x" } })
);

// and the things that must keep working
try {
  const own = await get(ref(malloryDb, `rooms/${code}/toPeer/${malloryUid}`));
  check(true, "a player can read their own mail");
  void own;
} catch {
  check(false, "a player can read their own mail");
}
try {
  await push(ref(malloryDb, `rooms/${code}/toHost`), { from: malloryUid, data: { vote: "ok" } });
  check(true, "a player can send to the host");
} catch (e) {
  check(false, `a player can send to the host (${e})`);
}

host.close();
alice.close();
mallory.close();

console.log(lines.join("\n"));
console.log(fails.length ? `\nFAILED: ${fails.length}` : "\nALL CHECKS PASSED");
process.exit(fails.length ? 1 : 0);
