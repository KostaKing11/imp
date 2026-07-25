// @ts-nocheck
// GENERATED — do not edit. Built by scripts/build-relay-single.mjs
// from server/relay-core.mjs + server/relay.ts.
//
// Paste this whole file into a Deno Deploy playground and hit Save.
// Room relay — the "postman" between phones. It knows nothing about the
// game: the host's phone stays the only authority, this just carries
// messages between the host and the players in a room.
//
// Sockets always live in ONE server instance, but a room's players can
// land in different ones (Deno Deploy runs several). So everything that
// has to cross an instance boundary goes through a `bus`:
//
//   claimRoom(code)  -> true if this code is now ours
//   roomExists(code) -> is there a room with this code anywhere
//   keepRoom(code)   -> refresh the room's lease
//   releaseRoom(code)
//   publish(code, msg)
//   onRemote(cb)     -> cb(code, msg) for messages from other instances
//
// A single-process server (Node) uses a memory bus where publish is a
// no-op; on Deno Deploy the bus is backed by Deno KV.

const MAX_PEERS_PER_ROOM = 15;
const MAX_MESSAGE_BYTES = 16 * 1024;
const ROOM_LEASE_REFRESH_MS = 20_000;

function createRelay({ bus, log = () => {} }) {
  /**
   * code -> {
   *   host: sock | null,           // the host, if it sits in THIS instance
   *   peers: Map<peerId, sock>,    // players in THIS instance
   *   remotePeers: Set<peerId>,    // players known to be elsewhere
   *   lease: timer | null          // only the host's instance holds it
   * }
   */
  const rooms = new Map();
  // sock -> { role: "host" | "peer", code, peerId }
  const meta = new Map();
  let peerSeq = 1;

  const send = (sock, obj) => {
    if (!sock) return;
    try {
      sock.send(JSON.stringify(obj));
    } catch {
      // socket is closing; its close handler cleans up
    }
  };

  const newPeerId = () => `p${peerSeq++}-${Math.random().toString(36).slice(2, 6)}`;

  const room = (code) => rooms.get(code) ?? null;

  const ensureRoom = (code) => {
    let r = rooms.get(code);
    if (!r) {
      r = { host: null, peers: new Map(), remotePeers: new Set(), lease: null };
      rooms.set(code, r);
      bus.subscribe?.(code);
    }
    return r;
  };

  const forgetRoom = (code) => {
    const r = rooms.get(code);
    if (!r) return;
    if (r.lease) clearInterval(r.lease);
    rooms.delete(code);
    bus.unsubscribe?.(code);
  };

  // Everyone in this instance loses the room (the host went away).
  const dropLocalPeers = (code) => {
    const r = room(code);
    if (!r) return;
    for (const peer of r.peers.values()) {
      meta.delete(peer);
      try {
        peer.close();
      } catch {}
    }
    forgetRoom(code);
  };

  // ---- messages from a socket ----

  async function onMessage(sock, raw) {
    if (typeof raw !== "string" || raw.length > MAX_MESSAGE_BYTES) return;
    let msg;
    try {
      msg = JSON.parse(raw);
    } catch {
      return;
    }
    if (!msg || typeof msg !== "object") return;

    const info = meta.get(sock);

    // ---- opening a room ----
    if (msg.t === "HOST") {
      if (info) return;
      let code = null;
      for (let i = 0; i < 25 && code === null; i++) {
        const candidate = String(Math.floor(1000 + Math.random() * 9000));
        if (rooms.has(candidate)) continue;
        if (await bus.claimRoom(candidate)) code = candidate;
      }
      if (code === null) {
        send(sock, { t: "ERR", reason: "no-code" });
        return;
      }
      const r = ensureRoom(code);
      r.host = sock;
      r.lease = setInterval(() => bus.keepRoom(code), ROOM_LEASE_REFRESH_MS);
      meta.set(sock, { role: "host", code });
      send(sock, { t: "HOSTED", code });
      log(`room ${code} opened`);
      return;
    }

    // ---- joining a room ----
    if (msg.t === "JOIN") {
      if (info) return;
      const code = String(msg.code ?? "");
      if (!/^\d{4}$/.test(code)) {
        send(sock, { t: "ERR", reason: "bad-code" });
        return;
      }
      const local = room(code);
      const exists = (local && local.host) || (await bus.roomExists(code));
      if (!exists) {
        send(sock, { t: "ERR", reason: "no-room" });
        try {
          sock.close();
        } catch {}
        return;
      }
      const r = ensureRoom(code);
      if (r.peers.size + r.remotePeers.size >= MAX_PEERS_PER_ROOM) {
        send(sock, { t: "ERR", reason: "full" });
        return;
      }
      const peerId = newPeerId();
      r.peers.set(peerId, sock);
      meta.set(sock, { role: "peer", code, peerId });
      send(sock, { t: "JOINED", peerId });
      if (r.host) send(r.host, { t: "PEER_JOIN", peer: peerId });
      else bus.publish(code, { kind: "peer-join", peer: peerId });
      return;
    }

    if (!info) return;
    const r = room(info.code);
    if (!r) return;

    // ---- in-room traffic ----
    if (msg.t === "MSG") {
      if (info.role === "host") {
        if (msg.to === "all") {
          for (const peer of r.peers.values()) send(peer, { t: "MSG", data: msg.data });
          if (r.remotePeers.size > 0) {
            bus.publish(info.code, { kind: "to-peer", to: "all", data: msg.data });
          }
        } else {
          const peer = r.peers.get(msg.to);
          if (peer) send(peer, { t: "MSG", data: msg.data });
          else if (r.remotePeers.has(msg.to)) {
            bus.publish(info.code, { kind: "to-peer", to: msg.to, data: msg.data });
          }
        }
      } else if (r.host) {
        send(r.host, { t: "MSG", from: info.peerId, data: msg.data });
      } else {
        bus.publish(info.code, { kind: "to-host", from: info.peerId, data: msg.data });
      }
      return;
    }

    // ---- the host kicks a player ----
    if (msg.t === "KICK" && info.role === "host") {
      const peerId = String(msg.peer);
      const peer = r.peers.get(peerId);
      if (peer) {
        r.peers.delete(peerId);
        meta.delete(peer);
        try {
          peer.close();
        } catch {}
      } else if (r.remotePeers.has(peerId)) {
        r.remotePeers.delete(peerId);
        bus.publish(info.code, { kind: "kick", peer: peerId });
      }
    }
  }

  // ---- a socket went away ----

  function onClose(sock) {
    const info = meta.get(sock);
    meta.delete(sock);
    if (!info) return;
    const r = room(info.code);
    if (!r) return;

    if (info.role === "host") {
      log(`room ${info.code} closed`);
      bus.releaseRoom(info.code);
      bus.publish(info.code, { kind: "host-gone" });
      r.host = null;
      dropLocalPeers(info.code);
      return;
    }

    r.peers.delete(info.peerId);
    if (r.host) send(r.host, { t: "PEER_LEAVE", peer: info.peerId });
    else bus.publish(info.code, { kind: "peer-leave", peer: info.peerId });
    // Nothing of this room left here.
    if (!r.host && r.peers.size === 0) forgetRoom(info.code);
  }

  // ---- messages from another instance ----

  function onRemote(code, msg) {
    const r = room(code);
    if (!r || !msg || typeof msg !== "object") return;

    switch (msg.kind) {
      case "peer-join":
        if (!r.host) return;
        r.remotePeers.add(msg.peer);
        send(r.host, { t: "PEER_JOIN", peer: msg.peer });
        return;
      case "peer-leave":
        if (!r.host) return;
        r.remotePeers.delete(msg.peer);
        send(r.host, { t: "PEER_LEAVE", peer: msg.peer });
        return;
      case "to-host":
        if (!r.host) return;
        send(r.host, { t: "MSG", from: msg.from, data: msg.data });
        return;
      case "to-peer":
        if (msg.to === "all") {
          for (const peer of r.peers.values()) send(peer, { t: "MSG", data: msg.data });
        } else {
          const peer = r.peers.get(msg.to);
          if (peer) send(peer, { t: "MSG", data: msg.data });
        }
        return;
      case "kick": {
        const peer = r.peers.get(msg.peer);
        if (!peer) return;
        r.peers.delete(msg.peer);
        // meta is dropped here, so the socket's own close handler won't
        // announce the departure — do it now.
        meta.delete(peer);
        try {
          peer.close();
        } catch {}
        bus.publish(code, { kind: "peer-leave", peer: msg.peer });
        if (!r.host && r.peers.size === 0) forgetRoom(code);
        return;
      }
      case "host-gone":
        if (r.host) return; // our own echo
        dropLocalPeers(code);
        return;
    }
  }

  bus.onRemote?.(onRemote);

  return {
    onMessage,
    onClose,
    onRemote,
    stats: () => ({ rooms: rooms.size, sockets: meta.size }),
  };
}

