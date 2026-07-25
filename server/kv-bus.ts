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

export async function createKvBus(log: (line: string) => void = () => {}) {
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
