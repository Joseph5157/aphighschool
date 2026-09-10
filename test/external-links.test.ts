import { describe, it, expect } from "vitest";
import { tsxFiles, readSource } from "./class-source";

// UI-LINKS-1: every hardcoded external government-portal URL in app/(public) was
// checked with a live fetch. Three domains no longer resolve at all (verified twice,
// both via WebFetch and curl, not a transient blip):
//   - agap.cas.nic.in   (AG AP pension portal — PensionersSidebar, since renamed
//                        OfficialPensionPortals by SLOP-DENSITY-1)
//   - agap.ap.nic.in    (AG AP GPF portal — CfmsCheckerUI)
//   - esr.ap.gov.in     (e-SR portal — CfmsCheckerUI; no working replacement could be
//                         found either, despite AP having recently relaunched "e-SR 2.0"
//                         per GO 57 (2026-07-20) — removed rather than guessed, per
//                         AGENTS.md's "nothing may be invented" rule)
// The first two were replaced with the verified-working agaeap.cag.gov.in successors
// (AG AP's office migrated its whole domain to the CAG-run agaeap.cag.gov.in site); the
// third was removed outright. Also: the two `http://www.ehs.ap.gov.in` links didn't
// reliably resolve over plain http — https does — so both were upgraded.
describe("no known-broken government portal links in the public UI", () => {
  const deadDomains = ["agap.cas.nic.in", "agap.ap.nic.in", "esr.ap.gov.in"];

  it("never links to a domain confirmed not to resolve", () => {
    const files = tsxFiles("app/(public)");
    const hits: string[] = [];

    for (const file of files) {
      const source = readSource(file);
      for (const domain of deadDomains) {
        if (source.includes(domain)) hits.push(`${file}: "${domain}"`);
      }
    }

    expect(hits).toEqual([]);
  });

  it("never links to ehs.ap.gov.in over plain http", () => {
    const files = tsxFiles("app/(public)");
    const hits: string[] = [];

    for (const file of files) {
      const source = readSource(file);
      if (/http:\/\/(www\.)?ehs\.ap\.gov\.in/.test(source)) hits.push(file);
    }

    expect(hits).toEqual([]);
  });

  it("points the AG AP pension and GPF links at the verified agaeap.cag.gov.in domain", () => {
    const pensionPortals = readSource(
      "app/(public)/pensioners/_components/OfficialPensionPortals.tsx"
    );
    const cfmsChecker = readSource(
      "app/(public)/tools/cfms-checker/_components/CfmsCheckerUI.tsx"
    );

    expect(pensionPortals).toContain("https://agaeap.cag.gov.in/Pension/Home");
    expect(cfmsChecker).toContain("https://agaeap.cag.gov.in/gpf/");
  });
});
