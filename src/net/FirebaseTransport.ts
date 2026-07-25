// Online transport over Firebase Realtime Database. Every phone talks to
// the same database instead of to each other, so an iPhone on the web
// version and an Android with the app can sit in the same room — and
// nobody has to be on the same Wi-Fi.
//
// Firebase is only the postbox; the host's phone still runs the game.
//
// A room is a little tree:
//   rooms/<code>/host            { uid, at } — removed on disconnect
//   rooms/<code>/peers/<uid>     one entry per player, removed on disconnect
//   rooms/<code>/toHost/<id>     messages for the host, deleted once read
//   rooms/<code>/toPeer/<uid>/<id>   messages for one player
//
// A player's id is their anonymous sign-in id, which is what the
// database rules use to keep one player's card away from everyone else.
//
// Messages travel as JSON text. Stored as objects they would come back
// subtly different — the database drops empty lists and nulls — and the
// game state is full of both.

import {
  DatabaseReference,
  get,
  off,
  onChildAdded,
  onChildRemoved,
  onDisconnect,
  onValue,
  push,
  ref,
  remove,
  runTransaction,
  set,
} from "firebase/database";
import { connection } from "./firebase";
import { MessageHandler, PeerHandler, Transport } from "./transport";

// How long we tolerate being cut off from the database before calling it.
const OFFLINE_GRACE_MS = 20_000;

function randomCode(): string {
  return String(Math.floor(1000 + Math.random() * 9000));
}

function encode(msg: unknown): string {
  return JSON.stringify(msg);
}

