// @vitest-environment node
import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";

const read = (p: string) => fs.readFileSync(path.join(process.cwd(), p), "utf8");

describe("typography configuration", () => {
  it("loads Space Grotesk", () => {
    expect(read("app/layout.tsx")).toContain("Space_Grotesk");
  });

  it("maps font-sans to Space Grotesk, not Noto Sans", () => {
    const config = read("tailwind.config.js");
    const sansLine = config.split("\n").find((l) => l.includes("sans:")) ?? "";
    expect(sansLine).toContain("space-grotesk");
    expect(sansLine).not.toContain("Noto Sans\"");
  });

  it("keeps Noto Sans Telugu for the telugu family", () => {
    const config = read("tailwind.config.js");
    const line = config.split("\n").find((l) => l.includes("telugu:")) ?? "";
    expect(line).toContain("noto-telugu");
  });

  it("no longer blocks rendering on a Google Fonts @import", () => {
    expect(read("app/globals.css")).not.toContain("@import url(\"https://fonts.googleapis.com");
  });

  it("sets readable shared body sizes for English and Telugu", () => {
    const css = read("app/globals.css");
    expect(css).toContain("font-size: 0.9375rem; /* 15px mobile */");
    expect(css).toContain("font-size: 1rem; /* 16px desktop */");
    expect(css).toContain("font-size: 1rem; /* 16px mobile */");
    expect(css).toContain("font-size: 1.0625rem; /* 17px desktop */");
  });

  it("keeps Telugu reading text on a diacritic-safe line height", () => {
    const css = read("app/globals.css");
    expect(css).toContain(".text-telugu-body {");
    expect(css).toContain("line-height: 1.75;");
    expect(css).toMatch(/\.text-telugu-title \{[\s\S]*line-height: 1\.75;/);
  });

  // UI-IMPECCABLE-1, DESIGN_SYSTEM.md §1: "Mono is not for body copy, headings,
  // or navigation labels." Three route h1s added in UI-A11Y-1 briefly violated
  // this (a Badge-row label promoted straight to h1 kept its font-mono styling).
  it("never styles an <h1> with font-mono", () => {
    const componentsRoot = path.join(process.cwd(), "app/(public)");
    const offenders: string[] = [];

    const walk = (dir: string) => {
      for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        const full = path.join(dir, entry.name);
        if (entry.isDirectory()) walk(full);
        else if (entry.name.endsWith(".tsx")) {
          const source = fs.readFileSync(full, "utf8");
          for (const match of source.matchAll(/<h1\b[^>]*>/g)) {
            if (/font-mono/.test(match[0])) offenders.push(`${full}: ${match[0]}`);
          }
        }
      }
    };
    walk(componentsRoot);

    expect(offenders).toEqual([]);
  });
});
