# DesktopNav 1024px wrapping fix — record

Branch: `nav-1024-1`. Branch point: verified clean `main` at
`5b99f0c8696ea942e2d1fc837e6b8262353a9e35`.

## Problem

`NAV-HEADER-320-1` and `NAV-THEME-TARGET-1` merge verification both noted, as a pre-existing,
out-of-scope side finding, that at exactly the 1024px desktop-navigation breakpoint,
`DesktopNav`'s "Orders & Circulars" and "Service Desk" links wrapped onto two lines. This gate is
the focused fix for that defect.

## Read first

`PRODUCT.md`, `DESIGN.md`, `docs/ui/DESIGN_SYSTEM.md`, `docs/context/NAV_HEADER_320_PLAN.md`,
`docs/context/NAV_SEARCH_PLAN.md`, `app/(public)/layout.tsx`, `DesktopNav.tsx`,
`ThemeToggle.tsx`, `Button.tsx` (CMS control), `test/nav.test.tsx`, `test/nav-header-320.test.tsx`,
`test/nav-theme-target.test.tsx`.

## Baseline (real Chromium, production build, `next start`, before any code change)

| Width | `nav` display | Nav width | Lines wrapping | Theme width | CMS width | Header h | Overflow |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 1000 (diagnostic) | `none` | — | — (mobile model) | 120 | 63.5 | 69px | 0 |
| 1024 | `flex` | 510.3px | 4 of 6 (2-line) | 102.1 | 51.4 | 69px | 0 |
| 1050 | `flex` | 529.9px | 4 of 6 (2-line) | 105.9 | 54.0 | 69px | 0 |
| 1100 | `flex` | 567.6px | 4 of 6 (2-line) | 113.3 | 58.9 | 69px | 0 |
| 1200 | `flex` | 602.5px | 0 (single-line) | 120 | 63.5 | 69px | 0 |
| 1280 | `flex` | 602.5px | 0 (single-line) | 120 | 63.5 | 69px | 0 |
| 1440 | `flex` | 602.5px | 0 (single-line) | 120 | 63.5 | 69px | 0 |

At 1024–1100px, four of the six links wrap to two lines — not just the two the gate brief named
("Orders & Circulars", "Utility Tools", "Service Desk", "Pensioners Hub"; only the single-word
"Home" and "Search" stay on one line). No page-level overflow at any width — the defect is
entirely absorbed by silent wrapping, not by scroll.

**A second, unexpected finding**: `ThemeToggle` and the CMS button are *also* compressed below
their natural width at 1024–1100px (102.1px/51.4px vs. their own 1200px+ natural values of
120px/63.5px) — neither has any `shrink-0` protection, so they were quietly absorbing part of the
same space deficit alongside the nav's line-wrapping, not sitting at a stable size.

## Root cause

`DesktopNav.tsx`'s `<nav>` had no `white-space: nowrap` anywhere, and used a flat `gap-6` (24px)
between all six links at every width ≥1024px. With nothing to prevent it, the browser's own
line-breaking is what "solved" the space deficit — multi-word labels wrapped at their internal
space character, which is *why* only multi-word labels were affected.

Measuring each element's true natural (unwrapped, unshrunk) width and adding up the full row:

