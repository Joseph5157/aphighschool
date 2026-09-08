# UI Active Gate

## Active gate

`UI-RESPONSIVE-1`

## Status

CLOSED

## Purpose

Repair responsive structure and overflow: close audit finding F1, remove the causes of
accidental page-level horizontal scrolling, and standardise gutters where the audit showed
inconsistency.

## Change boundary

Responsive layout and overflow only. In scope: fixed/sticky positioning, grids that cannot
shrink, scroll containers, page gutters, and the 768–1023px band.

Out of scope and untouched: page redesign, information architecture, and **all drawer
behaviour** — Escape, focus trap, scroll lock, closed-state inertness remain
`UI-MOBILE-NAV-1`. Typography was touched only where a size was itself a defect.

## Required closure evidence

- Starting worktree clean on `ui-system-production-readiness` at
  `447f8ae7be8db5660c2e2c1d8f1bad83db560263`, local and live remote in agreement.
- F1 is closed and mutation-tested: reverting `BottomNav`'s yield restores the collision and
  fails the guard.
- No global `overflow-x-hidden` masks any structural problem; a guard forbids it on the shell.
- The single `lg` navigation breakpoint is preserved and guarded against a second one being
  hard-coded in JS.
- Full Vitest suite passes: 47 files, 330 tests. `npx tsc --noEmit` passes, Tailwind utility
  validation passes, `git diff --check` clean.
- Every new arbitrary utility — including the `calc()`/`env()` safe-area values — was
  confirmed to compile against the project's own Tailwind build.
- Committed, pushed, and local branch HEAD matches the live remote branch SHA.

## Closure notes

**F1 needed a mechanism, not a class.** `ThumbZoneBar` is rendered by the page and `BottomNav`
by the layout, so neither could hide the other in CSS. `BottomBarSlot` is the smallest thing
that lets them agree, and it makes the design system's "at most one fixed bottom bar" rule
enforceable rather than aspirational. Stacking the two bars was rejected: two bars would eat
roughly 110px of a 640px phone viewport on the product's most-read page.

**The audit's "long URLs" risk was not real.** No raw URL renders as visible text anywhere —
every source and PDF link carries a written label. Recorded rather than "fixed", because
inventing a fix for a defect that does not exist is its own kind of error.

**A UI-SYSTEM-2 claim was wrong and is corrected.** That gate reported no sub-12px type left
in `app/(public)/_components`. Its sweep matched sizes by integer, so `PostCard`'s
`text-[8.5px]` — the smallest text in the product — survived two gates unseen. It is fixed,
and the guard is now decimal-aware.

## What this gate could NOT verify

jsdom does not lay out, so **no test here proves a page does not scroll sideways at 320px.**
What is proven is structural: how many fixed bars mount, that no `w-screen` or oversized
fixed width exists, that no shell-level `overflow-x-hidden` hides anything, and that wide
scroll regions are keyboard-reachable. Actual rendering at the eight target widths is
`UI-ACCEPTANCE-1`.

## Next gate after closure

`UI-MOBILE-NAV-1`
