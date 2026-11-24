// @vitest-environment node
// TERM-SEARCH-1 — docs/context/TERM_NAV_1_PLAN.md §10 rules and examples,
// exercised against real Postgres through searchPosts.
import { describe, it, expect, beforeEach } from "vitest";
import { searchPosts, quickSearchChips } from "@/lib/posts/query";
import { makePost, resetDb } from "./db";

const slugs = async (q: string) => (await searchPosts({ q })).map((p) => p.slug).sort();

beforeEach(async () => {
  await resetDb();
  // goReference values are explicit so number matching is tested on purpose.
  await makePost({ slug: "go-22", titleEn: "Teacher Allocation Order", goReference: "G.O.Ms.No.22", documentType: "go", tags: ["Transfers"] });
  await makePost({ slug: "go-122", titleEn: "Grant Release Order", goReference: "G.O.Ms.No.122", documentType: "go", tags: [] });
  await makePost({ slug: "go-220", titleEn: "School Grants Order", goReference: "G.O.Rt.No.220", documentType: "go", tags: [] });
  await makePost({ slug: "rc-25", titleEn: "Counselling Schedule", goReference: "Rc.No.25", documentType: "proceeding", tags: ["Transfers"] });
  await makePost({ slug: "rc-125", titleEn: "Headmaster Panel", goReference: "Rc.No.125", documentType: "proceeding", tags: ["Promotions"], summaryTe: ["SGT నుండి SA పదోన్నతి."] });
  await makePost({ slug: "promo-sa", titleEn: "School Assistant Seniority List", goReference: "Rc.No.300", documentType: "proceeding", tags: ["Promotions"] });
  await makePost({ slug: "leave", titleEn: "Encashment of leave on retirement", goReference: "G.O.Ms.No.400", documentType: "go", tags: ["Leave Rules"] });
  await makePost({ slug: "legacy-ptr", titleEn: "Staff pattern revision", goReference: "Memo.No.9", documentType: "memo", tags: ["PTR"] });
  await makePost({ slug: "circular-transfers", titleEn: "Transfers clarification", goReference: "Cir.No.5", documentType: "circular", tags: [] });
  await makePost({ slug: "draft-go", titleEn: "Unpublished order", goReference: "G.O.Ms.No.23", documentType: "go", tags: ["Transfers"], isDraft: true });
});

describe("document-type aliases (rules 2 and 4)", () => {
  it("returns the same GOs for జీవో, GO and G.O.", async () => {
    const telugu = await slugs("జీవో");
    expect(telugu).toEqual(["go-122", "go-22", "go-220", "leave"]);
    expect(await slugs("GO")).toEqual(telugu);
    expect(await slugs("G.O.")).toEqual(telugu);
  });

  it("returns the same Proceedings for ప్రొసీడింగ్స్ and Proceedings", async () => {
    const telugu = await slugs("ప్రొసీడింగ్స్");
    expect(telugu).toEqual(["promo-sa", "rc-125", "rc-25"]);
    expect(await slugs("Proceedings")).toEqual(telugu);
  });
});

describe("topic aliases (rules 3 and 4)", () => {
  it("returns every Transfers-tagged record for బదిలీలు and transfers alike", async () => {
    // Both reach the same canonical-tag records. The English word may also
    // match English text literally (the untagged circular below); the Telugu
    // word cannot, because that title is English-only.
    const telugu = await slugs("బదిలీలు");
    expect(telugu).toEqual(["go-22", "rc-25"]);
    expect(await slugs("transfers")).toEqual(["circular-transfers", ...telugu]);
  });

  it("keeps the literal match: an untagged post that says 'Transfers' is still found", async () => {
    expect(await slugs("transfers")).toContain("circular-transfers");
  });

  it("finds a legacy PTR-tagged post from every rationalisation alias", async () => {
    for (const q of ["PTR", "reapportionment", "rationalization", "రేషనలైజేషన్"]) {
      expect(await slugs(q), q).toEqual(["legacy-ptr"]);
    }
  });

  it("finds Leave Rules from EL, earned leave and ఆర్జిత సెలవు", async () => {
    for (const q of ["EL", "earned leave", "ఆర్జిత సెలవు"]) {
      expect(await slugs(q), q).toContain("leave");
    }
  });

  it("narrows SGT promotions to promotion records that mention SGT", async () => {
    expect(await slugs("SGT promotions")).toEqual(["rc-125"]);
  });
});

// PR #6 review: a search alias is not stored-tag evidence. Production carries
// a non-DSC Academic Instructors proceeding tagged `Recruitment`; because
// "recruitment" is a DSC search alias, it used to answer DSC searches.
describe("search aliases are not stored-tag evidence", () => {
  beforeEach(async () => {
    await makePost({ slug: "academic-instructors", titleEn: "Academic Instructors Engagement", goReference: "DSE AP Proceedings 2026", documentType: "proceeding", tags: ["Recruitment"] });
    await makePost({ slug: "dsc-2026", titleEn: "Mega DSC Schedule", goReference: "Rc.No.700", documentType: "notification", tags: ["DSC"] });
  });

  it("excludes a post tagged only Recruitment from DSC and TRT searches", async () => {
    expect(await slugs("DSC")).toEqual(["dsc-2026"]);
    expect(await slugs("TRT")).toEqual(["dsc-2026"]);
  });

  it("still finds the Recruitment-tagged post by ordinary literal search", async () => {
    expect(await slugs("recruitment")).toContain("academic-instructors");
  });
});

describe("reference numbers stay literal (rule 6)", () => {
  it("G.O.Ms.No.22 finds No.22, not No.122 or No.220", async () => {
    expect(await slugs("G.O.Ms.No.22")).toEqual(["go-22"]);
  });

  it("GO 22 finds the same GO", async () => {
    expect(await slugs("GO 22")).toEqual(["go-22"]);
  });

  it("Rc.No.25 finds Rc.No.25, not Rc.No.125", async () => {
    expect(await slugs("Rc.No.25")).toEqual(["rc-25"]);
  });
});

describe("safety (rules 5 and 7)", () => {
  it("never widens unknown text", async () => {
    expect(await slugs("banana")).toEqual([]);
    expect(await slugs("22")).toEqual(["go-122", "go-22", "go-220"]); // literal substring only
  });

  it("never returns a draft through an alias", async () => {
    expect(await slugs("GO")).not.toContain("draft-go");
    expect(await slugs("బదిలీలు")).not.toContain("draft-go");
    expect(await slugs("G.O.Ms.No.23")).toEqual([]);
  });

  it("still honours an explicit type filter on top of an alias", async () => {
    const r = await searchPosts({ q: "transfers", type: "proceeding" });
    expect(r.map((p) => p.slug)).toEqual(["rc-25"]);
  });

  it("keeps suggestion chips verified: an alias that matches nothing is still dropped", async () => {
    expect(await quickSearchChips(["బదిలీలు", "EHS", "banana"])).toEqual(["బదిలీలు"]);
  });
});
