// PWA-SW-1. Guards the *source* configuration — next.config.js, app/sw.ts,
// and the precache allowlist — against the specific regressions
// docs/context/PWA_SW_DESIGN.md exists to prevent. test/pwa-sw-manifest.test.ts
// separately checks the actual *built* public/sw.js, because config alone
// does not prove what shipped.
import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";
import {
  OFFLINE_SAFE_ROUTES,
  STATIC_SHELL_ROUTES,
  OFFLINE_FALLBACK_ROUTE,
  OFFLINE_CHUNKS,
  getBuildRevision,
} from "../lib/pwa/precache-config";

const ROOT = process.cwd();
const swSource = fs.readFileSync(path.join(ROOT, "app", "sw.ts"), "utf8");
const nextConfigSource = fs.readFileSync(path.join(ROOT, "next.config.js"), "utf8");

describe("PWA-SW-1 precache allowlist", () => {
  it("names exactly the seven OFFLINE_SAFE calculators from PWA_AUDIT.md", () => {
    expect(OFFLINE_SAFE_ROUTES.sort()).toEqual(
      [
        "/tools/tax-calculator",
        "/tools/prc-calculator",
        "/tools/da-arrears",
        "/tools/gpf-apgli",
        "/tools/leave-encashment",
        "/pensioners/pension-calculator",
        "/pensioners/commutation-tracker",
      ].sort()
    );
  });

  it("includes only the two STATIC_SAFE shells that reach those calculators", () => {
    expect(STATIC_SHELL_ROUTES.sort()).toEqual(["/tools", "/pensioners"].sort());
  });

  it("does not include cfms-checker, which is STATIC_SAFE but not offline-useful", () => {
    expect(OFFLINE_SAFE_ROUTES).not.toContain("/tools/cfms-checker");
    expect(STATIC_SHELL_ROUTES).not.toContain("/tools/cfms-checker");
  });

  it("does not name any freshness-sensitive or admin route", () => {
    const all = [...OFFLINE_SAFE_ROUTES, ...STATIC_SHELL_ROUTES, ...OFFLINE_CHUNKS];
    for (const entry of all) {
      expect(entry).not.toMatch(/^\/$|\/orders|\/search|\/category|\/posts|\/admin|\/api\/auth/);
    }
  });

  it("computes a stable, non-random build revision", () => {
    const a = getBuildRevision();
    const b = getBuildRevision();
    expect(a).toBe(b);
    expect(a).toMatch(/^[0-9a-f]+$/i);
  });
});

describe("PWA-SW-1 next.config.js", () => {
  it("does not import or spread Serwist's defaultCache", () => {
    expect(nextConfigSource).not.toMatch(/defaultCache/);
    expect(nextConfigSource).not.toMatch(/@serwist\/next\/worker/);
  });

  it("sets cacheOnNavigation and reloadOnOnline to false explicitly", () => {
    expect(nextConfigSource).toMatch(/cacheOnNavigation:\s*false/);
    expect(nextConfigSource).toMatch(/reloadOnOnline:\s*false/);
  });

  it("scopes the worker to \"/\"", () => {
    expect(nextConfigSource).toMatch(/scope:\s*["']\/["']/);
  });

  it("builds swDest at public/sw.js", () => {
    expect(nextConfigSource).toMatch(/swDest:\s*["']public\/sw\.js["']/);
  });

  it("disables the worker in development", () => {
    expect(nextConfigSource).toMatch(/disable:\s*process\.env\.NODE_ENV\s*===\s*["']development["']/);
  });

  it("scopes precached chunks with an explicit allowlist, not a blanket glob", () => {
    expect(nextConfigSource).toMatch(/chunks:\s*OFFLINE_CHUNKS/);
  });
});

describe("PWA-SW-1 app/sw.ts", () => {
  it("registers an empty runtimeCaching list", () => {
    expect(swSource).toMatch(/runtimeCaching:\s*\[\s*\]/);
  });

  it("does not import Serwist's defaultCache", () => {
    // Matches an actual import statement, not this file's own comments
    // explaining why defaultCache is deliberately avoided.
    const importLines = swSource.split("\n").filter((l) => /^\s*import\b/.test(l));
    for (const line of importLines) {
      expect(line).not.toMatch(/defaultCache/);
      expect(line).not.toMatch(/@serwist\/next\/worker/);
    }
  });

  it("uses conservative lifecycle settings, not immediate takeover", () => {
    expect(swSource).toMatch(/skipWaiting:\s*false/);
    expect(swSource).toMatch(/clientsClaim:\s*false/);
    expect(swSource).toMatch(/navigationPreload:\s*false/);
  });

  it("precaches from the injected manifest, not a hand-written list", () => {
    expect(swSource).toMatch(/precacheEntries:\s*self\.__SW_MANIFEST/);
  });
});

describe("PWA-OFFLINE-UX-1 offline fallback route", () => {
  it("names /offline as the single fallback target", () => {
    expect(OFFLINE_FALLBACK_ROUTE).toBe("/offline");
  });

  it("includes the offline page's own chunk in the precache allowlist", () => {
    expect(OFFLINE_CHUNKS).toContain("app/(public)/offline/page");
  });

  it("registers the fallback as a NetworkOnly + PrecacheFallbackPlugin route, not a caching strategy", () => {
    expect(swSource).toMatch(/import\s*\{[^}]*\bNetworkOnly\b[^}]*\}\s*from\s*["']serwist["']/);
    expect(swSource).toMatch(/import\s*\{[^}]*\bPrecacheFallbackPlugin\b[^}]*\}\s*from\s*["']serwist["']/);
    expect(swSource).toMatch(/new NetworkOnly\(/);
    expect(swSource).toMatch(/new PrecacheFallbackPlugin\(/);
    expect(swSource).toMatch(/fallbackUrls:\s*\[OFFLINE_FALLBACK_URL\]/);
  });

  it("still declares an empty runtimeCaching list — the fallback is a route added after construction, not a strategy in it", () => {
    expect(swSource).toMatch(/runtimeCaching:\s*\[\s*\]/);
  });

  it("scopes the fallback to real document navigations, matching request.mode", () => {
    expect(swSource).toMatch(/request\.mode\s*===\s*["']navigate["']/);
  });

  it("excludes admin and API/auth paths from the navigation fallback", () => {
    expect(swSource).toMatch(/pathname\s*===\s*["']\/admin["']/);
    expect(swSource).toMatch(/pathname\.startsWith\(["']\/admin\/["']\)/);
    expect(swSource).toMatch(/pathname\.startsWith\(["']\/api\/["']\)/);
  });

  it("never widens the calculator/shell allowlist to add the fallback", () => {
    // The fallback route lives outside precacheEntries/chunks scoping
    // entirely — registered separately, matched by request shape, not by
    // adding /offline to OFFLINE_SAFE_ROUTES or STATIC_SHELL_ROUTES.
    expect(OFFLINE_SAFE_ROUTES).not.toContain(OFFLINE_FALLBACK_ROUTE);
    expect(STATIC_SHELL_ROUTES).not.toContain(OFFLINE_FALLBACK_ROUTE);
    expect(OFFLINE_SAFE_ROUTES).toHaveLength(7);
  });
});
