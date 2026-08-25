// @vitest-environment node
import { describe, it, expect } from "vitest";
import { validatePost, type PostInput } from "@/lib/validation/post";

const base: PostInput = {
  titleEn: "Transfer Guidelines 2026",
  titleTe: "బదిలీ మార్గదర్శకాలు 2026",
  summaryTe: ["అర్హులైన ఉపాధ్యాయులు దరఖాస్తు చేసుకోవాలి."],
  englishAbstract: null,
  statusBadge: "notification",
  pdfUrl: null,
  actionUrl: null,
  actionDeadline: null,
  documentDate: null,
  goReference: "G.O.Ms.No.55",
  sourceDept: "School Education, AP",
  sourceUrl: null,
  categoryId: null,
  documentType: "go",
  orderState: "current",
  tags: [],
  verifiedAgainstGoir: false,
  relatedPostIds: [],
};

describe("validatePost", () => {
  it("accepts a well-formed post", () => {
    expect(validatePost(base)).toEqual([]);
  });

  it("requires an English title", () => {
    expect(validatePost({ ...base, titleEn: "  " })).toContain("English title is required.");
  });

  it("requires a Telugu title", () => {
    expect(validatePost({ ...base, titleTe: "" })).toContain("Telugu title is required.");
  });

  it("requires the Telugu title to actually contain Telugu characters", () => {
    const errors = validatePost({ ...base, titleTe: "Transfer Guidelines" });
    expect(errors).toContain("Telugu title must contain Telugu script.");
  });

  it("requires at least one Telugu summary line", () => {
    expect(validatePost({ ...base, summaryTe: [] })).toContain(
      "At least one Telugu summary line is required."
    );
  });

  it("requires Telugu script in the summary", () => {
    const errors = validatePost({ ...base, summaryTe: ["Eligible teachers must apply."] });
    expect(errors).toContain("Telugu summary must contain Telugu script.");
  });

  it("rejects a non-https pdf url", () => {
    const errors = validatePost({ ...base, pdfUrl: "ftp://example.com/a.pdf" });
    expect(errors).toContain("PDF URL must be an https:// link.");
  });

  it("rejects a non-https action url", () => {
    const errors = validatePost({ ...base, actionUrl: "http://example.com/apply" });
    expect(errors).toContain("Action URL must be an https:// link.");
  });

  it("rejects a malformed source url", () => {
    expect(validatePost({ ...base, sourceUrl: "not a url" })).toContain(
      "Source URL must be an https:// link."
    );
  });

  it("accepts a valid https url", () => {
    expect(validatePost({ ...base, sourceUrl: "https://goir.ap.gov.in/go/123" })).toEqual([]);
  });

  it("rejects an unknown status badge", () => {
    expect(validatePost({ ...base, statusBadge: "banana" })).toContain(
      "Status badge is not a recognised value."
    );
  });

  it("rejects a GO reference that is not in G.O./Memo/Circular form", () => {
    expect(validatePost({ ...base, goReference: "55" })).toContain(
      "GO reference must look like G.O.Ms.No.55, G.O.Rt.No.55, Memo.No.55, or Circular.No.55, or Proc.No.55."
    );
  });

  it("rejects a GO reference with a valid prefix but trailing garbage", () => {
    // Discrimination case for the missing end-anchor: an unanchored regex matches on
    // the valid prefix alone and ignores everything after it, silently accepting
    // arbitrary trailing text (including markup) tacked onto a real-looking reference.
    const errors = validatePost({
      ...base,
      goReference: "G.O.Ms.No.55 this is not actually valid nonsense !!! @@@",
    });
    expect(errors).toContain(
      "GO reference must look like G.O.Ms.No.55, G.O.Rt.No.55, Memo.No.55, or Circular.No.55, or Proc.No.55."
    );
  });

  it("accepts an empty GO reference", () => {
    expect(validatePost({ ...base, goReference: null })).toEqual([]);
  });

  it("rejects an unparseable action deadline", () => {
    expect(validatePost({ ...base, actionDeadline: new Date("nonsense") })).toContain(
      "Action deadline is not a valid date."
    );
  });

  it("rejects an unparseable document date", () => {
    expect(validatePost({ ...base, documentDate: new Date("nonsense") })).toContain(
      "Official document date is not a valid date."
    );
  });

  it("rejects a document date in the future", () => {
    const nextYear = new Date();
    nextYear.setFullYear(nextYear.getFullYear() + 1);
    expect(validatePost({ ...base, documentDate: nextYear })).toContain(
      "Official document date cannot be in the future."
    );
  });

  it("accepts a valid past document date", () => {
    expect(validatePost({ ...base, documentDate: new Date("2024-02-08") })).toEqual([]);
  });

  it("rejects a post that relates to itself", () => {
    const errors = validatePost({ ...base, id: "abc", relatedPostIds: ["abc"] });
    expect(errors).toContain("A post cannot be related to itself.");
  });

  it("rejects duplicate related post ids", () => {
    const errors = validatePost({ ...base, relatedPostIds: ["x", "x"] });
    expect(errors).toContain("Related orders must be unique.");
  });

  it("rejects a document type outside the enum", () => {
    expect(validatePost({ ...base, documentType: "banana" })).toContain(
      "Document type is not a recognised value."
    );
  });

  it("accepts every document type in the enum", () => {
    for (const documentType of ["go", "circular", "memo", "proceeding", "notification", "other"]) {
      expect(validatePost({ ...base, documentType })).toEqual([]);
    }
  });

  it("accepts a post with no document type", () => {
    expect(validatePost({ ...base, documentType: null })).toEqual([]);
  });

  it("rejects an order state outside the enum", () => {
    expect(validatePost({ ...base, orderState: "pending" })).toContain(
      "Order state is not a recognised value."
    );
  });

  it("rejects an empty order state — every post is in exactly one state", () => {
    expect(validatePost({ ...base, orderState: "" })).toContain(
      "Order state is not a recognised value."
    );
  });

  it("accepts every order state in the enum", () => {
    for (const orderState of ["current", "amended", "superseded", "archived"]) {
      expect(validatePost({ ...base, orderState })).toEqual([]);
    }
  });

  it("requires a source URL when the post claims GOIR verification", () => {
    const errors = validatePost({ ...base, verifiedAgainstGoir: true, sourceUrl: null });
    expect(errors).toContain(
      "A GOIR-verified post must carry the source URL it was verified against."
    );
  });
});
