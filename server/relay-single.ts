// @ts-nocheck
// GENERATED — do not edit. Built by scripts/build-relay-single.mjs
// from server/relay-core.mjs + server/relay.ts.
//
// Paste this whole file into a Deno Deploy playground and hit Save.
// Room relay — the "postman" between phones. It knows nothing about the
// game: the host's phone stays the only authority, this just carries
// messages between the host and the players in a room.
//
// Platform-independent core. The Deno and Node entry points wrap it with
// their own WebSocket API; `broadcast` is only used on Deno Deploy, where
// a deployment can run several isolates and a room may be split across
// them (no-op elsewhere).

const MAX_PEERS_PER_ROOM = 15;
const MAX_MESSAGE_BYTES = 16 * 1024;
// How long a JOIN waits for an isolate that holds the room to answer.
const REMOTE_JOIN_TIMEOUT_MS = 1200;

function createRelay({ broadcast = () => {}, log = () => {} } = {}) {
  /**
   * code -> {
   *   host: sock | null,          // set when the host is on THIS isolate
   *   peers: Map<peerId, sock>,   // players on THIS isolate
   *   remote: boolean             // room is hosted on another isolate
   * }
   */
  const rooms = new Map();
  // sock -> { role: "host" | "peer", code, peerId }
  const meta = new Map();
  // reqId -> { resolve, timer } for cross-isolate JOINs
  const pendingJoins = new Map();
  let peerSeq = 1;

  const room = (code) => rooms.get(code) ?? null;

  const newCode = () => {
    for (let i = 0; i < 40; i++) {
      const code = String(Math.floor(1000 + Math.random() * 9000));
      if (!rooms.has(code)) return code;
    }
    return null;
  };

  const send = (sock, obj) => {
    try {
      sock.send(JSON.stringify(obj));
    } catch {
      // socket is closing; the close handler cleans up
    }
  };

  const closeRoom = (code) => {
    const r = room(code);
    if (!r) return;
    for (const peer of r.peers.values()) {
      meta.delete(peer);
      try {
        peer.close();
      } catch {}
    }
    rooms.delete(code);
  };

  // ---- messages coming from a socket ----

  function onMessage(sock, raw) {
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
      const code = newCode();
      if (!code) {
        send(sock, { t: "ERR", reason: "no-code" });
        return;
      }
      rooms.set(code, { host: sock, peers: new Map(), remote: false });
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
      const r = room(code);
      if (r && r.host) {
        if (r.peers.size >= MAX_PEERS_PER_ROOM) {
          send(sock, { t: "ERR", reason: "full" });
          return;
        }
        const peerId = `p${peerSeq++}`;
        r.peers.set(peerId, sock);
        meta.set(sock, { role: "peer", code, peerId });
        send(sock, { t: "JOINED", peerId });
        send(r.host, { t: "PEER_JOIN", peer: peerId });
        return;
      }
      // Maybe another isolate holds this room — ask around.
      const reqId = `${Date.now().toString(36)}-${peerSeq++}`;
      const timer = setTimeout(() => {
        pendingJoins.delete(reqId);
        send(sock, { t: "ERR", reason: "no-room" });
        try {
          sock.close();
        } catch {}
      }, REMOTE_JOIN_TIMEOUT_MS);
      pendingJoins.set(reqId, { sock, code, timer });
      broadcast({ k: "join-req", code, reqId });
      return;
    }

    if (!info) return;

    // ---- in-room traffic ----
    if (msg.t === "MSG") {
      if (info.role === "host") {
        const r = room(info.code);
        if (!r) return;
        if (msg.to === "all") {
          for (const peer of r.peers.values()) send(peer, { t: "MSG", data: msg.data });
          broadcast({ k: "to-peer", code: info.code, to: "all", data: msg.data });
        } else {
          const peer = r.peers.get(msg.to);
          if (peer) send(peer, { t: "MSG", data: msg.data });
          else broadcast({ k: "to-peer", code: info.code, to: msg.to, data: msg.data });
        }
      } else {
        const r = room(info.code);
        if (r?.host) send(r.host, { t: "MSG", from: info.peerId, data: msg.data });
        else broadcast({ k: "to-host", code: info.code, from: info.peerId, data: msg.data });
      }
      return;
    }

    // ---- host kicks a player ----
    if (msg.t === "KICK" && info.role === "host") {
      const r = room(info.code);
      const peer = r?.peers.get(String(msg.peer));
      if (peer) {
        r.peers.delete(String(msg.peer));
        meta.delete(peer);
        try {
          peer.close();
        } catch {}
      } else {
        broadcast({ k: "kick", code: info.code, peer: String(msg.peer) });
      }
    }
  }

  // ---- socket closed ----

  function onClose(sock) {
    const info = meta.get(sock);
    meta.delete(sock);
    if (!info) return;
    const r = room(info.code);
    if (!r) return;

    if (info.role === "host") {
      log(`room ${info.code} closed`);
      broadcast({ k: "host-gone", code: info.code });
      closeRoom(info.code);
      return;
    }

    r.peers.delete(info.peerId);
    if (r.host) send(r.host, { t: "PEER_LEAVE", peer: info.peerId });
    else broadcast({ k: "peer-leave", code: info.code, peer: info.peerId });
    // A room we only mirror for remote players can go once it's empty.
    if (r.remote && r.peers.size === 0) rooms.delete(info.code);
  }

  // ---- messages from other isolates (Deno Deploy only) ----

  function onBroadcast(msg) {
    if (!msg || typeof msg !== "object") return;
    const r = room(msg.code);

    switch (msg.k) {
      case "join-req": {
        // Only the isolate that actually holds the host answers.
        if (!r?.host) return;
        if (r.peers.size >= MAX_PEERS_PER_ROOM) return;
        const peerId = `p${peerSeq++}-r`;
        // The player's socket lives on the asking isolate; remember the id
        // so traffic can be routed back through the channel.
        r.peers.set(peerId, null);
        send(r.host, { t: "PEER_JOIN", peer: peerId });
        broadcast({ k: "join-ok", reqId: msg.reqId, code: msg.code, peerId });
        return;
      }
      case "join-ok": {
        const pending = pendingJoins.get(msg.reqId);
        if (!pending) return;
        clearTimeout(pending.timer);
        pendingJoins.delete(msg.reqId);
        let mirror = room(msg.code);
        if (!mirror) {
          mirror = { host: null, peers: new Map(), remote: true };
          rooms.set(msg.code, mirror);
        }
        mirror.peers.set(msg.peerId, pending.sock);
        meta.set(pending.sock, { role: "peer", code: msg.code, peerId: msg.peerId });
        send(pending.sock, { t: "JOINED", peerId: msg.peerId });
        return;
      }
      case "to-peer": {
        if (!r) return;
        if (msg.to === "all") {
          for (const peer of r.peers.values()) if (peer) send(peer, { t: "MSG", data: msg.data });
        } else {
          const peer = r.peers.get(msg.to);
          if (peer) send(peer, { t: "MSG", data: msg.data });
        }
        return;
      }
      case "to-host": {
        if (!r?.host) return;
        send(r.host, { t: "MSG", from: msg.from, data: msg.data });
        return;
      }
      case "peer-leave": {
        if (!r?.host) return;
        r.peers.delete(msg.peer);
        send(r.host, { t: "PEER_LEAVE", peer: msg.peer });
        return;
      }
      case "kick": {
        const peer = r?.peers.get(msg.peer);
        if (!peer) return;
        r.peers.delete(msg.peer);
        meta.delete(peer);
        try {
          peer.close();
        } catch {}
        return;
      }
      case "host-gone": {
        if (!r || r.host) return;
        closeRoom(msg.code);
        return;
      }
    }
  }

  return {
    onMessage,
    onClose,
    onBroadcast,
    stats: () => ({ rooms: rooms.size, sockets: meta.size }),
  };
}

