#!/usr/bin/env node
/**
 * Reads amplify_outputs.json and upserts the four Cognito env vars into .env.local.
 * Existing lines in .env.local are preserved; only the four VITE_ keys are touched.
 *
 * Usage: npm run sync-env
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const outputsPath = path.join(root, "amplify_outputs.json");
const envPath = path.join(root, ".env.local");

if (!fs.existsSync(outputsPath)) {
  console.error("❌  amplify_outputs.json not found. Run `npx ampx sandbox` first.");
  process.exit(1);
}

const outputs = JSON.parse(fs.readFileSync(outputsPath, "utf8"));
const auth = outputs?.auth;

if (!auth) {
  console.error("❌  No `auth` block in amplify_outputs.json. Deploy auth resources first.");
  process.exit(1);
}

const updates = {
  VITE_USER_POOL_ID: auth.user_pool_id ?? "",
  VITE_USER_POOL_CLIENT_ID: auth.user_pool_client_id ?? "",
  VITE_AWS_REGION: auth.aws_region ?? "",
  VITE_IDENTITY_POOL_ID: auth.identity_pool_id ?? "",
};

// Parse existing .env.local, preserving all other vars
const existing = fs.existsSync(envPath) ? fs.readFileSync(envPath, "utf8") : "";
const lines = existing.split("\n");

const managed = new Set(Object.keys(updates));
const kept = lines.filter((l) => {
  const key = l.split("=")[0].trim();
  return !managed.has(key);
});

// Strip trailing blank lines from the kept block
while (kept.length && kept[kept.length - 1].trim() === "") kept.pop();

const injected = Object.entries(updates).map(([k, v]) => `${k}=${v}`);
const result = [...kept, ...(kept.length ? [""] : []), ...injected, ""].join("\n");

fs.writeFileSync(envPath, result, "utf8");

console.log("\n─────────────────────────────────────────────");
console.log("✅  .env.local updated:");
injected.forEach((l) => console.log("    " + l));

console.log("\n─────────────────────────────────────────────");
console.log("Next steps:");
console.log("\n  1. npm run dev");
console.log("  2. Open http://localhost:5173/login");
console.log("─────────────────────────────────────────────\n");
