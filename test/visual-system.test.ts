// @vitest-environment node
//
// SLOP-VISUAL-1 guards — AI_SLOP_AUDIT.md A03 (emoji as an icon system),
// A04 (sub-12px typography) and A05 (mono uppercase label drift).
//
// These are source guards rather than render guards on purpose: all three
// findings are about a *device* used across many routes, so the invariant is
// "this device does not reappear anywhere in the public product", which a
// per-component render test cannot express. `visual-system-render.test.tsx`
// carries the paired "the information is still there" half.
import { describe, it, expect } from "vitest";
import path from "node:path";
import { tsxFiles, readSource, stripComments } from "./class-source";

const PUBLIC_ROOT = "app/(public)";
const files = tsxFiles(PUBLIC_ROOT);

/** Emoji and pictographic dingbats — the blocks A03's evidence is drawn from. */
const EMOJI = /[\u{2300}-\u{23FF}\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{FE0F}]/u;

/**
 * The two symbols that are NOT decoration and are deliberately kept.
 *
 * `✓` marks a completed step — in LifecycleStepper (a protected zone: the
 * recruitment stepper is product, not ornament) and in the pension office
 * pipeline. It states which stages are done, which is the whole content of a
 * stepper; there is no adjacent label carrying that meaning, so A03's
 * "remove when the label already does the work" does not apply.
 */
const SEMANTIC_MARKS = new Set(["✓"]);

describe("A03 — no emoji icon system in the public product", () => {
  it("renders no emoji anywhere in app/(public)", () => {
    const offenders: string[] = [];

    for (const file of files) {
      // Comments legitimately quote the emoji that were removed, precisely so
      // the reason survives in the file the change was made in.
      const source = stripComments(readSource(file));
      source.split("\n").forEach((line, index) => {
        for (const char of line) {
          if (EMOJI.test(char) && !SEMANTIC_MARKS.has(char)) {
            offenders.push(`${file}:${index + 1} ${char} — ${line.trim().slice(0, 70)}`);
          }
        }
      });
    }

    expect(offenders).toEqual([]);
  });

  it("keeps the completion mark that states stepper state", () => {
    // Paired with the rule above: proving emoji are gone is worthless if the
    // sweep also took the one symbol that carries meaning.
    expect(readSource("app/(public)/posts/[slug]/_components/LifecycleStepper.tsx")).toContain("✓");
  });

  it("draws every icon-only control and disclosure chevron as inline SVG", () => {
    // The three controls A03 named that had a bare character as their entire
    // visible content. Each must now carry an <svg> on currentColor.
    for (const file of [
      "app/(public)/posts/[slug]/_components/ThumbZoneBar.tsx",
      "app/(public)/posts/[slug]/_components/TableOfContents.tsx",
      "app/(public)/_components/BottomNav.tsx",
    ]) {
      const source = readSource(file);
      expect(source, file).toContain('stroke="currentColor"');
      // Comments name the glyph they replaced, so only rendered source counts.
      expect(stripComments(source), file).not.toMatch(/[↗▲▼]/);
    }
  });
});

/**
 * Sub-12px type that is deliberately kept, with the reason.
 *
 * A04 carves out one case explicitly: "The 9–11px print-form typography inside
 * tax form reproductions is a separate, intentional print-density case and
 * should not be swept into the same classification without print review."
 *
 * Every entry below was checked against that carve-out and sits inside an
 * official A4 form reproduction — the Annexure-I / Form 10E / Form-16 blocks
 * that render on `bg-white` with `border-black` and `print-page-break`, and the
 * STO restoration application's signature block. None of them is screen chrome.
 *
 * The list is exact lines rather than a file-level exclusion on purpose: a
 * file-level exclusion would let a NEW screen-side 9px label into
 * TaxCalculatorUI unnoticed, which is exactly how the 57-element count on
 * /tools accumulated in the first place.
 */
