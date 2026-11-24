// @vitest-environment node
import { describe, it, expect } from "vitest";
import {
  DOCUMENT_TERMS,
  TOPIC_TERMS,
  interpretQuery,
  normaliseTokens,
  tagFormsFor,
} from "@/lib/terminology";

describe("normaliseTokens", () => {
  it("folds case, punctuation and dotted initials", () => {
    expect(normaliseTokens("G.O.")).toEqual(["go"]);
    expect(normaliseTokens("  G.O.Ms.No.22 ")).toEqual(["go", "ms", "no", "22"]);
    expect(normaliseTokens("Rc.No.25")).toEqual(["rc", "no", "25"]);
    expect(normaliseTokens("Re-apportionment")).toEqual(["re", "apportionment"]);
  });

  it("drops Telugu zero-width joiners so typed and stored forms compare equal", () => {
    expect(normaliseTokens("పీఆర్‌సీ")).toEqual(normaliseTokens("పీఆర్సీ"));
  });

  it("keeps Telugu vowel signs inside a token", () => {
    expect(normaliseTokens("బదిలీలు")).toEqual(["బదిలీలు"]);
  });
});

describe("interpretQuery", () => {
  const docs = (q: string) => interpretQuery(q)?.documentTypes;
  const topics = (q: string) => interpretQuery(q)?.topicTags;

  it("resolves Telugu, English and punctuated GO forms to one document type", () => {
    for (const q of ["జీవో", "GO", "G.O.", "go", "Government Order", "జీవోలు"]) {
      expect(docs(q), q).toEqual(["go"]);
    }
  });

  it("resolves Proceedings in either script", () => {
    expect(docs("ప్రొసీడింగ్స్")).toEqual(["proceeding"]);
    expect(docs("Proceedings")).toEqual(["proceeding"]);
  });

  it("prefers the longest alias: Circular Memo is a memo, Circular alone is a circular", () => {
    expect(docs("Circular Memo")).toEqual(["memo"]);
    expect(docs("circular")).toEqual(["circular"]);
    expect(docs("కార్యాలయ ఉత్తర్వులు")).toEqual(["proceeding"]);
  });

  it("resolves topic aliases to one canonical tag", () => {
    expect(topics("బదిలీలు")).toEqual([["Transfers"]]);
    expect(topics("transfers")).toEqual([["Transfers"]]);
    for (const q of ["PTR", "reapportionment", "re-apportionment", "rationalization"]) {
      expect(topics(q), q).toEqual([["Rationalisation"]]);
    }
    for (const q of ["EL", "earned leave", "ఆర్జిత సెలవు"]) {
      expect(topics(q), q).toEqual([["Leave Rules"]]);
    }
  });

  it("keeps an ambiguous alias ambiguous rather than picking one topic", () => {
    expect(topics("DR")).toEqual([["DA", "Pension"]]);
  });

  it("keeps unrecognised words and reference numbers instead of discarding them", () => {
    expect(interpretQuery("SGT promotions")).toEqual({
      documentTypes: [], topicTags: [["Promotions"]], numbers: [], words: ["sgt"],
    });
    expect(interpretQuery("G.O.Ms.No.22")).toEqual({
      documentTypes: ["go"], topicTags: [], numbers: ["22"], words: [],
    });
    expect(interpretQuery("GO 22")?.numbers).toEqual(["22"]);
    expect(interpretQuery("Rc.No.25")).toEqual({
      documentTypes: ["proceeding"], topicTags: [], numbers: ["25"], words: [],
    });
  });

  it("returns null for text containing no known term, so it is never widened", () => {
    expect(interpretQuery("banana")).toBeNull();
    expect(interpretQuery("District Allocation")).toBeNull();
    expect(interpretQuery("22")).toBeNull();
    expect(interpretQuery("")).toBeNull();
  });

  it("does not match an alias inside a longer word", () => {
    expect(interpretQuery("level")).toBeNull(); // contains "el"
    expect(interpretQuery("good")).toBeNull(); // contains "go"
  });
});

describe("vocabulary integrity", () => {
  it("covers every approved document type except the internal 'other' fallback", () => {
    expect(DOCUMENT_TERMS.map((t) => t.type).sort()).toEqual(
      ["circular", "go", "memo", "notification", "proceeding"]
    );
  });

  it("covers the fifteen approved canonical topics exactly", () => {
    expect(TOPIC_TERMS.map((t) => t.tag)).toEqual([
      "Transfers", "Rationalisation", "Promotions", "Service Rules", "Leave Rules", "PRC", "DA",
      "DSC", "TET", "Exams", "School Administration", "CFMS", "GPF/APGLI", "EHS", "Pension",
    ]);
  });

  it("maps no alias to both a document type and a topic", () => {
    const docKeys = new Set(
      DOCUMENT_TERMS.flatMap((t) => [t.type, t.display, ...t.telugu, ...t.aliases]).map((p) =>
        normaliseTokens(p).join(" ")
      )
    );
    const clashes = TOPIC_TERMS.flatMap((t) => [t.tag, t.display, ...t.telugu, ...t.aliases])
      .map((p) => normaliseTokens(p).join(" "))
      .filter((k) => docKeys.has(k));
    expect(clashes).toEqual([]);
  });

  it("treats only the canonical tag and reviewed legacy tags as stored-tag evidence", () => {
    expect(tagFormsFor("Rationalisation")).toEqual(["rationalisation", "ptr"]);
    expect(tagFormsFor("TET")).toEqual(["tet", "aptet"]);
    expect(tagFormsFor("Exams")).toEqual(["exams", "answer key"]);
    // Search aliases are words a teacher types, not proof of a stored topic.
    expect(tagFormsFor("DSC")).toEqual(["dsc"]);
    expect(tagFormsFor("School Administration")).toEqual(["school administration"]);
  });

  it("allows exactly the three audited legacy tags (PR #6 review)", () => {
    const legacy = TOPIC_TERMS.flatMap((t) => (t.legacyTags ?? []).map((l) => `${l} -> ${t.tag}`));
    expect(legacy).toEqual(["PTR -> Rationalisation", "APTET -> TET", "Answer Key -> Exams"]);
  });
});
