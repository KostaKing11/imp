// Node version of the relay — used for testing on this machine, and it
// also runs on any Node host (Render, Railway, a VPS...).
//
//   npm run relay        ->  ws://localhost:8790/ws
//
// The Deno Deploy build uses server/relay.ts instead; both share the same
// room logic in relay-core.mjs.

import { createServer } from "node:http";
import { WebSocketServer } from "ws";
import { createMemoryBus } from "./memory-bus.mjs";
import { createRelay } from "./relay-core.mjs";

const PORT = Number(process.env.PORT ?? 8790);

const relay = createRelay({
  // A single Node process holds every room — nothing has to cross over.
  bus: createMemoryBus(),
  log: (line) => console.log(`[relay] ${line}`),
});

const server = createServer((req, res) => {
  if (req.url === "/" || req.url === "/health") {
    res.writeHead(200, { "content-type": "application/json", "access-control-allow-origin": "*" });
    res.end(JSON.stringify({ ok: true, ...relay.stats() }));
    return;
  }
  res.writeHead(404);
  res.end("not found");
});

const wss = new WebSocketServer({ server, path: "/ws" });

wss.on("connection", (socket) => {
  socket.on("message", (data) => relay.onMessage(socket, data.toString()));
  socket.on("close", () => relay.onClose(socket));
  socket.on("error", () => relay.onClose(socket));
});

server.listen(PORT, () => {
  console.log(`[relay] listening on ws://localhost:${PORT}/ws`);
});