const PRINT_TYPE_ALLOWLIST = new Set([
  "app/(public)/tools/tax-calculator/_components/TaxCalculatorUI.tsx:886",
  "app/(public)/tools/tax-calculator/_components/TaxCalculatorUI.tsx:902",
  "app/(public)/tools/tax-calculator/_components/TaxCalculatorUI.tsx:1065",
  "app/(public)/tools/tax-calculator/_components/TaxCalculatorUI.tsx:1120",
  "app/(public)/tools/tax-calculator/_components/TaxCalculatorUI.tsx:1152",
  "app/(public)/tools/tax-calculator/_components/TaxCalculatorUI.tsx:1230",
  "app/(public)/tools/tax-calculator/_components/TaxCalculatorUI.tsx:1236",
  "app/(public)/tools/tax-calculator/_components/TaxCalculatorUI.tsx:1281",
  "app/(public)/tools/tax-calculator/_components/TaxCalculatorUI.tsx:1840",
  "app/(public)/pensioners/commutation-tracker/_components/CommutationTrackerUI.tsx:90",
]);

describe("A04 — 12px is the floor for screen type", () => {
  it("uses no sub-12px font size outside the reviewed print forms", () => {
    // DESIGN_SYSTEM.md §1.2: "12px is the absolute floor for any text,
    // including badges, helper text and captions."
    const belowFloor = /text-\[(\d+(?:\.\d+)?)px\]/g;
    const offenders: string[] = [];

    for (const file of files) {
      const normalized = file.split(path.sep).join("/");
      readSource(file)
        .split("\n")
        .forEach((line, index) => {
          for (const match of line.matchAll(belowFloor)) {
            if (Number(match[1]) >= 12) continue;
            const site = `${normalized}:${index + 1}`;
            if (PRINT_TYPE_ALLOWLIST.has(site)) continue;
            offenders.push(`${site} ${match[0]} — ${line.trim().slice(0, 70)}`);
          }
        });
    }

    expect(offenders).toEqual([]);
  });

  it("still renders the print forms at their reviewed density", () => {
    // The paired half: the floor must not have been reached by flattening the
    // official A4 layouts, which are a print artefact and not screen UI.
    const taxCalculator = readSource("app/(public)/tools/tax-calculator/_components/TaxCalculatorUI.tsx");
    expect(taxCalculator).toContain("print-page-break");
    expect((taxCalculator.match(/text-\[(?:9\.5|11)px\]/g) ?? []).length).toBe(9);
  });
});

describe("A05 — mono and uppercase are reserved, not decorative", () => {
  it("never styles a heading as a tiny tracked mono eyebrow", () => {
    // DESIGN_SYSTEM.md §1.3 and A05's direction: "use the normal heading face
    // for section identity", reserving mono for dates, GO/reference numbers,
    // status and calculator figures.
    const offenders: string[] = [];

    for (const file of files) {
      const source = stripComments(readSource(file));
      for (const match of source.matchAll(/<h[123]\b[^>]*>/g)) {
        const tag = match[0];
        if (/font-mono/.test(tag) && /uppercase/.test(tag)) {
          offenders.push(`${file}: ${tag.slice(0, 90)}`);
        }
      }
    }

    expect(offenders).toEqual([]);
  });

  it("sets no button label in ALL CAPS", () => {
    // §13: "Sentence case for headings, labels and buttons. Not Title Case,
    // not ALL CAPS except §1.3." ThumbZoneBar's primary action was the last one.
    const offenders: string[] = [];

    for (const file of files) {
      const source = stripComments(readSource(file));
      for (const match of source.matchAll(/<button\b[^>]*>/g)) {
        if (/uppercase/.test(match[0])) offenders.push(`${file}: ${match[0].slice(0, 90)}`);
      }
    }

    expect(offenders).toEqual([]);
  });

  it("sets no form label in tracked ALL CAPS", () => {
    // Every field label in the product renders through FieldLabel, so this one
    // element put eight tracked uppercase labels in a single calculator column
    // — §1.3 permits at most one per region.
    const offenders: string[] = [];

    for (const file of files) {
      const source = stripComments(readSource(file));
      for (const match of source.matchAll(/<label\b[^>]*>/g)) {
        if (/uppercase/.test(match[0])) offenders.push(`${file}: ${match[0].slice(0, 90)}`);
      }
    }

    expect(offenders).toEqual([]);
  });

  it("keeps mono uppercase on the data and classification it is for", () => {
    // The paired half. A05 is "mono has spread beyond data", not "remove mono";
    // stripping it from document data would be the same mistake in reverse.
    expect(readSource("app/(public)/_components/UpcomingActionDates.tsx")).toMatch(
      /font-mono[^"]*uppercase|uppercase[^"]*font-mono/
    );
    expect(readSource("app/(public)/category/[slug]/page.tsx")).toMatch(
      /font-mono[^"]*uppercase|uppercase[^"]*font-mono/
    );
  });
});
