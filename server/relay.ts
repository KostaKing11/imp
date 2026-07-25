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

// @ts-ignore - plain JS module, typed loosely on purpose
import { createRelay } from "./relay-core.mjs";

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
