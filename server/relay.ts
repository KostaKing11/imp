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
import { createKvBus } from "./kv-bus.ts";

const log = (line: string) => console.log(`[relay] ${line}`);
const bus = await createKvBus(log);
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

  // Health page — instances are separate, so the numbers are per instance.
  if (url.pathname === "/" || url.pathname === "/health") {
    return new Response(JSON.stringify({ ok: true, ...relay.stats() }), {
      headers: { "content-type": "application/json", ...CORS },
    });
  }

  return new Response("not found", { status: 404, headers: CORS });
});
