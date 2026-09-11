# ThemeToggle 44px touch-target fix — record

Branch: `nav-theme-target-1`. Branch point: verified clean `main` at
`07ed430185786f581901c06064c4d8ca596a5a8b` (the `NAV-HEADER-320-1` merge commit).

## Problem

`NAV-HEADER-320-1` merge verification measured `ThemeToggle` at 42×44px below the `sm` (640px)
breakpoint — 2px short of `docs/ui/DESIGN_SYSTEM.md` §8.1's 44×44px touch-target floor on width.
Pre-existing, not a regression from the header fix.

## Read first

`PRODUCT.md`, `DESIGN.md`, `docs/ui/DESIGN_SYSTEM.md` §8.1 (touch targets — "applies to the *hit
area*, which may exceed the visible box"), `docs/context/NAV_HEADER_320_PLAN.md`,
`ThemeToggle.tsx`, `app/(public)/layout.tsx`, `Button.tsx` (already solves this exact problem for
its `sm` size), `test/nav.test.tsx`, `test/nav-header-320.test.tsx`.

## Baseline (real Chromium, production build, `next start`, before any code change)

| Width | ThemeToggle | Icon | Header h | Brand→theme gap | Overflow | Console |
| --- | --- | --- | --- | --- | --- | --- |
| 280 (diagnostic) | 42×44px | 16×16 | 69px | 16px | 26px | clean |
| 320 | **42×44px** | 16×16 | 69px | 16px | 0px | clean |
| 360 | 42×44px | 16×16 | 69px | 33.8px | 0px | clean |
| 390 | 42×44px | 16×16 | 69px | 63.8px | 0px | clean |
| 768 | 120×44px | 16×16 | 69px | 272.3px | 0px | clean |
| 1024 | 102.1×44px | 16×16 | 69px | 542.3px | 0px | clean |
| 1440 | 120×44px | 16×16 | 69px | 912.3px | 0px | clean |

The deficit exists only below `sm` (280–390px here), where `ThemeToggle`'s `"Night mode"`/`"Day
mode"` text span is `hidden sm:inline` — the painted width there is icon + horizontal padding
only. At `sm` and up (768px+) the label renders and the control is already comfortably ≥44px
wide; no fix is needed or applied differently there.

## Root cause

```
<button
  ...
  className="inline-flex min-h-[44px] items-center gap-1.5 rounded-lg border border-hair/80
             bg-paperRaised/80 px-3 font-mono text-xs font-semibold text-ink
             transition-colors duration-150 hover:bg-paper"
>
```

`min-h-[44px]` guarantees the height floor but there is no equivalent width guarantee — below
`sm`, width is whatever the icon (16px) + `gap-1.5` (6px, inert with one visible child) + `px-3`
padding (24px total) computes to: 42px, measured.

## Fix

Reused `Button.tsx`'s existing, documented pattern for exactly this situation (`DESIGN_SYSTEM.md`
§8.1: *"the hit area... may exceed the visible box"*; `Button`'s `sm` size: *"stays visually 36px
— raising it to 44 would change density... reaches the floor through a transparent `::after`
overlay that extends the hit area without affecting layout"*). `Button`'s `sm` extends vertically
(`after:-inset-y-1`); `ThemeToggle` needed the same idea extended **horizontally**:

```
className="relative inline-flex min-h-[44px] items-center gap-1.5 rounded-lg border
           border-hair/80 bg-paperRaised/80 px-3 font-mono text-xs font-semibold text-ink
           transition-colors duration-150 hover:bg-paper
           after:absolute after:inset-y-0 after:-inset-x-1 after:content-['']"
```

`after:-inset-x-1` extends the transparent overlay 4px past each side of the painted box (50px
total hit width, well past the 44px floor), `after:inset-y-0` keeps it exactly the button's own
height (already at the floor, no vertical change needed). Because the overlay is
`position: absolute`, it does not participate in flex layout — the button's own rendered/painted
width is **unchanged** (confirmed: still exactly 42px at every width, before and after), so this
carries zero risk to the `NAV-HEADER-320-1` clearance.

### Why not a real `min-w-[44px]`

The gate brief's own "likely solution" and acceptance criteria anticipated a real width increase
(*"if the new 44px width consumes 2px of the current +16px clearance, that is acceptable"*) — but
since this codebase already has a proven, in-repo pattern for widening only the *hit area* at zero
layout cost, that is strictly better: it meets the same accessibility requirement with **no**
reduction to the 320px clearance at all, rather than a small but nonzero one. Verified this is not
"blindly wrapping another interactive element" per the gate's caution — `ThemeToggle` has exactly
one interactive element (the `<button>` itself, confirmed by source read); the overlay lives on
that same element via its own `::after`, not a separate wrapper.

## Verification the hit area actually works

Real-Chromium click test: clicked at a point 2px outside the painted box's left edge (inside the
overlay-only region) — the theme toggled (`document.documentElement.classList` gained `dark`),
confirming the enlarged hit area is genuinely interactive, not just visually implied. Computed
`getComputedStyle(button, '::after')` confirmed `left: -4px; right: -4px` (50px total hit width at
320px, where the painted box is 42px).