// Bus for a single-process server: every socket is already in the same
// place, so publishing is a no-op and rooms are just a set of codes.

function createMemoryBus() {
  const codes = new Set();
  return {
    async claimRoom(code) {
      if (codes.has(code)) return false;
      codes.add(code);
      return true;
    },
    async roomExists(code) {
      return codes.has(code);
    },
    keepRoom() {},
    releaseRoom(code) {
      codes.delete(code);
    },
    publish() {},
    subscribe() {},
    unsubscribe() {},
    onRemote() {},
  };
}

// Bus backed by Deno KV, so a room works no matter which instance a
// player's socket lands in (Deno Deploy runs several at once, and
// BroadcastChannel does not carry between them).
//
// Layout:
//   ["room", code]        -> lease; the room exists while this key lives
//   ["msg", code, id]     -> one message, id sorts by time, expires fast
//   ["pulse", code]       -> bumped on every message; instances watch it

const ROOM_LEASE_MS = 60_000;
const MESSAGE_TTL_MS = 60_000;
// kv.watch() is the fast path, but it does not always carry between
// instances — so a room's stream is also read on a short timer.
const POLL_MS = 350;
// How far back each read looks; anything older has already been handled.
const LOOKBACK_MS = 10_000;

type RemoteHandler = (code: string, msg: unknown) => void;

