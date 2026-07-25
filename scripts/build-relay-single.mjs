// Glues the relay into ONE self-contained file (server/relay-single.ts),
// for pasting straight into a Deno Deploy playground — no repo, no build
// step, nothing to configure.
//
//   node scripts/build-relay-single.mjs

import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const core = readFileSync(join(root, "server/relay-core.mjs"), "utf8");
const entry = readFileSync(join(root, "server/relay.ts"), "utf8");

// The core is inlined, so it must not export and the entry must not import.
const inlinedCore = core.replace(/^export /gm, "");
const inlinedEntry = entry
  .replace(/^\/\/ @ts-ignore.*$/gm, "")
  .replace(/^import \{ createRelay \} from "\.\/relay-core\.mjs";$/gm, "");

// The inlined core is plain JavaScript, so type checking is turned off
// for the merged file.
const out = `// @ts-nocheck
// GENERATED — do not edit. Built by scripts/build-relay-single.mjs
// from server/relay-core.mjs + server/relay.ts.
//
// Paste this whole file into a Deno Deploy playground and hit Save.
${inlinedCore}
${inlinedEntry}`;

writeFileSync(join(root, "server/relay-single.ts"), out);
console.log("wrote server/relay-single.ts");
