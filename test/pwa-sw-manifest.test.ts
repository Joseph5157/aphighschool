// PWA-SW-1. Inspects the actual built public/sw.js — not just source
// configuration — because a webpack plugin's runtime behaviour is not
// guaranteed by its options alone. Skips (rather than fails) when no
// production build has been run yet; `npx next build` first makes this
// test meaningful.
import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { OFFLINE_SAFE_ROUTES, STATIC_SHELL_ROUTES, OFFLINE_FALLBACK_ROUTE } from "../lib/pwa/precache-config";

const SW_PATH = path.join(process.cwd(), "public", "sw.js");
const hasBuild = fs.existsSync(SW_PATH);

function extractManifest(source: string): { revision: string | null; url: string }[] {
  const matches = [...source.matchAll(/\{'revision':(null|'[^']*'),'url':'([^']*)'\}/g)];
  return matches.map((m) => ({
    revision: m[1] === "null" ? null : m[1].slice(1, -1),
    url: m[2],
  }));
}

describe.skipIf(!hasBuild)("PWA-SW-1 built service worker (public/sw.js)", () => {
  const source = hasBuild ? fs.readFileSync(SW_PATH, "utf8") : "";
  const manifest = hasBuild ? extractManifest(source) : [];

  it("was actually generated and is non-trivial in size", () => {
    expect(fs.statSync(SW_PATH).size).toBeGreaterThan(5000);
  });

  it("precaches every one of the seven calculator documents, revisioned", () => {
    for (const route of OFFLINE_SAFE_ROUTES) {
      const entry = manifest.find((m) => m.url === route);
      expect(entry, `missing precache entry for ${route}`).toBeDefined();
      expect(entry!.revision).not.toBeNull();
    }
  });

  it("precaches both navigational shells, revisioned", () => {
    for (const route of STATIC_SHELL_ROUTES) {
      const entry = manifest.find((m) => m.url === route);
      expect(entry, `missing precache entry for ${route}`).toBeDefined();
      expect(entry!.revision).not.toBeNull();
    }
  });

  it("precaches the offline fallback page, revisioned", () => {
    const entry = manifest.find((m) => m.url === OFFLINE_FALLBACK_ROUTE);
    expect(entry, `missing precache entry for ${OFFLINE_FALLBACK_ROUTE}`).toBeDefined();
    expect(entry!.revision).not.toBeNull();
  });

  it("only grows by the offline page's own document + chunk, not by anything else", () => {
    // 55 approved entries from PWA-SW-1, plus exactly one new document
    // (/offline) and its one route-specific JS chunk.
    expect(manifest.length).toBe(57);
  });

  it("contains no freshness-sensitive route as a cached document", () => {
    // Matches the bare route or any query-string/RSC variant of it —
    // "/orders?_rsc=x" is exactly as forbidden as "/orders".
    const forbidden = manifest.filter((m) =>
      /^\/(\?|$)|^\/orders(\/|\?|$)|^\/search(\/|\?|$)|^\/category\/|^\/posts\//.test(m.url)
    );
    expect(forbidden).toEqual([]);
  });

  it("contains no admin or auth path", () => {
    const forbidden = manifest.filter((m) => /\/admin|\/api\/auth/.test(m.url));
    expect(forbidden).toEqual([]);
  });

  it("contains no external-origin entry", () => {
    const external = manifest.filter((m) => /^https?:\/\//.test(m.url));
    expect(external).toEqual([]);
  });

  it("contains no RSC-flavoured URL (a _rsc query parameter)", () => {
    const rsc = manifest.filter((m) => m.url.includes("_rsc"));
    expect(rsc).toEqual([]);
  });

  it("registers no runtime caching strategy classes (dead-code eliminated)", () => {
    for (const cls of ["NetworkFirst", "CacheFirst", "StaleWhileRevalidate", "defaultCache"]) {
      expect(source).not.toContain(cls);
    }
  });

  it("wires the navigation fallback through a real precache read, not a hand-rolled cache write", () => {
    // "navigate"===x.mode alone is not distinctive — Serwist's own internal
    // Request-cloning workaround contains the identical pattern regardless
    // of anything this project registers. registerCapture + /admin together
    // can only come from this project's own fallback route (Serwist's
    // source never mentions /admin), so that combination is the real proof.
    expect(source).toContain("matchPrecache");
    expect(source).toContain("registerCapture");
    expect(source).toContain("/admin");
  });

  it("never references Google's font origins", () => {
    expect(source).not.toMatch(/fonts\.(?:gstatic|googleapis)\.com/);
  });

  it("has no duplicate precache URLs", () => {
    const urls = manifest.map((m) => m.url);
    expect(new Set(urls).size).toBe(urls.length);
  });
});

describe.skipIf(hasBuild)("PWA-SW-1 built service worker (public/sw.js)", () => {
  it("was not found — run `npx next build` before trusting this gate's build-output claims", () => {
    expect(hasBuild).toBe(false);
  });
});