async function createKvBus(log: (line: string) => void = () => {}) {
  // KV_PATH is only set when running two instances locally against one
  // database to rehearse what Deno Deploy does; in production it's unset
  // and Deno Deploy hands over the hosted database.
  // @ts-ignore - Deno global, only present on the server
  const kv = await Deno.openKv(Deno.env.get("KV_PATH") || undefined);

  let handler: RemoteHandler = () => {};
  const watching = new Map<string, AbortController>();
  // Ids this instance wrote — they come back through the watch and must
  // not be delivered twice.
  const mine = new Set<string>();
  // Ids already handled, pruned by their timestamp prefix.
  const seen = new Set<string>();

  const roomKey = (code: string) => ["room", code];
  const pulseKey = (code: string) => ["pulse", code];
  const msgPrefix = (code: string) => ["msg", code];

  const prune = (set: Set<string>) => {
    if (set.size < 400) return;
    const cutoff = Date.now() - MESSAGE_TTL_MS;
    for (const id of set) {
      const ts = Number(id.slice(0, 13));
      if (!Number.isNaN(ts) && ts < cutoff) set.delete(id);
    }
  };

  async function drain(code: string): Promise<void> {
    // Only the recent tail — everything older is already handled and on
    // its way out of the store anyway.
    const from = String(Date.now() - LOOKBACK_MS);
    const entries = kv.list({
      prefix: msgPrefix(code),
      start: [...msgPrefix(code), from],
    });
    for await (const entry of entries) {
      const id = String(entry.key[entry.key.length - 1]);
      if (seen.has(id)) continue;
      seen.add(id);
      if (mine.has(id)) continue;
      handler(code, entry.value);
    }
    prune(seen);
    prune(mine);
  }

  return {
    async claimRoom(code: string): Promise<boolean> {
      const res = await kv
        .atomic()
        .check({ key: roomKey(code), versionstamp: null })
        .set(roomKey(code), { at: Date.now() }, { expireIn: ROOM_LEASE_MS })
        .commit();
      return res.ok === true;
    },

    async roomExists(code: string): Promise<boolean> {
      const res = await kv.get(roomKey(code));
      return res.value !== null;
    },

    keepRoom(code: string): void {
      kv.set(roomKey(code), { at: Date.now() }, { expireIn: ROOM_LEASE_MS }).catch(() => {});
    },

    releaseRoom(code: string): void {
      kv.delete(roomKey(code)).catch(() => {});
    },

    publish(code: string, msg: unknown): void {
      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
      mine.add(id);
      seen.add(id);
      kv.set([...msgPrefix(code), id], msg, { expireIn: MESSAGE_TTL_MS })
        .then(() => kv.set(pulseKey(code), id, { expireIn: MESSAGE_TTL_MS }))
        .catch(() => {});
    },

    // Start following a room's message stream.
    subscribe(code: string): void {
      if (watching.has(code)) return;
      const controller = new AbortController();
      watching.set(code, controller);

      // fast path: push notifications from KV
      (async () => {
        try {
          await drain(code);
          const stream = kv.watch([pulseKey(code)]);
          for await (const _entries of stream) {
            if (controller.signal.aborted) break;
            await drain(code);
          }
        } catch (e) {
          log(`watch ${code} stopped: ${e}`);
        }
      })();

      // safety net: read the tail on a timer as well
      let busy = false;
      const timer = setInterval(async () => {
        if (busy || controller.signal.aborted) return;
        busy = true;
        try {
          await drain(code);
        } catch {
          // transient KV error; the next tick tries again
        } finally {
          busy = false;
        }
      }, POLL_MS);
      controller.signal.addEventListener("abort", () => clearInterval(timer));
    },

    unsubscribe(code: string): void {
      const controller = watching.get(code);
      if (!controller) return;
      controller.abort();
      watching.delete(code);
    },

    onRemote(cb: RemoteHandler): void {
      handler = cb;
    },
  };
}

