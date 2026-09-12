// PWA-SW-1. The explicit allowlist behind next.config.js's Serwist setup,
// extracted so it can be required by both next.config.js (CommonJS, no
// build step) and its guard test. See docs/context/PWA_SW_DESIGN.md.
//
// This is the ONLY place that decides what goes into the precache. Nothing
// here is derived by scanning the whole build output — every entry is
// either a webpack entry/chunk name Next.js itself uses for one of the
// seven OFFLINE_SAFE calculators (plus their two navigational shells and
// the shared app shell), or a source file this repo owns directly.
const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");
const { execFileSync } = require("node:child_process");

// Exactly the seven routes PWA_AUDIT.md classified OFFLINE_SAFE, plus the
// two STATIC_SAFE shells a reader needs to reach them from start_url.
const OFFLINE_SAFE_ROUTES = [
  "/tools/tax-calculator",
  "/tools/prc-calculator",
  "/tools/da-arrears",
  "/tools/gpf-apgli",
  "/tools/leave-encashment",
  "/pensioners/pension-calculator",
  "/pensioners/commutation-tracker",
];

const STATIC_SHELL_ROUTES = ["/tools", "/pensioners"];

// The webpack chunk/entry names that back the routes above. Next.js names
// an App Router page's webpack entry "app" + its route path (verified by
// reading next/dist/server/get-app-route-from-entrypoint.js and cross-checking
// against .next/app-build-manifest.json's own page keys) — so this list is
// not a guess, it is that same naming rule applied to the routes above.
// "webpack" and "main-app" are the shared runtime chunks every page depends
// on; "app/layout" is the root layout that owns globals.css; "app/(public)/layout"
// is the public shell every one of these routes renders inside.
const OFFLINE_CHUNKS = [
  "webpack",
  "main-app",
  "app/layout",
  "app/(public)/layout",
  "app/(public)/tools/page",
  "app/(public)/pensioners/page",
  "app/(public)/tools/tax-calculator/page",
  "app/(public)/tools/prc-calculator/page",
  "app/(public)/tools/da-arrears/page",
  "app/(public)/tools/gpf-apgli/page",
  "app/(public)/tools/leave-encashment/page",
  "app/(public)/pensioners/pension-calculator/page",
  "app/(public)/pensioners/commutation-tracker/page",
];

/**
 * Deterministic, build-stable revision for non-hashed document URLs, so a
 * new deployment invalidates old calculator HTML without a random value
 * changing on every build for no reason.
 */
function getBuildRevision() {
  if (process.env.RAILWAY_GIT_COMMIT_SHA) return process.env.RAILWAY_GIT_COMMIT_SHA;
  try {
    return execFileSync("git", ["rev-parse", "HEAD"], { cwd: __dirname }).toString().trim();
  } catch {
    // No git and no platform-provided SHA (e.g. a source-only deploy
    // artifact). Fall back to hashing the calculator/shell source so the
    // revision still changes exactly when that content does.
    const hash = crypto.createHash("sha256");
    for (const route of [...OFFLINE_SAFE_ROUTES, ...STATIC_SHELL_ROUTES]) {
      const dir = path.join(__dirname, "..", "..", "app", "(public)", ...route.split("/").filter(Boolean));
      if (fs.existsSync(dir)) hash.update(walkAndHash(dir));
    }
    return hash.digest("hex").slice(0, 12);
  }
}

function walkAndHash(dir) {
  let out = "";
  for (const entry of fs.readdirSync(dir, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))) {
    const full = path.join(dir, entry.name);
    out += entry.isDirectory() ? walkAndHash(full) : fs.readFileSync(full).toString("base64");
  }
  return out;
}

function hashFile(absPath) {
  return crypto.createHash("sha256").update(fs.readFileSync(absPath)).digest("hex").slice(0, 16);
}

/**
 * The static, source-controlled PWA assets — never build output, so their
 * revision comes from hashing the actual source file, not a build ID.
 */
function getStaticAssetEntries(cwd) {
  const entries = [
    { file: path.join(cwd, "app", "icon.svg"), url: "/icon.svg" },
    { file: path.join(cwd, "app", "apple-icon.png"), url: "/apple-icon.png" },
    { file: path.join(cwd, "app", "manifest.ts"), url: "/manifest.webmanifest" },
  ];
  const iconsDir = path.join(cwd, "public", "icons");
  if (fs.existsSync(iconsDir)) {
    for (const name of fs.readdirSync(iconsDir).sort()) {
      entries.push({ file: path.join(iconsDir, name), url: `/icons/${name}` });
    }
  }
  return entries
    .filter((e) => fs.existsSync(e.file))
    .map((e) => ({ url: e.url, revision: hashFile(e.file) }));
}

/**
 * The seven calculator documents plus their two navigational shells,
 * revisioned by build/commit so a deploy that changes their HTML replaces
 * the precached copy instead of leaving it stale indefinitely.
 */
function getDocumentEntries(revision) {
  return [...OFFLINE_SAFE_ROUTES, ...STATIC_SHELL_ROUTES].map((url) => ({ url, revision }));
}

function getAdditionalPrecacheEntries(cwd) {
  const revision = getBuildRevision();
  return [...getDocumentEntries(revision), ...getStaticAssetEntries(cwd)];
}

module.exports = {
  OFFLINE_SAFE_ROUTES,
  STATIC_SHELL_ROUTES,
  OFFLINE_CHUNKS,
  getBuildRevision,
  getAdditionalPrecacheEntries,
};
