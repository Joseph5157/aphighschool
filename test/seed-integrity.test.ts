// @vitest-environment node
import { describe, it, expect, beforeEach } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { resetDb, testDb } from "./db";
import { resolveLifecycle, isLifecycleClosed } from "@/lib/posts/lifecycle";

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

  // The three posts above carried the bare goir.ap.gov.in domain and needed
  // sourceUrl nulled. TET and DSC are different: their sourceUrl is a real AP
  // application portal (aptet.apcfss.in / apdsc.apcfss.in), not a fabricated
  // stand-in, and reseeding must preserve it rather than null it out. A
  // blanket "null every sourceUrl on update" fix would silently destroy a
  // legitimate source link on every reseed — this test catches exactly that.
  it("running the real seed script over a dirty TET row keeps its real source url", async () => {
    const DIRTY_SLUG = "ap-tet-2026-notification-guidelines";
    const REAL_SOURCE_URL = "https://aptet.apcfss.in";

    const databaseUrl = process.env.DATABASE_URL ?? "";
    if (!databaseUrl.includes("portal_test")) {
      throw new Error(
        `Refusing to run prisma/seed.ts: DATABASE_URL does not target portal_test (${databaseUrl})`
      );
    }

    // Simulate a row left behind by the OLD (pre-fix) seed script: published
    // and GOIR-verified, with a fake Drive pdfUrl, but a real (not bare-domain,
    // not fabricated) sourceUrl — exactly what TET's own create branch has
    // always used.
    await testDb.post.create({
      data: {
        slug: DIRTY_SLUG,
        titleEn: "AP TET 2026 Official Notification & Online Application Guidelines",
        titleTe: "ఆంధ్రప్రదేశ్ ఉపాధ్యాయ అర్హత పరీక్ష (AP TET 2026) అధికారిక ప్రకటన & ఆన్‌లైన్ దరఖాస్తు మార్గదర్శకాలు",
        summaryTe: ["పాత సీడ్ డేటా."],
        isDraft: false,
        verifiedAgainstGoir: true,
        pdfUrl: "https://drive.google.com/file/d/TET2026GUIDELINES/view",
        sourceUrl: REAL_SOURCE_URL,
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
    // The positive case: a real portal url must survive a reseed, not be
    // nulled alongside the fabricated fields.
    expect(healed.sourceUrl).toBe(REAL_SOURCE_URL);
  }, 30000);

  // The DSC hall-tickets post was seeded as documentType "proceeding", which
  // sends it down the order-state branch: it rendered "Document Status:
  // Current" instead of the recruitment stepper it obviously wants. Asserted
  // through resolveLifecycle against the really-seeded row rather than against
  // the seed script's source text, so it checks the user-visible consequence.
  it("classifies the DSC hall-tickets post as a recruitment document", async () => {
    const databaseUrl = process.env.DATABASE_URL ?? "";
    if (!databaseUrl.includes("portal_test")) {
      throw new Error(
        `Refusing to run prisma/seed.ts: DATABASE_URL does not target portal_test (${databaseUrl})`
      );
    }

    execFileSync("npx", ["tsx", "prisma/seed.ts"], {
      cwd: process.cwd(),
      env: { ...process.env, DATABASE_URL: databaseUrl },
      stdio: "pipe",
      shell: true,
    });

    const dsc = await testDb.post.findUniqueOrThrow({
      where: { slug: "ap-dsc-2026-hall-tickets-release" },
    });

    expect(dsc.statusBadge).toBe("hall_ticket");
    const view = resolveLifecycle(dsc);
    expect(view.kind).toBe("recruitment");
    if (view.kind !== "recruitment") throw new Error("wrong kind");
    expect(view.currentStage).toBe(3);
  }, 30000);

  // GO 21 is seeded with statusBadge "expired" and, until now, no orderState —
  // so it defaulted to `current` and its card claimed a green "Current" while
  // its detail page said "This order is in force." about a document GO 129
  // replaces. statusBadge is not read for a state document, so the correction
  // has to be in orderState, not in a filter rule.
  //
  // Deliberately time-independent: GO 21 has no actionDeadline, so this cannot
  // go stale the way a deadline-based assertion would.
  it("seeds the superseded GO 21 as superseded, not as an order in force", async () => {
    const databaseUrl = process.env.DATABASE_URL ?? "";
    if (!databaseUrl.includes("portal_test")) {
      throw new Error(
        `Refusing to run prisma/seed.ts: DATABASE_URL does not target portal_test (${databaseUrl})`
      );
    }

    execFileSync("npx", ["tsx", "prisma/seed.ts"], {
      cwd: process.cwd(),
      env: { ...process.env, DATABASE_URL: databaseUrl },
      stdio: "pipe",
      shell: true,
    });

    const go21 = await testDb.post.findUniqueOrThrow({
      where: { slug: "go-21-original-ptr-norms" },
    });

    expect(go21.statusBadge).toBe("expired");
    expect(go21.orderState).toBe("superseded");

    const view = resolveLifecycle(go21);
    if (view.kind !== "state") throw new Error("wrong kind");
    expect(view.label).toBe("Superseded");
    // The pill and the filter must now say the same thing about this row.
    expect(view.inForce).toBe(false);
    expect(isLifecycleClosed(go21)).toBe(true);

    // GO 129 is the order that replaces it, and it is the operative one.
    const go129 = await testDb.post.findUniqueOrThrow({
      where: { slug: "go-129-district-allocation-2026" },
    });
    const go129View = resolveLifecycle(go129);
    if (go129View.kind !== "state") throw new Error("wrong kind");
    expect(go129View.inForce).toBe(true);
  }, 30000);

  // prisma/seed.ts upserts. A field set only in the `create` branch never
  // reaches a database that already holds the row — which is every developer
  // machine and the production database. GO 21's orderState correction is
  // worthless unless the `update` branch carries it too, and only a
  // dirty-row-then-reseed test can tell the two apart.
  it("running the real seed script over a GO 21 row left in force corrects it", async () => {
    const databaseUrl = process.env.DATABASE_URL ?? "";
    if (!databaseUrl.includes("portal_test")) {
      throw new Error(
        `Refusing to run prisma/seed.ts: DATABASE_URL does not target portal_test (${databaseUrl})`
      );
    }

    await testDb.post.create({
      data: {
        slug: "go-21-original-ptr-norms",
        titleEn: "Original PTR Norms & Staff Restructuring Guidelines",
        titleTe: "అసలు పీటీఆర్ నిబంధనలు",
        summaryTe: ["పాత సీడ్ డేటా."],
        statusBadge: "expired",
        orderState: "current",
      },
    });

    execFileSync("npx", ["tsx", "prisma/seed.ts"], {
      cwd: process.cwd(),
      env: { ...process.env, DATABASE_URL: databaseUrl },
      stdio: "pipe",
      shell: true,
    });

    const healed = await testDb.post.findUniqueOrThrow({
      where: { slug: "go-21-original-ptr-norms" },
    });

    expect(healed.orderState).toBe("superseded");
  }, 30000);
});