// Deno Deploy entry point for the room relay.
//
// Deploy: console.deno.com -> the app's entrypoint is this file, or paste
// server/relay-single.ts into a playground. The app then talks to
// wss://<your-app>.deno.net/ws
//
// Deno Deploy runs several instances of an app at once and a room's
// players can land in different ones, so rooms live in Deno KV — see
// kv-bus.ts. This file only wires sockets to the relay core.







const log = (line: string) => console.log(`[relay] ${line}`);

// Rooms are shared between instances through KV. If no KV database is
// attached to the app, keep running with rooms held in one instance —
// players who land elsewhere are told the room doesn't exist, which
// beats the whole relay being down.
let shared = true;
let bus;
try {
  bus = await createKvBus(log);
  log("rooms are shared through KV");
} catch (e) {
  shared = false;
  bus = createMemoryBus();
  log(`NO KV DATABASE ATTACHED (${e}) — rooms stay inside a single instance`);
}

const relay = createRelay({ bus, log });

const CORS = {
  "access-control-allow-origin": "*",
  "access-control-allow-headers": "*",
};

// PORT is only used when running this locally; Deno Deploy sets its own.
const port = Number(Deno.env.get("PORT") ?? 8000);

Deno.serve({ port }, (req: Request) => {
  const url = new URL(req.url);

  if (url.pathname === "/ws") {
    if (req.headers.get("upgrade")?.toLowerCase() !== "websocket") {
      return new Response("expected websocket", { status: 400, headers: CORS });
    }
    const { socket, response } = Deno.upgradeWebSocket(req);
    socket.onmessage = (e: MessageEvent) => relay.onMessage(socket, e.data);
    socket.onclose = () => relay.onClose(socket);
    socket.onerror = () => relay.onClose(socket);
    return response;
  }

  // Health page — the numbers are per instance; `shared` says whether
  // rooms are visible to the other instances.
  if (url.pathname === "/" || url.pathname === "/health") {
    return new Response(JSON.stringify({ ok: true, shared, ...relay.stats() }), {
      headers: { "content-type": "application/json", ...CORS },
    });
  }

  return new Response("not found", { status: 404, headers: CORS });
});
