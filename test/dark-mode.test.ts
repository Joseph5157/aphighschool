// @vitest-environment node
import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";

const read = (p: string) => fs.readFileSync(path.join(process.cwd(), p), "utf8");
const config = () => read("tailwind.config.js");
const css = () => read("app/globals.css");

function sourceFiles(dir: string): string[] {
  const full = path.join(process.cwd(), dir);
  if (!fs.existsSync(full)) return [];
  return fs.readdirSync(full, { withFileTypes: true }).flatMap((e) => {
    const p = path.join(dir, e.name);
    return e.isDirectory() ? sourceFiles(p) : p.endsWith(".tsx") ? [p] : [];
  });
}

describe("dark mode strategy", () => {
  it("uses the class strategy so the toggle actually works", () => {
    expect(config()).toMatch(/darkMode:\s*["']class["']/);
  });

  it("does not force theme colours with !important", () => {
    expect(css()).not.toMatch(/html\.dark[^}]*!important/s);
  });

  it("defines the palette as CSS variables", () => {
    expect(css()).toContain("--color-paper");
    expect(css()).toContain("--color-ink");
  });
});

describe("colour token discipline", () => {
  const ALLOWED_HEX = new Set<string>(); // no raw hex in components

  it("uses no raw hex colours in public components", () => {
    const offenders: string[] = [];
    for (const file of sourceFiles("app/(public)")) {
      const source = read(file);
      const matches = source.match(/#[0-9a-fA-F]{6}\b/g) ?? [];
      for (const hex of matches) {
        if (!ALLOWED_HEX.has(hex)) offenders.push(`${file}: ${hex}`);
      }
    }
    expect(offenders).toEqual([]);
  });

  it("uses no default Tailwind slate/gray colours in public components", () => {
    const offenders: string[] = [];
    for (const file of sourceFiles("app/(public)")) {
      if (/\b(bg|text|border)-(slate|gray|zinc|neutral|stone)-\d{2,3}\b/.test(read(file))) {
        offenders.push(file);
      }
    }
    expect(offenders).toEqual([]);
  });

  it("references no undefined colour token", () => {
    const defined = config();
    const offenders: string[] = [];
    for (const file of sourceFiles("app/(public)")) {
      for (const match of read(file).matchAll(/\b(?:bg|text|border|ring)-([a-z]+[A-Z][a-zA-Z]*)\b/g)) {
        const token = match[1];
        if (!defined.includes(`${token}:`)) offenders.push(`${file}: ${token}`);
      }
    }
    expect(offenders).toEqual([]);
  });
});

describe("no engagement-oriented UI", () => {
  it("uses no streak, trending-count, or nudge language in the sidebars", () => {
    const banned = /streak|don't miss|hurry|trending now|\d+ people|viewers|most popular/i;
    for (const file of ["app/(public)/_components/DesktopLeftNav.tsx", "app/(public)/_components/DesktopSidebar.tsx"]) {
      expect(read(file)).not.toMatch(banned);
    }
  });
});
