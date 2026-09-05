import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { isGoirSourceUrl, validatePost, type PostInput } from "@/lib/validation/post";

const read = (file: string) => fs.readFileSync(path.join(process.cwd(), file), "utf8");

const basePost: PostInput = {
  titleEn: "Valid English Title",
  titleTe: "సరైన తెలుగు శీర్షిక",
  summaryTe: ["సరైన తెలుగు సారాంశం వివరణ."],
  englishAbstract: "Valid english abstract",
  statusBadge: "notification",
  pdfUrl: null,
  actionUrl: null,
  actionDeadline: null,
  documentDate: null,
  goReference: null,
  sourceDept: null,
  sourceUrl: "https://goir.ap.gov.in/orders/123",
  categoryId: null,
  documentType: null,
  orderState: "current",
  tags: [],
  verifiedAgainstGoir: true,
  relatedPostIds: [],
};

describe("GOIR Provenance & Trust Hardening", () => {
  describe("isGoirSourceUrl", () => {
    it("returns true only for exact https://goir.ap.gov.in URLs", () => {
      expect(isGoirSourceUrl("https://goir.ap.gov.in/view/123")).toBe(true);
      expect(isGoirSourceUrl("https://goir.ap.gov.in")).toBe(true);

      // Rejections
      expect(isGoirSourceUrl(null)).toBe(false);
      expect(isGoirSourceUrl("")).toBe(false);
      expect(isGoirSourceUrl("http://goir.ap.gov.in/view/123")).toBe(false);
      expect(isGoirSourceUrl("https://ap.gov.in/view/123")).toBe(false);
      expect(isGoirSourceUrl("https://psc.ap.gov.in/view/123")).toBe(false);
      expect(isGoirSourceUrl("https://apcfss.in/view/123")).toBe(false);
      expect(isGoirSourceUrl("https://amaravathiteacher.com/post")).toBe(false);
      expect(isGoirSourceUrl("https://www.apteachers.in/post")).toBe(false);
      expect(isGoirSourceUrl("https://goir.ap.gov.in.example.com/fake")).toBe(false);
      expect(isGoirSourceUrl("https://example.com/?url=goir.ap.gov.in")).toBe(false);
    });
  });

  describe("validatePost GOIR validation contract", () => {
    it("accepts verifiedAgainstGoir=true with https://goir.ap.gov.in source URL", () => {
      const errors = validatePost({
        ...basePost,
        verifiedAgainstGoir: true,
        sourceUrl: "https://goir.ap.gov.in/orders/2026/129",
      });
      expect(errors).toEqual([]);
    });

    it("rejects verifiedAgainstGoir=true with missing sourceUrl", () => {
      const errors = validatePost({
        ...basePost,
        verifiedAgainstGoir: true,
        sourceUrl: null,
      });
      expect(errors).toContain("A GOIR-verified post must carry the source URL it was verified against.");
    });

    it("rejects verifiedAgainstGoir=true with non-GOIR domains", () => {
      const nonGoirUrls = [
        "https://amaravathiteacher.com/post-detail/",
        "https://www.apteachers.in/2026/08/post.html",
        "https://psc.ap.gov.in/notification",
        "https://ap.gov.in/orders",
        "https://goir.ap.gov.in.example.com/fake",
        "http://goir.ap.gov.in/http-not-allowed",
      ];

      for (const url of nonGoirUrls) {
        const errors = validatePost({
          ...basePost,
          verifiedAgainstGoir: true,
          sourceUrl: url,
        });
        expect(errors).toContain("A GOIR-verified post must carry a valid https://goir.ap.gov.in source URL.");
      }
    });

    it("accepts verifiedAgainstGoir=false with normal third-party HTTPS source URLs", () => {
      const errors = validatePost({
        ...basePost,
        verifiedAgainstGoir: false,
        sourceUrl: "https://amaravathiteacher.com/post-detail/",
      });
      expect(errors).toEqual([]);
    });
  });

  describe("Importer & Scraper Guards", () => {
    it("ensures add-amaravathi-posts.ts contains no verifiedAgainstGoir: true assignment", () => {
      const importerCode = read("scripts/add-amaravathi-posts.ts");
      expect(importerCode).not.toContain("verifiedAgainstGoir: true");
    });

    it("ensures scraper/drafts/create.py does not default verifiedAgainstGoir to True or use fake GOIR sourceUrl fallback", () => {
      const scraperCode = read("scraper/drafts/create.py");
      expect(scraperCode).not.toContain("True, # verifiedAgainstGoir");
      expect(scraperCode).not.toContain('"sourceUrl", "https://goir.ap.gov.in"');
      expect(scraperCode).toContain("False, # verifiedAgainstGoir");
    });

    it("ensures Dockerfile and railway.json do not invoke add-amaravathi-posts.ts on startup", () => {
      const dockerfile = read("Dockerfile");
      const railwayJson = read("railway.json");

      expect(dockerfile).not.toContain("scripts/add-amaravathi-posts.ts");
      expect(railwayJson).not.toContain("scripts/add-amaravathi-posts.ts");
    });
  });
});