// Deno Deploy entry point for the room relay.
//
// Deploy: https://dash.deno.com -> New Project -> pick this repo and set
// the entrypoint to server/relay.ts. The app then talks to
// wss://<your-project>.deno.dev/ws
//
// This file runs on Deno (not on React Native), so it is kept out of the
// app's TypeScript project — see "exclude" in tsconfig.json.
//
// A deployment can run in several isolates, so rooms that end up split
// across them are stitched back together with a global BroadcastChannel.




const channel = new BroadcastChannel("imp-relay");

const relay = createRelay({
  broadcast: (msg: unknown) => {
    try {
      channel.postMessage(msg);
    } catch {
      // a single-isolate run doesn't need it
    }
  },
  log: (line: string) => console.log(line),
});

channel.onmessage = (event: MessageEvent) => relay.onBroadcast(event.data);

const CORS = {
  "access-control-allow-origin": "*",
  "access-control-allow-headers": "*",
};

Deno.serve((req: Request) => {
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

  // Tiny health page so the server can be checked from a browser.
  if (url.pathname === "/" || url.pathname === "/health") {
    return new Response(JSON.stringify({ ok: true, ...relay.stats() }), {
      headers: { "content-type": "application/json", ...CORS },
    });
  }

  return new Response("not found", { status: 404, headers: CORS });
});
