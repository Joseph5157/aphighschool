import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";

// NAV-THEME-TARGET-1: below the `sm` breakpoint ThemeToggle hides its
// "Night mode"/"Day mode" label, so its painted width is just the icon plus
// padding — measured 42px in real Chromium, 2px short of the
// docs/ui/DESIGN_SYSTEM.md §8.1 44px touch-target floor (height already met
// it via `min-h-[44px]`). The fix reuses Button.tsx's `sm`-size pattern (a
// transparent `::after` overlay that extends the hit area without adding to
// the element's own flex-layout width) rather than a real min-width, which
// would have consumed part of the 320px header clearance NAV-HEADER-320-1
// just fixed. `getBoundingClientRect`/geometry assertions belong in the
// gate's own real-Chromium measurement (docs/context/NAV_THEME_TARGET_PLAN.md),
// not here — jsdom does not compute pseudo-element layout at all, so this
// guards the *source pattern* instead, matching test/nav.test.tsx's and
// test/nav-header-320.test.tsx's existing approach for this repo.
describe("ThemeToggle 44px hit area (NAV-THEME-TARGET-1)", () => {
  const source = fs.readFileSync(
    path.join(process.cwd(), "app/(public)/_components/ThemeToggle.tsx"),
    "utf8"
  );

  function buttonOpenTag(): string {
    const start = source.indexOf("<button");
    expect(start, "ThemeToggle's <button> not found").toBeGreaterThan(-1);
    // None of the button's attributes (onClick={...}, aria-pressed={...}, the
    // title ternary) contain a bare `>`, so the first one after `<button` is
    // the opening tag's own close.
    const end = source.indexOf(">", start);
    expect(end, "could not find end of <button> opening tag").toBeGreaterThan(start);
    return source.slice(start, end + 1);
  }

  it("keeps the 44px minimum height", () => {
    // No trailing \b: `]` is a non-word char almost always followed by
    // another non-word char (space, quote), so \b never matches right after
    // a Tailwind arbitrary-value bracket — the leading \b is enough to avoid
    // matching inside a longer token.
    expect(buttonOpenTag()).toMatch(/\bmin-h-\[44px\]/);
  });

  it("is positioned so an ::after overlay can extend its hit area", () => {
    expect(buttonOpenTag()).toMatch(/\brelative\b/);
  });

  it("carries a transparent, full-height ::after overlay", () => {
    const tag = buttonOpenTag();
    expect(tag).toMatch(/\bafter:absolute\b/);
    expect(tag).toMatch(/after:content-\[['"]{2}\]/);
    // Full-height (not shrinking the overlay vertically below the already-met 44px).
    expect(tag).toMatch(/\bafter:inset-y-0\b/);
  });

  it("extends the overlay horizontally past the painted box (the actual fix)", () => {
    const tag = buttonOpenTag();
    // A negative horizontal inset is what grows the hit area sideways;
    // without it the overlay is inert (just retraces the painted box).
    expect(tag).toMatch(/after:-inset-x-(1|2|\[[^\]]+\])/);
  });

  it("does not change the painted min-width (would eat into the 320px header clearance)", () => {
    // Regression guard: a real min-w-[44px] here would consume flex space in
    // the header row NAV-HEADER-320-1 fixed. The overlay technique must stay
    // an overlay, not a layout-affecting box.
    expect(buttonOpenTag()).not.toMatch(/\bmin-w-\[44px\]/);
  });
});
