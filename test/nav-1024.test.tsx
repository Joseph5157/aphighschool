import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";

// NAV-1024-1: at exactly the 1024px breakpoint where DesktopNav turns on,
// its six links' natural single-line width (602.5px with the base gap-6)
// plus ThemeToggle's full "Night mode"/"Day mode" label plus the CMS button
// exceeded the row's available width by ~122px, measured in real Chromium
// (docs/context/NAV_1024_PLAN.md) — nothing protected the multi-word labels
// from wrapping, so "Orders & Circulars", "Utility Tools", "Service Desk"
// and "Pensioners Hub" silently wrapped to two lines instead. The fix has
// two parts, both guarded here: DesktopNav never wraps and uses a tighter
// gap only in the 1024–1199px deficit band (restored to gap-6 from 1200px,
// where real-Chromium measurement confirmed it's no longer needed); and
// ThemeToggle's decorative text label — already hidden below `sm`, same
// accessible name via aria-label regardless — is hidden again in that same
// exclusive 1024–1199px band to free the remaining space, and restored at
// 1200px. Source-assertion style (this repo's existing pattern for
// non-trivially-mountable components), not jsdom geometry — jsdom doesn't
// lay out media queries at all, so a viewport-width assertion here would
// guard nothing real.
describe("DesktopNav single-line labels at 1024px (NAV-1024-1)", () => {
  const desktopNav = fs.readFileSync(
    path.join(process.cwd(), "app/(public)/_components/DesktopNav.tsx"),
    "utf8"
  );
  const themeToggle = fs.readFileSync(
    path.join(process.cwd(), "app/(public)/_components/ThemeToggle.tsx"),
    "utf8"
  );

  // Extracts only the quoted VALUE of a `className="..."` attribute, not
  // the surrounding tag — a JSX comment can legally sit between other
  // attributes and `className` (as DesktopNav's own explanatory comment
  // does here), and a regex run against the whole tag would silently match
  // words mentioned in that prose instead of the actual class list. This
  // was caught by this test file's own mutation check: reverting the real
  // fix still "passed" three assertions until this extraction was fixed to
  // isolate just the attribute value.
  function classNameValue(source: string, fromIndex: number): string {
    const attrStart = source.indexOf("className=", fromIndex);
    expect(attrStart, "className attribute not found").toBeGreaterThan(-1);
    const quoteStart = source.indexOf('"', attrStart) + 1;
    const quoteEnd = source.indexOf('"', quoteStart);
    return source.slice(quoteStart, quoteEnd);
  }

  function navClassName(): string {
    const start = desktopNav.indexOf("<nav");
    expect(start, "DesktopNav's <nav> not found").toBeGreaterThan(-1);
    return classNameValue(desktopNav, start);
  }

  it("never lets a multi-word destination label wrap", () => {
    expect(navClassName()).toMatch(/\bwhitespace-nowrap\b/);
  });

  it("uses a tighter gap in the 1024-1199px deficit band", () => {
    // Not gap-6 (the base/wide-screen value) as the unconditional gap —
    // that's exactly what caused the wrap in the first place.
    expect(navClassName()).toMatch(/\bgap-2\b/);
  });

  it("restores the original gap-6 spacing from 1200px, where it's no longer needed", () => {
    expect(navClassName()).toMatch(/min-\[1200px\]:gap-6/);
  });

  it("does not eliminate inter-link spacing entirely (gap-0) to force-fit", () => {
    // Regression guard against overcorrecting: a future edit that swaps
    // gap-2 for gap-0 would technically still "fit" but violates the gate's
    // own "don't eliminate breathing room merely to force fit" instruction.
    expect(navClassName()).not.toMatch(/\bgap-0\b/);
  });

  function labelSpanClassName(): string {
    const idx = themeToggle.indexOf('{isDark ? "Day mode" : "Night mode"}');
    expect(idx, "ThemeToggle's Night/Day mode label span not found").toBeGreaterThan(-1);
    const tagStart = themeToggle.lastIndexOf("<span", idx);
    return classNameValue(themeToggle, tagStart);
  }

  it("keeps the existing hidden-below-sm behavior for the theme label", () => {
    const cls = labelSpanClassName();
    expect(cls).toMatch(/\bhidden\b/);
    expect(cls).toMatch(/\bsm:inline\b/);
  });

  it("hides the theme label again in the same exclusive 1024-1199px band DesktopNav is tight in", () => {
    expect(labelSpanClassName()).toMatch(/min-\[1024px\]:max-\[1199px\]:hidden/);
  });

  it("restores the theme label at 1200px, matching DesktopNav's own restore point", () => {
    expect(labelSpanClassName()).toMatch(/min-\[1200px\]:inline/);
  });
});
