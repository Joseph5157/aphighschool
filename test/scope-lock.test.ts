import { describe, it, expect } from "vitest";
import { tsxFiles, readSource, stripComments } from "./class-source";

// AGENTS.md's Scope Lock is explicit: AP only, never Telangana content
// assumptions. UI-AUDIT-1 (F25) found three tool-metadata descriptions already
// claiming "AP and TS" / "Telangana" service, and UI-CONTENT-1 found two more
// instances the same grep-and-fix-one-file approach had missed (the tax
// calculator's HRA rule copy and the pensioners hub's hero copy) — one
// repository-wide guard closes the whole defect class instead of the next
// single file.
describe("AP-only scope lock — no Telangana content assumptions in the public UI", () => {
  const offenders = ["Telangana", "AP and TS", "AP & TS"];

  it("contains no Telangana/AP-and-TS phrasing anywhere under app/(public)", () => {
    const files = tsxFiles("app/(public)");
    const hits: string[] = [];

    for (const file of files) {
      const source = stripComments(readSource(file));
      for (const phrase of offenders) {
        if (source.includes(phrase)) hits.push(`${file}: "${phrase}"`);
      }
    }

    expect(hits).toEqual([]);
  });
});
