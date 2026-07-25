// Firebase Realtime Database — the meeting point for online rooms.
//
// These values are NOT secrets: every Firebase web app ships them, and
// what may be done with them is decided by the database rules (see
// firebase/database.rules.json). Put your own project's values here —
// Firebase console -> Project settings -> Your apps -> SDK setup.
//
// Every device signs in anonymously. Nobody types anything and no
// account is created for the player, but each phone gets an id the rules
// can lean on — that is what keeps one player's card out of another
// player's reach.

import { FirebaseApp, getApp, getApps, initializeApp } from "firebase/app";
import { Auth, connectAuthEmulator, getAuth, signInAnonymously } from "firebase/auth";
import { connectDatabaseEmulator, Database, getDatabase } from "firebase/database";

export const FIREBASE_CONFIG = {
  apiKey: "PASTE_API_KEY",
  authDomain: "PASTE_PROJECT.firebaseapp.com",
  // Must be the europe-west1 database URL, not the default US one.
  databaseURL: "https://PASTE_PROJECT-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "PASTE_PROJECT",
  appId: "PASTE_APP_ID",
};

export function firebaseConfigured(): boolean {
  return (
    !FIREBASE_CONFIG.apiKey.startsWith("PASTE_") &&
    !FIREBASE_CONFIG.databaseURL.includes("PASTE_")
  );
}

// Flipped on by the room and rules tests so they run against the local
// emulator instead of the real project. Never touched by the app.
export const EMULATOR = {
  enabled: false,
  host: "127.0.0.1",
  databasePort: 9000,
  authPort: 9099,
};

export type Connection = {
  db: Database;
  // This device's id, once anonymous sign-in has gone through.
  uid: () => Promise<string>;
};

const connections = new Map<string, Connection>();

// A phone only ever needs the default connection. The room test runs
// several players in one process, so it asks for one connection per
// player to give each its own sign-in.
export function connection(name = "[DEFAULT]"): Connection {
  const existing = connections.get(name);
  if (existing) return existing;
  if (!firebaseConfigured()) throw new Error("firebase-not-configured");

  const app: FirebaseApp =
    name === "[DEFAULT]"
      ? getApps().length > 0
        ? getApp()
        : initializeApp(FIREBASE_CONFIG)
      : initializeApp(FIREBASE_CONFIG, name);

  const db = getDatabase(app);
  if (EMULATOR.enabled) {
    connectDatabaseEmulator(db, EMULATOR.host, EMULATOR.databasePort, { mockUserToken: undefined });
  }
  let auth: Auth | null = null;
  let signIn: Promise<string> | null = null;

  const uid = (): Promise<string> => {
    if (!signIn) {
      signIn = (async () => {
        if (!auth) {
          auth = getAuth(app);
          if (EMULATOR.enabled) {
            connectAuthEmulator(auth, `http://${EMULATOR.host}:${EMULATOR.authPort}`, {
              disableWarnings: true,
            });
          }
        }
        if (auth.currentUser) return auth.currentUser.uid;
        const cred = await signInAnonymously(auth);
        return cred.user.uid;
      })().catch((e) => {
        // Let the next attempt try again instead of failing forever.
        signIn = null;
        throw e;
      });
    }
    return signIn;
  };

  const conn: Connection = { db, uid };
  connections.set(name, conn);
  return conn;
}
