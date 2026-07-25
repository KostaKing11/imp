// Online transport: both phones talk to a small relay over WebSockets.
// Works in the installed app AND in the browser (the iPhone web version),
// so an iPhone and an Android can sit in the same room.
//
// The relay never looks at the game — the host's phone stays the single
// source of truth, exactly like on the local-Wi-Fi transport.

import { MessageHandler, PeerHandler, Transport } from "./transport";

const CONNECT_TIMEOUT_MS = 8000;

type RelayMsg =
  | { t: "HOSTED"; code: string }
  | { t: "JOINED"; peerId: string }
  | { t: "PEER_JOIN"; peer: string }
  | { t: "PEER_LEAVE"; peer: string }
  | { t: "MSG"; from?: string; data: unknown }
  | { t: "ERR"; reason: string };

function openSocket(url: string): Promise<WebSocket> {
  return new Promise((resolve, reject) => {
    let socket: WebSocket;
    try {
      socket = new WebSocket(url);
    } catch (e) {
      reject(e instanceof Error ? e : new Error("relay-unreachable"));
      return;
    }
    const timer = setTimeout(() => {
      try {
        socket.close();
      } catch {}
      reject(new Error("relay-timeout"));
    }, CONNECT_TIMEOUT_MS);
    socket.onopen = () => {
      clearTimeout(timer);
      resolve(socket);
    };
    socket.onerror = () => {
      clearTimeout(timer);
      reject(new Error("relay-unreachable"));
    };
  });
}

export class WsHostTransport implements Transport {
  private socket: WebSocket | null = null;
  private messageCb: MessageHandler = () => {};
  private joinCb: PeerHandler = () => {};
  private leaveCb: PeerHandler = () => {};
  private closed = false;
  private peers = new Set<string>();
  code = "";

  // Opens a room and resolves with the code the relay assigned.
  async start(url: string): Promise<string> {
    const socket = await openSocket(url);
    this.socket = socket;

    const code = await new Promise<string>((resolve, reject) => {
      const timer = setTimeout(() => reject(new Error("relay-timeout")), CONNECT_TIMEOUT_MS);
      socket.onmessage = (event) => {
        const msg = parse(event.data);
        if (!msg) return;
        if (msg.t === "HOSTED") {
          clearTimeout(timer);
          resolve(msg.code);
        } else if (msg.t === "ERR") {
          clearTimeout(timer);
          reject(new Error(msg.reason));
        }
      };
      socket.onerror = () => {
        clearTimeout(timer);
        reject(new Error("relay-unreachable"));
      };
      socket.send(JSON.stringify({ t: "HOST" }));
    });

    this.code = code;
    socket.onmessage = (event) => {
      const msg = parse(event.data);
      if (!msg) return;
      if (msg.t === "PEER_JOIN") {
        this.peers.add(msg.peer);
        this.joinCb(msg.peer);
      } else if (msg.t === "PEER_LEAVE") {
        this.peers.delete(msg.peer);
        this.leaveCb(msg.peer);
      } else if (msg.t === "MSG" && msg.from) {
        this.messageCb(msg.from, msg.data);
      }
    };
    socket.onclose = () => this.dropAll();
    socket.onerror = () => this.dropAll();
    return code;
  }

  private dropAll(): void {
    if (this.closed) return;
    this.closed = true;
    // Losing the relay means losing every player at once.
    for (const peer of [...this.peers]) {
      this.peers.delete(peer);
      this.leaveCb(peer);
    }
  }

  send(to: string, msg: unknown): void {
    if (!this.socket || this.closed) return;
    try {
      this.socket.send(JSON.stringify({ t: "MSG", to, data: msg }));
    } catch {
      // closing
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
  kick(peerId: string): void {
    if (!this.socket || this.closed) return;
    try {
      this.socket.send(JSON.stringify({ t: "KICK", peer: peerId }));
    } catch {}
  }
  close(): void {
    this.closed = true;
    try {
      this.socket?.close();
    } catch {}
    this.socket = null;
  }
}

export class WsClientTransport implements Transport {
  private socket: WebSocket | null = null;
  private messageCb: MessageHandler = () => {};
  private joinCb: PeerHandler = () => {};
  private leaveCb: PeerHandler = () => {};
  private closed = false;

  async connect(url: string, code: string): Promise<void> {
    const socket = await openSocket(url);
    this.socket = socket;

    await new Promise<void>((resolve, reject) => {
      const timer = setTimeout(() => reject(new Error("relay-timeout")), CONNECT_TIMEOUT_MS);
      socket.onmessage = (event) => {
        const msg = parse(event.data);
        if (!msg) return;
        if (msg.t === "JOINED") {
          clearTimeout(timer);
          resolve();
        } else if (msg.t === "ERR") {
          clearTimeout(timer);
          reject(new Error(msg.reason));
        }
      };
      socket.onerror = () => {
        clearTimeout(timer);
        reject(new Error("relay-unreachable"));
      };
      socket.send(JSON.stringify({ t: "JOIN", code }));
    });

    socket.onmessage = (event) => {
      const msg = parse(event.data);
      if (msg?.t === "MSG") this.messageCb("host", msg.data);
    };
    socket.onclose = () => this.hostGone();
    socket.onerror = () => this.hostGone();
    this.joinCb("host");
  }

  private hostGone(): void {
    if (this.closed) return;
    this.closed = true;
    this.leaveCb("host");
  }

  send(_to: string, msg: unknown): void {
    if (!this.socket || this.closed) return;
    try {
      this.socket.send(JSON.stringify({ t: "MSG", data: msg }));
    } catch {}
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
  close(): void {
    this.closed = true;
    try {
      this.socket?.close();
    } catch {}
    this.socket = null;
  }
}

function parse(data: unknown): RelayMsg | null {
  if (typeof data !== "string") return null;
  try {
    const msg = JSON.parse(data);
    return msg && typeof msg === "object" ? (msg as RelayMsg) : null;
  } catch {
    return null;
  }
}
