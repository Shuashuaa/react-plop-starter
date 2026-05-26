#!/usr/bin/env node
/**
 * Wrapper around `npx ampx sandbox`.
 * Watches amplify_outputs.json — whenever it changes (deploy complete), auto-runs sync-env.
 *
 * Usage: npm run sandbox
 */

import { spawn, execFileSync } from "child_process";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const syncScript = path.join(root, "scripts", "sync-amplify-env.mjs");

function syncEnv() {
  try {
    execFileSync(process.execPath, [syncScript], { cwd: root, stdio: "inherit" });
  } catch {
    // error already printed by the script
  }
}

// Watch the project root directory for changes to amplify_outputs.json.
// Watching the directory works even before the file is first created.
let debounce;
fs.watch(root, (event, filename) => {
  if (filename !== "amplify_outputs.json") return;
  clearTimeout(debounce);
  debounce = setTimeout(syncEnv, 800);
});

// Spawn ampx sandbox, forwarding all args (e.g. npm run sandbox -- --profile foo)
const child = spawn("npx", ["ampx", "sandbox", ...process.argv.slice(2)], {
  cwd: root,
  stdio: "inherit",
  shell: true,
});

process.on("SIGINT", () => child.kill("SIGINT"));
process.on("SIGTERM", () => child.kill("SIGTERM"));

child.on("exit", (code) => process.exit(code ?? 0));
