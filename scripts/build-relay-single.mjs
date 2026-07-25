// Glues the relay into ONE self-contained file (server/relay-single.ts),
// for pasting straight into a Deno Deploy playground — no repo, no build
// step, nothing to configure.
//
//   node scripts/build-relay-single.mjs

import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const read = (file) => readFileSync(join(root, file), "utf8");

// Everything is inlined, so the parts must not export and the entry must
// not import them.
const strip = (src) => src.replace(/^export /gm, "");
const inlinedCore = strip(read("server/relay-core.mjs"));
const inlinedBus = strip(read("server/kv-bus.ts"));
const inlinedEntry = read("server/relay.ts")
  .replace(/^\/\/ @ts-ignore.*$/gm, "")
  .replace(/^import .*from "\.\/(relay-core\.mjs|kv-bus\.ts)";$/gm, "");

// The inlined core is plain JavaScript, so type checking is turned off
// for the merged file.
const out = `// @ts-nocheck
// GENERATED — do not edit. Built by scripts/build-relay-single.mjs
// from server/relay-core.mjs + server/relay.ts.
//
// Paste this whole file into a Deno Deploy playground and hit Save.
${inlinedCore}
${inlinedBus}
${inlinedEntry}`;

writeFileSync(join(root, "server/relay-single.ts"), out);
console.log("wrote server/relay-single.ts");