## 320px before/after header gap

| | Brand width | Subtitle width | Gap: brand → theme | Overflow |
| --- | --- | --- | --- | --- |
| Before | 174px | 126px | 16px | 0px |
| After | 174px | 126px | **16px (unchanged)** | 0px |

The clearance `NAV-HEADER-320-1` established is **fully preserved** — not reduced by even 1px,
because the fix never touches the button's flex-layout width.

## Target dimensions at representative widths (after fix)

| Width | Painted box | Hit area (computed) | Header h | Overflow |
| --- | --- | --- | --- | --- |
| 280 (diagnostic) | 42×44px | 50×44px | 69px | 26px (unchanged, pre-existing) |
| 320 | 42×44px | 50×44px | 69px | 0px |
| 360 | 42×44px | 50×44px | 69px | 0px |
| 390 | 42×44px | 50×44px | 69px | 0px |
| 768 | 120×44px | 128×44px | 69px | 0px |
| 1024 | 102.1×44px | 110.1×44px | 69px | 0px |
| 1440 | 120×44px | 128×44px | 69px | 0px |

Hit area ≥44×44px at every width, including the already-wide `sm+` sizes where the overlay is
present but was never load-bearing.

## Accessibility

- Target: ≥44×44px confirmed at every required width (painted height was already 44px; painted
  width unchanged at 42px below `sm`, but the interactive hit area is 50px there — verified by a
  real click 2px outside the painted box).
- Accessible name: unchanged — `aria-label="Dark theme"` before and after (this label's existing
  behavior of not flipping to "Light theme" when active predates this gate and is out of scope).
- Keyboard activation: unchanged and verified — focused the button, pressed `Enter`, the theme
  toggled.
- Focus-visible: unchanged and verified — `getComputedStyle(document.activeElement).outlineStyle`
  returns `"solid"` on focus, the same global treatment.
- No duplicate interactive wrapper: `ThemeToggle` has exactly one interactive element (the
  `<button>`); the overlay is that same element's own `::after`, not a second focusable/clickable
  node.

## Tests

`test/nav-theme-target.test.tsx` — five structural assertions against `ThemeToggle.tsx`'s source
(same string-assertion pattern as `test/nav.test.tsx` / `test/nav-header-320.test.tsx`, chosen
over jsdom geometry assertions because jsdom does not compute pseudo-element layout at all — a
`::after` inset assertion there would test nothing real):

1. `min-h-[44px]` still present (height floor untouched).
2. `relative` present (required for the `::after` overlay to position against this element).
3. `after:absolute` + `after:content-['']` + `after:inset-y-0` present (the overlay itself, full
   height).
4. A negative horizontal `after:-inset-x-*` present (the actual width-extending mechanism — its
   absence would make the overlay inert).
5. `min-w-[44px]` **absent** (regression guard: a real width floor here would consume the 320px
   header clearance `NAV-HEADER-320-1` fixed).

**Mutation-checked**: reverted the `className` to its pre-fix baseline value and confirmed 3 of the
5 assertions (relative / overlay / horizontal inset) correctly failed with the reverted class
string printed in the diff; restored and confirmed all 5 pass again.

## Validation

- `npx vitest run test/nav-theme-target.test.tsx` — 5/5 passed.
- `npx vitest run` (full suite) — **72 files, 513 tests, all passed**, including
  `test/tailwind-classes.test.ts`, `test/nav.test.tsx`, `test/nav-header-320.test.tsx`,
  `test/mobile-nav.test.tsx`, `test/detail-header.test.tsx` (all unaffected).
- `npx tsc --noEmit` — clean.
- `git diff --check` — clean.
- `npx next build` — clean production build.
- Chromium acceptance — all 7 required widths measured above; zero console errors; zero
  regression to header height, brand geometry, or the 320px clearance at any width; real-click and
  real-keyboard activation verified.

## Files changed

- `app/(public)/_components/ThemeToggle.tsx` — `::after` hit-area overlay fix.
- `test/nav-theme-target.test.tsx` — new regression guard.
- `docs/context/NAV_THEME_TARGET_PLAN.md` — this file, new.
