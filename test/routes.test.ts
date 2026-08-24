// @vitest-environment node
import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";

const PUBLIC_DIR = path.join(process.cwd(), "app", "(public)");

function walk(dir: string): string[] {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    return entry.isDirectory() ? walk(full) : [full];
  });
}

describe("public route scope", () => {
  it("has no education route", () => {
    expect(fs.existsSync(path.join(PUBLIC_DIR, "education"))).toBe(false);
  });

  it("has no source file referencing the education route", () => {
    const offenders = walk(PUBLIC_DIR)
      .filter((f) => f.endsWith(".tsx") || f.endsWith(".ts"))
      .filter((f) => fs.readFileSync(f, "utf8").includes("/education"));
    expect(offenders).toEqual([]);
  });

  it("has no link to the non-existent mega-dsc slug", () => {
    const offenders = walk(PUBLIC_DIR)
      .filter((f) => f.endsWith(".tsx") || f.endsWith(".ts"))
      .filter((f) =>
        fs.readFileSync(f, "utf8").includes("ap-mega-dsc-2026-hall-tickets")
      );
    expect(offenders).toEqual([]);
  });

  it("renders no advertisement placeholder", () => {
    const offenders = walk(PUBLIC_DIR)
      .filter((f) => f.endsWith(".tsx"))
      .filter((f) => /AdSlot|Sponsored/.test(fs.readFileSync(f, "utf8")));
    expect(offenders).toEqual([]);
  });

  // Guard against a vacuously-true PUBLIC_DIR: walk() returns [] for a
  // missing directory, which would make every "no file contains X"
  // assertion above pass without actually checking anything. This
  // confirms PUBLIC_DIR resolves to a real directory with real content.
  it("walks a non-empty set of .tsx route files (non-vacuity guard)", () => {
    const tsxFiles = walk(PUBLIC_DIR).filter((f) => f.endsWith(".tsx"));
    expect(tsxFiles.length).toBeGreaterThan(0);
  });
});
