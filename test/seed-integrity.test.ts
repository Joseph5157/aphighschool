// @vitest-environment node
import { describe, it, expect, beforeEach } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { resetDb, testDb } from "./db";

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

// Database-level check for the same rule the regexes above enforce on source
// text: the regexes can only prove the SCRIPT never *writes* a verified/
// published/placeholder value. They cannot prove the script *repairs* a row
// that already carries one — e.g. a database seeded once by an older version
// of this script, before this file existed. `prisma.post.upsert`'s `update`
// branch runs instead of `create` for any row whose slug already exists, so
// if `update` doesn't reset a field, a dirty row stays dirty forever, no
// matter how many times `npm run db:seed` runs. This test plants a row in
// that dirty shape and proves the real seed script (run as the actual
// `tsx prisma/seed.ts` process that ships, not a re-implementation of it)
// heals it.
describe("seed idempotency (database)", () => {
  beforeEach(resetDb);

  it("running the real seed script over a dirty legacy row heals it", async () => {
    const DIRTY_SLUG = "da-arrears-payment-schedule-2026";

    // Guard rail: this test runs the seed script for real, including its
    // category/post cleanup logic. Never let that execute against anything
    // but the disposable test database.
    const databaseUrl = process.env.DATABASE_URL ?? "";
    if (!databaseUrl.includes("portal_test")) {
      throw new Error(
        `Refusing to run prisma/seed.ts: DATABASE_URL does not target portal_test (${databaseUrl})`
      );
    }

    // Simulate a row left behind by the OLD (pre-fix) seed script: published,
    // GOIR-verified, a fake Drive link, and the bare goir.ap.gov.in domain.
    await testDb.post.create({
      data: {
        slug: DIRTY_SLUG,
        titleEn: "Dearness Allowance (DA) Arrears Installments Release Orders",
        titleTe: "కరువు భత్యం (DA) బకాయిల వాయిదాల విడుదల ఉత్తర్వులు",
        summaryTe: ["పాత సీడ్ డేటా."],
        isDraft: false,
        verifiedAgainstGoir: true,
        pdfUrl: "https://drive.google.com/file/d/DAARREARS2026/view",
        sourceUrl: "https://goir.ap.gov.in",
      },
    });

    execFileSync("npx", ["tsx", "prisma/seed.ts"], {
      cwd: process.cwd(),
      env: { ...process.env, DATABASE_URL: databaseUrl },
      stdio: "pipe",
      shell: true,
    });

    const healed = await testDb.post.findUniqueOrThrow({ where: { slug: DIRTY_SLUG } });

    expect(healed.isDraft).toBe(true);
    expect(healed.verifiedAgainstGoir).toBe(false);
    expect(healed.pdfUrl).toBeNull();
    expect(healed.sourceUrl).toBeNull();
  }, 30000);
});
