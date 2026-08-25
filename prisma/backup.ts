import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("DATABASE_URL is not set.");
  process.exit(1);
}

const dir = path.join(process.cwd(), "backups");
fs.mkdirSync(dir, { recursive: true });

const stamp = new Date().toISOString().replace(/[:.]/g, "-");
const out = path.join(dir, `portal-${stamp}.sql`);

// pg_dump ships inside the docker-compose postgres container, so no local
// Postgres client install is required.
execFileSync(
  "docker",
  ["compose", "exec", "-T", "db", "pg_dump", "-U", "portal", "portal_dev"],
  { stdio: ["ignore", fs.openSync(out, "w"), "inherit"] }
);

const bytes = fs.statSync(out).size;
if (bytes < 1024) {
  console.error(`Backup looks empty (${bytes} bytes) — aborting.`);
  process.exit(1);
}
console.log(`Backup written: ${out} (${bytes} bytes)`);
