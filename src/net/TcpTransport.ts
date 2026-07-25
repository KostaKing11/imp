// Real networking over the local network (no internet, no server):
// - host runs a TCP server; clients connect and speak NDJSON
// - a 4-digit code is resolved to the host's IP via a UDP broadcast
// The native modules don't exist inside Expo Go, so everything is
// lazy-required and gated behind nativeNetAvailable().

import { Platform } from "react-native";
import {
  DISCOVERY_PORT,
  DiscoveryReply,
  DiscoveryRequest,
  GAME_PORT,
} from "./protocol";
import { MessageHandler, PeerHandler, Transport } from "./transport";

/* eslint-disable @typescript-eslint/no-explicit-any */

// Both libraries end their entry file with `module.exports = ...`, so the
// real API sits on the module itself — `.default` is undefined. Take
// whichever of the two actually carries the factory function.
function tcpLib(): any | null {
  // Browsers have no raw sockets — the web build is one-phone only.
  if (Platform.OS === "web") return null;
  try {
    // Throws inside Expo Go (native module missing).
    const lib = require("react-native-tcp-socket");
    const api = typeof lib?.createServer === "function" ? lib : lib?.default;
    return typeof api?.createServer === "function" ? api : null;
  } catch {
    return null;
  }
}

function udpLib(): any | null {
  if (Platform.OS === "web") return null;
  try {
    const lib = require("react-native-udp");
    const api = typeof lib?.createSocket === "function" ? lib : lib?.default;
    return typeof api?.createSocket === "function" ? api : null;
  } catch {
    return null;
  }
}

export function nativeNetAvailable(): boolean {
  try {
    const Constants = require("expo-constants").default;
    if (Constants?.appOwnership === "expo") return false; // Expo Go
  } catch {
    // no expo-constants -> assume bare build
  }
  return tcpLib() !== null && udpLib() !== null;
}

// ---- NDJSON framing over a socket ----

function attachNdjson(socket: any, onMsg: (msg: unknown) => void): void {
  let buffer = "";
  socket.on("data", (data: any) => {
    buffer += data.toString("utf8");
    let idx = buffer.indexOf("\n");
    while (idx >= 0) {
      const line = buffer.slice(0, idx).trim();
      buffer = buffer.slice(idx + 1);
      if (line.length > 0) {
        try {
          onMsg(JSON.parse(line));
        } catch {
          // ignore malformed lines
        }
      }
      idx = buffer.indexOf("\n");
    }
  });
}

function writeMsg(socket: any, msg: unknown): void {
  try {
    socket.write(JSON.stringify(msg) + "\n");
  } catch {
    // socket is closing — the leave handler will fire
  }
}

// ---- host side ----

export class TcpHostTransport implements Transport {
  // Raw sockets can die silently — the room pings to notice.
  readonly needsHeartbeat = true;
  private server: any = null;
  private udp: any = null;
  private sockets = new Map<string, any>();
  private nextPeer = 1;
  private messageCb: MessageHandler = () => {};
  private joinCb: PeerHandler = () => {};
  private leaveCb: PeerHandler = () => {};
  port = GAME_PORT;

  // Starts the TCP server and the UDP discovery responder.
  async start(code: string, roomId: string, hostName: string): Promise<void> {
    const TcpSocket = tcpLib();
    const dgram = udpLib();
    if (!TcpSocket || !dgram) throw new Error("native-net-unavailable");

    await new Promise<void>((resolve, reject) => {
      let attempts = 0;
      const tryListen = (port: number) => {
        const server = TcpSocket.createServer((socket: any) => {
          const peerId = `p${this.nextPeer++}`;
          this.sockets.set(peerId, socket);
          attachNdjson(socket, (msg) => this.messageCb(peerId, msg));
          const drop = () => {
            if (this.sockets.delete(peerId)) this.leaveCb(peerId);
          };
          socket.on("error", drop);
          socket.on("close", drop);
          this.joinCb(peerId);
        });
        server.on("error", () => {
          attempts += 1;
          if (attempts < 5) tryListen(port + 1);
          else reject(new Error("tcp-listen-failed"));
        });
        server.listen({ port, host: "0.0.0.0" }, () => {
          this.server = server;
          this.port = port;
          resolve();
        });
      };
      tryListen(GAME_PORT);
    });

    // Discovery responder: answer WHO broadcasts that carry our code.
    this.udp = dgram.createSocket({ type: "udp4" });
    this.udp.bind(DISCOVERY_PORT);
    this.udp.once("listening", () => {
      try {
        this.udp.setBroadcast(true);
      } catch {
        // not fatal — we only unicast replies
      }
    });
    this.udp.on("message", (data: any, rinfo: any) => {
      try {
        const req = JSON.parse(data.toString("utf8")) as DiscoveryRequest;
        if (req.t === "WHO" && req.code === code) {
          const reply: DiscoveryReply = {
            t: "ROOM",
            code,
            roomId,
            port: this.port,
            hostName,
          };
          this.udp.send(
            JSON.stringify(reply),
            undefined,
            undefined,
            rinfo.port,
            rinfo.address
          );
        }
      } catch {
        // ignore malformed packets
      }
    });
    this.udp.on("error", () => {
      // discovery is best-effort; QR join still works
    });
  }

