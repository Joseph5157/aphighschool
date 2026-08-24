// @vitest-environment node
import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";

const SEED = fs.readFileSync(path.join(process.cwd(), "prisma", "seed.ts"), "utf8");

describe("seed integrity", () => {
  it("never marks a seeded post as GOIR-verified", () => {
    expect(SEED).not.toMatch(/verifiedAgainstGoir:\s*true/);
  });

  it("never publishes a seeded post", () => {
    expect(SEED).not.toMatch(/isDraft:\s*false/);
  });

  it("carries no placeholder Google Drive id", () => {
    expect(SEED).not.toContain("1A2B3C4D5E6F7G8H9I0J");
  });

  it("uses no bare goir.ap.gov.in domain as a source url", () => {
    expect(SEED).not.toMatch(/sourceUrl:\s*"https:\/\/goir\.ap\.gov\.in"/);
  });
});