function decode(raw: unknown): unknown {
  if (typeof raw !== "string") return raw;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export class FirebaseHostTransport implements Transport {
  code = "";
  // A phone uses the default connection; the room test gives each of its
  // players its own so they get separate sign-ins.
  private conn: ReturnType<typeof connection>;
  constructor(connectionName?: string) {
    this.conn = connection(connectionName);
  }
  private roomRef: DatabaseReference | null = null;
  private watched: DatabaseReference[] = [];
  private peers = new Set<string>();
  private messageCb: MessageHandler = () => {};
  private joinCb: PeerHandler = () => {};
  private leaveCb: PeerHandler = () => {};
  private closed = false;

  // Opens a room and resolves with the code players type in.
  async start(): Promise<string> {
    const uid = await this.conn.uid();
    const db = this.conn.db;

    let code: string | null = null;
    for (let i = 0; i < 30 && code === null; i++) {
      const candidate = randomCode();
      // Only take the code if nobody else holds it.
      const res = await runTransaction(ref(db, `rooms/${candidate}/host`), (current) =>
        current === null ? { uid, at: Date.now() } : undefined
      );
      if (res.committed) code = candidate;
    }
    if (code === null) throw new Error("no-code");

    this.code = code;
    this.roomRef = ref(db, `rooms/${code}`);
    // If this phone drops off, the whole room goes with it.
    await onDisconnect(this.roomRef).remove();

    const peersRef = ref(db, `rooms/${code}/peers`);
    onChildAdded(peersRef, (snap) => {
      if (this.closed || !snap.key) return;
      this.peers.add(snap.key);
      this.joinCb(snap.key);
    });
    onChildRemoved(peersRef, (snap) => {
      if (this.closed || !snap.key) return;
      if (this.peers.delete(snap.key)) this.leaveCb(snap.key);
    });
    this.watched.push(peersRef);

    const inboxRef = ref(db, `rooms/${code}/toHost`);
    onChildAdded(inboxRef, (snap) => {
      if (this.closed) return;
      const value = snap.val();
      remove(snap.ref).catch(() => {});
      if (value?.from) this.messageCb(String(value.from), decode(value.data));
    });
    this.watched.push(inboxRef);

    return code;
  }

  send(to: string, msg: unknown): void {
    if (this.closed || !this.code) return;
    const db = this.conn.db;
    const targets = to === "all" ? [...this.peers] : [to];
    for (const peer of targets) {
      push(ref(db, `rooms/${this.code}/toPeer/${peer}`), { data: encode(msg) }).catch(() => {});
    }
  }

  onMessage(cb: MessageHandler): void {
    this.messageCb = cb;
  }
  onPeerJoin(cb: PeerHandler): void {
    this.joinCb = cb;
  }
  onPeerLeave(cb: PeerHandler): void {
    this.leaveCb = cb;
  }

  // Kicking a player: drop their entry, which their phone notices.
  kick(peerId: string): void {
    if (!this.code) return;
    const db = this.conn.db;
    // Leave the bookkeeping to the removal event, so the room hears
    // about this player leaving exactly like any other departure.
    remove(ref(db, `rooms/${this.code}/peers/${peerId}`)).catch(() => {});
    // Give the goodbye message a moment before the mailbox disappears.
    setTimeout(() => {
      remove(ref(db, `rooms/${this.code}/toPeer/${peerId}`)).catch(() => {});
    }, 800);
  }

  close(): void {
    if (this.closed) return;
    this.closed = true;
    for (const r of this.watched) off(r);
    this.watched = [];
    if (this.roomRef) {
      onDisconnect(this.roomRef).cancel().catch(() => {});
      remove(this.roomRef).catch(() => {});
      this.roomRef = null;
    }
  }
}

export class FirebaseClientTransport implements Transport {
  private conn: ReturnType<typeof connection>;
  constructor(connectionName?: string) {
    this.conn = connection(connectionName);
  }
  private code = "";
  private peerId = "";
  private peerRef: DatabaseReference | null = null;
  private watched: DatabaseReference[] = [];
  private messageCb: MessageHandler = () => {};
  private joinCb: PeerHandler = () => {};
  private leaveCb: PeerHandler = () => {};
  private closed = false;
  private offlineTimer: ReturnType<typeof setTimeout> | null = null;

  async connect(code: string): Promise<void> {
    const uid = await this.conn.uid();
    const db = this.conn.db;

    const hostSnap = await get(ref(db, `rooms/${code}/host`));
    if (!hostSnap.exists()) throw new Error("no-room");

    this.code = code;
    this.peerId = uid;
    const peerRef = ref(db, `rooms/${code}/peers/${uid}`);
    this.peerRef = peerRef;

    // Leave no trace if this phone drops off.
    await onDisconnect(peerRef).remove();
    await set(peerRef, { at: Date.now() });

    const inboxRef = ref(db, `rooms/${code}/toPeer/${this.peerId}`);
    onChildAdded(inboxRef, (snap) => {
      if (this.closed) return;
      const value = snap.val();
      remove(snap.ref).catch(() => {});
      this.messageCb("host", decode(value?.data));
    });
    this.watched.push(inboxRef);

    // The host went away (or kicked us out).
    const hostRef = ref(db, `rooms/${code}/host`);
    onValue(hostRef, (snap) => {
      if (!this.closed && !snap.exists()) this.lost();
    });
    this.watched.push(hostRef);

    onValue(peerRef, (snap) => {
      if (!this.closed && !snap.exists()) this.lost();
    });
    this.watched.push(peerRef);

    // Our own connection to the database.
    const connectedRef = ref(db, ".info/connected");
    onValue(connectedRef, (snap) => {
      if (this.closed) return;
      if (snap.val() === true) {
        if (this.offlineTimer) clearTimeout(this.offlineTimer);
        this.offlineTimer = null;
      } else if (!this.offlineTimer) {
        this.offlineTimer = setTimeout(() => this.lost(), OFFLINE_GRACE_MS);
      }
    });
    this.watched.push(connectedRef);

    this.joinCb("host");
  }

  private lost(): void {
    if (this.closed) return;
    this.closed = true;
    this.cleanup();
    this.leaveCb("host");
  }

  send(_to: string, msg: unknown): void {
    if (this.closed || !this.code) return;
    const db = this.conn.db;
    push(ref(db, `rooms/${this.code}/toHost`), { from: this.peerId, data: encode(msg) }).catch(
      () => {}
    );
  }

  onMessage(cb: MessageHandler): void {
    this.messageCb = cb;
  }
  onPeerJoin(cb: PeerHandler): void {
    this.joinCb = cb;
  }
  onPeerLeave(cb: PeerHandler): void {
    this.leaveCb = cb;
  }

  private cleanup(): void {
    if (this.offlineTimer) clearTimeout(this.offlineTimer);
    this.offlineTimer = null;
    for (const r of this.watched) off(r);
    this.watched = [];
  }

  close(): void {
    if (this.closed) {
      this.cleanup();
      return;
    }
    this.closed = true;
    this.cleanup();
    if (this.peerRef) {
      onDisconnect(this.peerRef).cancel().catch(() => {});
      remove(this.peerRef).catch(() => {});
      this.peerRef = null;
    }
  }
}