  send(to: string, msg: unknown): void {
    if (to === "all") {
      for (const s of this.sockets.values()) writeMsg(s, msg);
    } else {
      const s = this.sockets.get(to);
      if (s) writeMsg(s, msg);
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
  // Kick: drop the socket without firing onPeerLeave (the room has
  // already removed that player).
  kick(peerId: string): void {
    const s = this.sockets.get(peerId);
    if (!s) return;
    this.sockets.delete(peerId);
    try {
      s.destroy();
    } catch {}
  }
  close(): void {
    try {
      this.udp?.close();
    } catch {}
    for (const s of this.sockets.values()) {
      try {
        s.destroy();
      } catch {}
    }
    this.sockets.clear();
    try {
      this.server?.close();
    } catch {}
  }
}

// ---- client side ----

export class TcpClientTransport implements Transport {
  readonly needsHeartbeat = true;
  private socket: any = null;
  private messageCb: MessageHandler = () => {};
  private joinCb: PeerHandler = () => {};
  private leaveCb: PeerHandler = () => {};

  async connect(ip: string, port: number, timeoutMs = 6000): Promise<void> {
    const TcpSocket = tcpLib();
    if (!TcpSocket) throw new Error("native-net-unavailable");

    await new Promise<void>((resolve, reject) => {
      const timer = setTimeout(() => {
        try {
          socket.destroy();
        } catch {}
        reject(new Error("connect-timeout"));
      }, timeoutMs);
      const socket = TcpSocket.createConnection({ host: ip, port }, () => {
        clearTimeout(timer);
        this.socket = socket;
        attachNdjson(socket, (msg) => this.messageCb("host", msg));
        const drop = () => this.leaveCb("host");
        socket.on("error", drop);
        socket.on("close", drop);
        this.joinCb("host");
        resolve();
      });
      socket.on("error", (e: any) => {
        clearTimeout(timer);
        reject(e instanceof Error ? e : new Error("connect-failed"));
      });
    });
  }

  send(_to: string, msg: unknown): void {
    if (this.socket) writeMsg(this.socket, msg);
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
    try {
      this.socket?.destroy();
    } catch {}
    this.socket = null;
  }
}

// ---- discovery (client side) ----

// Broadcasts WHO for `code` and collects distinct room replies. Returns
// every distinct room found so the UI can offer a choice when two rooms
// on the network share the same 4-digit code.
export async function discoverRooms(
  code: string,
  timeoutMs = 1500
): Promise<{ ip: string; port: number; roomId: string; hostName: string }[]> {
  // Our own subnet's broadcast address (192.168.1.42 -> 192.168.1.255) is
  // the most reliable target on Android; the rest are fallbacks.
  let subnetBroadcast: string | null = null;
  try {
    const Network = require("expo-network");
    const ip: string = await Network.getIpAddressAsync();
    const m = ip?.match(/^(\d+\.\d+\.\d+)\.\d+$/);
    if (m) subnetBroadcast = `${m[1]}.255`;
  } catch {
    // no expo-network / no IP — fall back to the generic broadcasts
  }

  return new Promise((resolve) => {
    const dgram = udpLib();
    if (!dgram) {
      resolve([]);
      return;
    }
    const found = new Map<string, { ip: string; port: number; roomId: string; hostName: string }>();
    let sock: any;
    try {
      sock = dgram.createSocket({ type: "udp4" });
    } catch {
      resolve([]);
      return;
    }
    const finish = () => {
      try {
        sock.close();
      } catch {}
      resolve([...found.values()]);
    };
    const timer = setTimeout(finish, timeoutMs);
    sock.on("error", () => {
      clearTimeout(timer);
      finish();
    });
    sock.on("message", (data: any, rinfo: any) => {
      try {
        const reply = JSON.parse(data.toString("utf8")) as DiscoveryReply;
        if (reply.t === "ROOM" && reply.code === code) {
          found.set(reply.roomId, {
            ip: rinfo.address,
            port: reply.port,
            roomId: reply.roomId,
            hostName: reply.hostName,
          });
        }
      } catch {
        // ignore malformed packets
      }
    });
    sock.bind(0, () => {
      try {
        sock.setBroadcast(true);
      } catch {}
      const req: DiscoveryRequest = { t: "WHO", code };
      const payload = JSON.stringify(req);
      // Our own subnet first, then the global broadcast and the usual
      // hotspot ranges for good measure.
      const targets = [
        ...(subnetBroadcast ? [subnetBroadcast] : []),
        "255.255.255.255",
        "192.168.43.255",
        "192.168.49.255",
      ];
      const blast = () => {
        for (const addr of targets) {
          try {
            sock.send(payload, undefined, undefined, DISCOVERY_PORT, addr);
          } catch {}
        }
      };
      blast();
      // Re-send twice — UDP broadcast is lossy.
      setTimeout(blast, Math.floor(timeoutMs / 3));
      setTimeout(blast, Math.floor((timeoutMs * 2) / 3));
    });
  });
}
