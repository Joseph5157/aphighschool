// @vitest-environment node
import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { dateLabel, officialDate } from "@/lib/dates";

const read = (file: string) => fs.readFileSync(path.join(process.cwd(), file), "utf8");

const ordersPage = read("app/(public)/orders/page.tsx");
const ordersSidebar = read("app/(public)/orders/_components/OrdersSidebar.tsx");
const categoryPage = read("app/(public)/category/[slug]/page.tsx");
const homePage = read("app/(public)/page.tsx");
const searchUi = read("app/(public)/search/_components/SearchUI.tsx");
const goMemoTemplate = read("app/(public)/posts/[slug]/_templates/GoMemoTemplate.tsx");
const notificationTemplate = read("app/(public)/posts/[slug]/_templates/NotificationTemplate.tsx");
const postPage = read("app/(public)/posts/[slug]/page.tsx");
const thumbZoneBar = read("app/(public)/posts/[slug]/_components/ThumbZoneBar.tsx");
const actionSummary = read("app/(public)/posts/[slug]/_components/ActionSummary.tsx");

describe("FRESHNESS-1 public trust language", () => {
  it("keeps the Orders Hub bounded to published documents and per-document GOIR status", () => {
    expect(ordersPage).toContain("AP School Education Document Index");
    expect(ordersPage).toContain("Published documents");
    expect(ordersPage).toContain("GOIR status shown per document");
    expect(ordersPage).not.toMatch(/Official G\.O\. Repository|GOIR Verified Repository|Official Documents|All G\.O\.s verified/i);
  });

  it("removes unsupported static GOIR repository statistics and keeps the external resource copy narrow", () => {
    expect(ordersSidebar).not.toMatch(/STATUS_BREAKDOWN|GOIR Repository Stats|Official Document Classification/i);
    expect(ordersSidebar).toContain("GOIR (goir.ap.gov.in) is a government-orders resource.");
    expect(ordersSidebar).toContain("Documents marked &ldquo;GOIR Verified&rdquo; have a recorded verification in AP Teacher Desk.");
  });

  it("does not describe a category or homepage feed as collection-wide verified", () => {
    expect(categoryPage).toContain("Published documents");
    expect(categoryPage).not.toMatch(/GOIR Verified Category|All G\.O\.s verified|verified repository/i);
    expect(homePage).toContain("Government Orders & Guidance");
    expect(homePage).not.toContain("Verified Government Orders & Guidance");
  });

  it("retains individual GOIR badges only behind their recorded boolean and uses the bounded label", () => {
    for (const template of [goMemoTemplate, notificationTemplate]) {
      expect(template).toContain("post.verifiedAgainstGoir && <Badge");
      expect(template).toContain(">GOIR Verified</Badge>");
      expect(template).not.toContain("GOIR Verified Gazette");
    }
  });

  it("does not render a compact discovery Current badge and preserves published-document wording", () => {
    expect(searchUi).toContain("Published documents");
    expect(searchUi).not.toContain('post.orderState === "current"');
  });

  it("uses neutral wording for a generic source toolbar link", () => {
    expect(thumbZoneBar).toContain('aria-label="Open source link"');
    expect(thumbZoneBar).not.toContain("Official Source");
  });

  it("does not make metadata or updatedAt into an official or freshness claim", () => {
    expect(postPage).not.toContain("Official AP School Education government order summary.");
    for (const source of [ordersPage, ordersSidebar, categoryPage, homePage, searchUi, goMemoTemplate, notificationTemplate, postPage, thumbZoneBar]) {
      expect(source).not.toMatch(/Last verified|updatedAt/i);
    }
  });

  it("labels an explicit passed deadline without inventing a broad closed state", () => {
    expect(notificationTemplate).toContain("Deadline passed: ${formattedDeadline}");
    expect(notificationTemplate).not.toContain('isPastDeadline ? "Closed"');
  });

  it("continues to distinguish issued documents from posts added to the portal", () => {
    const issued = { documentDate: new Date("2024-02-08T00:00:00.000Z"), createdAt: new Date("2026-08-24T00:00:00.000Z") };
    const added = { documentDate: null, createdAt: new Date("2026-08-24T00:00:00.000Z") };

    expect(dateLabel(issued)).toBe("Issued");
    expect(officialDate(issued)).toBe(issued.documentDate);
    expect(dateLabel(added)).toBe("Added to portal");
    expect(officialDate(added)).toBe(added.createdAt);
    expect(actionSummary).not.toContain("Last verified");
  });
});
