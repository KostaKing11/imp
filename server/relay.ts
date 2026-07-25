// Deno Deploy entry point for the room relay.
//
// Deploy: console.deno.com -> the app's entrypoint is this file, or paste
// server/relay-single.ts into a playground. The app then talks to
// wss://<your-app>.deno.net/ws
//
// Deno Deploy runs several instances of an app at once and a room's
// players can land in different ones, so rooms live in Deno KV — see
// kv-bus.ts. This file only wires sockets to the relay core.

// @ts-ignore - plain JS module, typed loosely on purpose
import { createRelay } from "./relay-core.mjs";
// @ts-ignore - plain JS module
import { createMemoryBus } from "./memory-bus.mjs";
import { createKvBus } from "./kv-bus.ts";

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
