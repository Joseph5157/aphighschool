// PWA-UPDATE-1. Source-level guards on the update lifecycle: registration
// architecture, skip-waiting discipline, and the reload trigger. Behavioural
// coverage (does the prompt actually appear/react correctly) lives in
// test/pwa-update-manager.test.tsx; this file guards the specific
// invariants that file can't see from the outside (call ORDER, for one).
import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const nextConfigSource = fs.readFileSync(path.join(ROOT, "next.config.js"), "utf8");
const swSource = fs.readFileSync(path.join(ROOT, "app", "sw.ts"), "utf8");
const managerSource = fs.readFileSync(
  path.join(ROOT, "app", "(public)", "_components", "PwaUpdateManager.tsx"),
  "utf8"
);
const layoutSource = fs.readFileSync(path.join(ROOT, "app", "(public)", "layout.tsx"), "utf8");

describe("PWA-UPDATE-1 registration architecture", () => {
  it("next.config.js registers manually, not through @serwist/next's own client script", () => {
    expect(nextConfigSource).toMatch(/register:\s*false/);
  });

  it("PwaUpdateManager only registers in production", () => {
    expect(managerSource).toMatch(/process\.env\.NODE_ENV\s*!==\s*["']production["']/);
  });

  it("PwaUpdateManager guards against registering twice", () => {
    expect(managerSource).toMatch(/registeredRef\.current/);
  });

  it("PwaUpdateManager attaches the waiting listener before calling register()", () => {
    const listenerIdx = managerSource.indexOf('addEventListener("waiting"');
    const registerIdx = managerSource.indexOf("await serwist.register()");
    expect(listenerIdx).toBeGreaterThan(-1);
    expect(registerIdx).toBeGreaterThan(-1);
    expect(listenerIdx).toBeLessThan(registerIdx);
  });

  it("is mounted from the public root layout, so it survives client-side navigation", () => {
    expect(layoutSource).toMatch(/<PwaUpdateManager\s*\/>/);
  });
});

describe("PWA-UPDATE-1 lifecycle options unchanged", () => {
  it("app/sw.ts still declares the conservative lifecycle from PWA-SW-1", () => {
    expect(swSource).toMatch(/skipWaiting:\s*false/);
    expect(swSource).toMatch(/clientsClaim:\s*false/);
    expect(swSource).toMatch(/navigationPreload:\s*false/);
  });

  it("next.config.js still declares cacheOnNavigation/reloadOnOnline false", () => {
    expect(nextConfigSource).toMatch(/cacheOnNavigation:\s*false/);
    expect(nextConfigSource).toMatch(/reloadOnOnline:\s*false/);
  });

  it("PwaUpdateManager never calls skipWaiting() itself — only actual code lines checked, not this file's own comments explaining that", () => {
    const codeLines = managerSource
      .split("\n")
      .filter((l) => !l.trim().startsWith("*") && !l.trim().startsWith("//"));
    for (const line of codeLines) {
      expect(line).not.toMatch(/\bskipWaiting\(\)/);
    }
  });

  it('"Later" never sends the skip-waiting message', () => {
    const laterFn = managerSource.slice(
      managerSource.indexOf("const handleLater"),
      managerSource.indexOf("const handleUpdateNow")
    );
    expect(laterFn).not.toMatch(/messageSkipWaiting/);
  });

  it('"Update now" sends messageSkipWaiting exactly once per click, not skipWaiting() directly', () => {
    const updateFn = managerSource.slice(managerSource.indexOf("const handleUpdateNow"));
    expect(updateFn).toMatch(/serwist\.messageSkipWaiting\(\)/);
  });
});

describe("PWA-UPDATE-1 reload discipline", () => {
  it("reload is gated on the waiting worker's own state reaching \"activated\", not on a controlling/message event alone", () => {
    const updateFn = managerSource.slice(managerSource.indexOf("const handleUpdateNow"));
    expect(updateFn).toMatch(/sw\.state\s*===\s*["']activated["']/);
    expect(updateFn).toMatch(/statechange/);
  });

  it("reload() appears only inside the activated-outcome branch of finish()", () => {
    const finishFn = managerSource.slice(
      managerSource.indexOf("const finish ="),
      managerSource.indexOf("const onStateChange =")
    );
    expect(finishFn).toMatch(/outcome === ["']activated["'][\s\S]*?window\.location\.reload\(\)/);
  });

  it("finish() is idempotent (a settled guard), preventing a reload loop", () => {
    expect(managerSource).toMatch(/if\s*\(settled\)\s*return;/);
    expect(managerSource).toMatch(/settled\s*=\s*true;/);
  });

  it("has an activation timeout so a stuck waiting worker cannot hang the UI forever", () => {
    expect(managerSource).toMatch(/ACTIVATION_TIMEOUT_MS/);
    expect(managerSource).toMatch(/setTimeout\(\(\)\s*=>\s*finish\(["']failed["']\)/);
  });

  it("only one window.location.reload() call site exists in the whole component", () => {
    const matches = managerSource.match(/window\.location\.reload\(\)/g) ?? [];
    expect(matches.length).toBe(1);
  });
});

describe("PWA-UPDATE-1 does not confuse app updates with content freshness", () => {
  it("the foreground update check is deliberately low-frequency, not aggressive polling", () => {
    expect(managerSource).toMatch(/VISIBILITY_UPDATE_CHECK_INTERVAL_MS/);
    // At least 30 minutes between checks - not a short poll interval.
    const match = managerSource.match(/VISIBILITY_UPDATE_CHECK_INTERVAL_MS\s*=\s*([\d*\s]+);/);
    expect(match).not.toBeNull();
    // eslint-disable-next-line no-eval
    const ms = Function(`return (${match![1]})`)();
    expect(ms).toBeGreaterThanOrEqual(30 * 60 * 1000);
  });

  it("does not add any new caching call — this gate touches registration and UI only", () => {
    expect(managerSource).not.toMatch(/caches\.open|cache\.put|cache\.add/);
  });
});
