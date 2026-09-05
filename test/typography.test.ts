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
});
