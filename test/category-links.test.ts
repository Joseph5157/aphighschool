// @vitest-environment node
import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";

const NAV = path.join(
  process.cwd(),
  "app",
  "(public)",
  "_components",
  "DesktopLeftNav.tsx"
);

const DEAD_SLUGS = ["school-education", "finance", "higher-education", "dse-circulars"];

describe("department rail", () => {
  it("does not hardcode category slugs that do not exist", () => {
    const source = fs.readFileSync(NAV, "utf8");
    for (const slug of DEAD_SLUGS) {
      expect(source).not.toContain(slug);
    }
  });

  it("reads categories from Prisma", () => {
    const source = fs.readFileSync(NAV, "utf8");
    expect(source).toContain("prisma.category.findMany");
  });

  it("does not hardcode post counts", () => {
    const source = fs.readFileSync(NAV, "utf8");
    expect(source).toMatch(/_count/);
  });
});