- Brand group (protected by `NAV-HEADER-320-1`'s `lg:shrink-0`): 252.2px, confirmed stable.
- `DesktopNav` natural single-line width (`gap-6`, unwrapped labels — from the 1200px+ readings):
  602.5px (six label widths summing to 482.4px + 5 gaps × 24px = 120px).
- Right control group natural width (`ThemeToggle` + `gap-3` + CMS, unsquished — also from
  1200px+): 195.5px.
- Two outer row gaps (`gap-4`, between brand↔nav and nav↔controls): 32px.
- Header content width at 1024px (`1024 − 2×32` for `lg:px-8`): 960px.

Total natural demand: `252.2 + 602.5 + 195.5 + 32 = 1082.2px` against `960px` available — a
**genuine ~122px deficit** at exactly 1024px, not merely a missing `nowrap`. Confirmed by directly
testing `whitespace-nowrap` alone (Candidate A only): nav rendered single-line correctly, but the
*entire* deficit then landed on the unprotected right control group instead — `ThemeToggle`'s own
"Night mode" text visibly wrapped onto two lines inside the button (screenshotted, see Options
tested below). This is exactly the "if nowrap would create overflow or collision, measure that
explicitly" case the gate brief anticipated.

## Options tested

1. **A only — `whitespace-nowrap` on `DesktopNav`, no other change.** Rejected: measured and
   screenshotted at 1024px — nav renders single-line, but `ThemeToggle`'s "Night mode" label now
   wraps to two lines inside the button instead (moved the defect, didn't fix it).
2. **A + C — `whitespace-nowrap` plus a tighter `gap-2` on `DesktopNav`, restored to `gap-6` at
   `min-[1200px]:`, with the right control group left untouched.** Rejected: computed the maximum
   possible recovery from gap reduction alone — even `gap-0` (eliminating all inter-link spacing,
   itself unacceptable per the gate's own "don't eliminate breathing room" instruction) only
   recovers 120px against a ~122px true deficit once the right control group's *natural* (not
   squished) width is used in the sum. Gap reduction alone cannot close the gap without either an
   unacceptably tight gap or leaving something else to still compress.
3. **A + C + D — same nav fix, plus reusing `ThemeToggle`'s own existing hidden-below-`sm`
   pattern for its decorative text label in the same 1024–1199px band (chosen).** The label is
   already conditionally hidden below 640px with no loss of function (the button's `aria-label`
   carries its accessible name regardless of the visible text) — extending that exact,
   already-established pattern to the 1024–1199px deficit band is a smaller, more consistent
   change than inventing a new mechanism, and it's explicitly permitted by the gate's own
   candidate-D framing ("only if objectively necessary" — proven necessary by option 2's math,
   and no control is hidden, only a decorative label already known to be optional at other
   widths).

## Chosen fix

**`DesktopNav.tsx`** — the `<nav>` element:

```
className="hidden lg:flex items-center gap-2 min-[1200px]:gap-6 font-mono text-xs font-semibold
           text-inkSoft whitespace-nowrap"
```

- `whitespace-nowrap` (inherited by all child `<Link>`s — `white-space` is a CSS-inherited
  property) — no label can ever wrap again.
- `gap-2` (8px) replaces the unconditional `gap-6` (24px) as the *default* once `lg:flex` is
  active, recovering `5 × 16px = 80px` in the deficit band.
- `min-[1200px]:gap-6` restores the original 24px spacing from 1200px, the width real-Chromium
  measurement confirmed is the crossover point where the row no longer needs the tighter gap —
  1280px and 1440px are pixel-identical to baseline (unchanged).

**`ThemeToggle.tsx`** — the decorative label `<span>`:

```
className="hidden sm:inline min-[1024px]:max-[1199px]:hidden min-[1200px]:inline"
```

- Unchanged below `sm` (still hidden — icon only).
- Unchanged from 640–1023px (still visible — this range was never part of the deficit).
- **New**: hidden again in the exact same 1024–1199px band `DesktopNav` is tight in, via
  `min-[1024px]:max-[1199px]:hidden` — a single, self-contained media-query range with no
  cascade-order dependency on the neighboring `sm:` or `min-[1200px]:` rules (each of the three
  visibility rules owns an exclusive, non-overlapping width band, so source order between them
  never matters).
- Restored at exactly `min-[1200px]:`, matching `DesktopNav`'s own restore point.

With the label hidden, `ThemeToggle` returns to its known 42px width (the same value
`NAV-THEME-TARGET-1` established for below-`sm`; its 44×44px hit area, via the `::after` overlay
that gate added, is untouched and unaffected by this change). This freed enough space that the
CMS button also returned to its full natural 63.5px width at 1024px (previously squeezed to
51.4px) — this fix accidentally *repairs* that second finding as a side effect, not by design.

## Before/after measurements (real Chromium, production build)

| Width | Nav display | Nav width | Lines | Theme width | CMS width | Header h | Overflow | Gap brand↔nav | Gap nav↔theme |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1000 (diagnostic) | `none` (unchanged) | — | — | 120 | 63.5 | 69px | 0 | — | — |
| **1024** | `flex` | **522.5px** | **0 (all single-line)** | **42** | **63.5 (restored)** | 69px | **0** | 33.9px | 33.9px |
| 1050 | `flex` | 522.5px | 0 | 42 | 63.5 | 69px | 0 | 46.9px | 46.9px |
| 1100 | `flex` | 522.5px | 0 | 42 | 63.5 | 69px | 0 | 71.9px | 71.9px |
| 1200 | `flex` | 602.5px (restored) | 0 | 120 (restored) | 63.5 | 69px | 0 | 42.9px | 42.9px |
| 1280 | `flex` | 602.5px (unchanged) | 0 | 120 (unchanged) | 63.5 | 69px | 0 | 74.9px | 74.9px |
| 1440 | `flex` | 602.5px (unchanged) | 0 | 120 (unchanged) | 63.5 | 69px | 0 | 154.9px | 154.9px |

All six destinations render on exactly one line at every width from 1024px up. Header height
stays 69px throughout. Zero horizontal overflow at every width, including the 1000px diagnostic
where the mobile navigation model remains fully active (`DesktopNav` `display:none`, `BottomNav`
`display:block` — confirmed no mixed state). 1280px and 1440px are byte-for-byte unchanged from
baseline. Screenshots confirm the 1024px and 1200px transitions both look natural — no visibly
cramped gap at 1024px (33.9px clearance either side), no abrupt jump at 1200px (`ThemeToggle`'s
label reappearing coincides with the gap widening from `gap-2` to `gap-6` in the same render).

## Accessibility

- All 6 links retain their accessible names (`Home`, `Orders & Circulars`, `Utility Tools`,
  `Service Desk`, `Pensioners Hub`, `Search`) — confirmed via `innerText()` at 1024px.
- `aria-current="page"` still correctly applied to the active destination (`Home` on `/`).
- `ThemeToggle`'s `aria-label="Dark theme"` unchanged — the visible text is decorative only,
  never part of the accessible name.
- Focus-visible confirmed painting (`outlineStyle: "solid"`) on both a `DesktopNav` link and
  `ThemeToggle` after `.focus()`.
- Focus order unchanged — no elements added, removed, or reordered; only `className` changes on
  existing nodes.
- 44px `ThemeToggle` hit area from `NAV-THEME-TARGET-1` is untouched — the `::after` overlay logic
  wasn't touched, only the separate, decorative label `<span>` inside the same button.

## Regression guard

`test/nav-1024.test.tsx` — seven structural assertions against `DesktopNav.tsx`'s and
`ThemeToggle.tsx`'s source, extracting only the `className` attribute's *value* (not the whole
JSX tag) to avoid false matches against explanatory comments — this exact bug was caught by the
guard's own mutation check (see below) and fixed before merge:

1. `DesktopNav`'s `<nav>` carries `whitespace-nowrap`.
2. Carries `gap-2` (the tightened default), not just the base `gap-6`.
3. Carries `min-[1200px]:gap-6` (the restore point).
4. Does **not** carry `gap-0` (guards against overcorrecting past "don't eliminate breathing
   room").
5. `ThemeToggle`'s label span keeps `hidden sm:inline` (the pre-existing pattern, untouched).
6. Carries `min-[1024px]:max-[1199px]:hidden` (the new hide-again band).
7. Carries `min-[1200px]:inline` (the restore point, matching `DesktopNav`'s own).

**Mutation-checked, twice**: the first mutation-check run exposed a real bug in the test itself —
`navOpenTag()` captured the *entire* `<nav ...>` tag including a JSX comment sitting between
attributes, and that comment's own prose mentioned "whitespace-nowrap" as part of explaining the
fix, so three assertions **falsely passed** even with the real fix fully reverted. Rewrote the
extraction to isolate just the `className="..."` attribute value (`classNameValue()`), re-ran the
mutation check, and confirmed all five assertions that test the actual fix now correctly fail when
reverted (the two that still "pass" under reversion are vacuously true either way — `gap-0` was
never present in the baseline, and `hidden sm:inline` was never removed — so that's expected, not
a gap). Restored the fix and confirmed all 7 pass again.

## Validation

- `npx vitest run test/nav-1024.test.tsx` — 7/7 passed.
- `npx vitest run` (full suite) — **73 files, 520 tests, all passed**, including
  `test/tailwind-classes.test.ts`, `test/nav.test.tsx`, `test/nav-header-320.test.tsx`,
  `test/nav-theme-target.test.tsx`, `test/mobile-nav.test.tsx` (all unaffected).
- `npx tsc --noEmit` — clean.
- `git diff --check` — clean.
- `npx next build` — clean production build.
- Chromium acceptance — all 7 required widths measured above; zero console errors at any width;
  zero horizontal overflow; header height stable at 69px throughout; no mixed mobile/desktop
  navigation state at the 1000px diagnostic.

## Files changed

- `app/(public)/_components/DesktopNav.tsx` — nowrap + responsive gap fix.
- `app/(public)/_components/ThemeToggle.tsx` — decorative label hidden in the same deficit band.
- `test/nav-1024.test.tsx` — new regression guard.
- `docs/context/NAV_1024_PLAN.md` — this file, new.
