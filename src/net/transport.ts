// Transport abstraction — the game/room logic never touches sockets.
// TcpTransport implements this over the real network; MockTransport runs
// entirely in memory so screens can be developed without networking.

export type MessageHandler = (fromPeerId: string, msg: unknown) => void;
export type PeerHandler = (peerId: string) => void;

export interface Transport {
  // Host: peerId targets one client, "all" broadcasts. Client: always "host".
  send(to: string, msg: unknown): void;
  onMessage(cb: MessageHandler): void;
  onPeerJoin(cb: PeerHandler): void;
  onPeerLeave(cb: PeerHandler): void;
  // Host only: drop one client's connection (kick).
  kick?(peerId: string): void;
  // True when the room has to ping to notice a dead connection. Raw TCP
  // needs it; the relay reports joins and leaves by itself.
  needsHeartbeat?: boolean;
  close(): void;
}

// ---- in-memory mock: one hub = one room ----

class MockEnd implements Transport {
  private messageCb: MessageHandler = () => {};
  private joinCb: PeerHandler = () => {};
  private leaveCb: PeerHandler = () => {};
  closed = false;

  constructor(private hub: MockHub, readonly id: string) {}

  send(to: string, msg: unknown): void {
    if (this.closed) return;
    // Deliver on a microtask so it behaves like a real async socket.
    Promise.resolve().then(() => this.hub.deliver(this.id, to, msg));
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
    if (this.closed) return;
    this.closed = true;
    this.hub.disconnect(this.id);
  }

  _receive(from: string, msg: unknown): void {
    if (!this.closed) this.messageCb(from, msg);
  }
  _peerJoined(peerId: string): void {
    if (!this.closed) this.joinCb(peerId);
  }
  _peerLeft(peerId: string): void {
    if (!this.closed) this.leaveCb(peerId);
  }
}

export class MockHub {
  private host: MockEnd | null = null;
  private clients = new Map<string, MockEnd>();
  private nextClient = 1;

  createHost(): Transport {
    this.host = new MockEnd(this, "host");
    return this.host;
  }

  // An explicit id lets a test bring the *same* phone back after a
  // disconnect, which is what a real one does — its peer id is its
  // anonymous account and survives the app being killed.
  createClient(id = `mock-${this.nextClient++}`): Transport {
    const end = new MockEnd(this, id);
    this.clients.set(id, end);
    Promise.resolve().then(() => this.host?._peerJoined(id));
    return end;
  }

  deliver(from: string, to: string, msg: unknown): void {
    if (from === "host") {
      if (to === "all") {
        for (const c of this.clients.values()) c._receive("host", msg);
      } else {
        this.clients.get(to)?._receive("host", msg);
      }
    } else {
      this.host?._receive(from, msg);
    }
  }

  disconnect(id: string): void {
    if (id === "host") {
      for (const c of this.clients.values()) c._peerLeft("host");
      this.host = null;
    } else {
      this.clients.delete(id);
      this.host?._peerLeft(id);
    }
  }
}
