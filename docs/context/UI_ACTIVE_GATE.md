# UI Active Gate

## Active gate

`UI-A11Y-1`

## Status

CLOSED

## Purpose

An accessibility pass, per `UI_SYSTEM_MASTER_PLAN.md` Phase 14: keyboard navigation, focus,
semantics, labels, alt text, form errors, contrast, dialogs, menus, touch targets, and
reduced motion. `DESIGN_SYSTEM.md` §14 ("Accessibility floor") already states this gate's
definition of done, written at `UI-DESIGN-1` and never updated since.

## Scope boundary

Accessibility only — no visual redesign, no information-architecture change. Several original
`UI_AUDIT.md` findings tagged for this gate (F4, F6, F7, F13, F14/Dialog, F15, F17's nav
semantics, F28, F31, F32) were already closed by earlier gates that happened to touch the
same files (`UI-SYSTEM-1`, `UI-SYSTEM-2`, `UI-MOBILE-NAV-1`). This gate re-verified each
against current source (not old gate-history prose) before treating it as done, and did the
actual remaining work: four still-open findings plus a documented contrast disposition.

## Re-audit method

Rather than trust `UI_CURRENT_STATE.md`'s gate-history claims at face value, every
accessibility-tagged finding from `UI-AUDIT-1` (F4, F6, F7, F12, F13, F14, F15, F17, F26, F27,
F28, F31, F32) plus alt text, contrast, reduced motion, and other dialog/menu-shaped widgets
were re-checked directly against current source. Result: **13 of 17 checked items were
already fixed** (verified in source, not assumed from prose); **4 were still genuinely open**;
contrast remains unverified for the same reason every prior gate has recorded it that way (no
browser/contrast-measurement tool in this environment).

## What was found and fixed

### F12 — three routes had no `h1`; a fourth had two

`/pensioners/commutation-tracker`, `/pensioners/pension-calculator`, and
`/tools/prc-calculator` had no `<h1>` anywhere — each route's only "header" was a `Badge` +
an unheaded `<span>` (their print-view sections use `<h2>` correctly; the interactive view
never had its own heading at all). Fixed by promoting the existing label `<span>` to `<h1>`
in place, same className, same visual position — a semantic-only change, not a redesign.

`/tools/tax-calculator` rendered two `<h1>`s across different tab states: the tool's own
title (`activeTab === "calculator"`) and a printable "RECEIPT OF HOUSE RENT" document title
(`activeTab === "rentReceipt" || "printAll"`). These two conditions never overlap, so the two
`h1`s were never simultaneously present in the DOM — but a route's semantic heading
identity still shouldn't change depending on which tab is active. Demoted the receipt
section's heading to `<h2>`, matching every sibling calculator's own print-view convention
(`CommutationTrackerUI`, `PensionCalculatorUI`, `PrcCalculatorUI` all already use `<h2>` for
their printable-document titles — `TaxCalculatorUI`'s `rentReceipt` tab was the one
inconsistent case).

### F17 (remainder) — no skip-to-content link

Everything else F17 named (`aria-current="page"` on active nav, distinguishing `aria-label`
per `<nav>`) was already fixed by `UI-MOBILE-NAV-1`/`UI-SYSTEM-1`, confirmed in source this
gate. The skip link specifically was still missing. Added as the first element inside
`app/(public)/layout.tsx`'s provider tree — before the sidebar drawer, header, logo link, and
full desktop nav — `sr-only` until keyboard-focused, then visible and positioned above every
other layer (`z-[70]`, above the drawer's own `z-60`). Targets a new `id="main-content"` on
the existing `<main>` landmark. The root `app/not-found.tsx` boundary (added in `UI-404-1`,
not wrapped by this layout) was left alone — it has no complex nav to skip past.

### F26 (remainder) — `<th>` had no `scope`

The scroll-region fix (`tabIndex`, `role="region"`, label) was already done in
`UI-RESPONSIVE-1`, confirmed in source. `TableHead` itself still emitted a bare `<th>` with
no `scope`, and its one current consumer (`DaArrearsUI`'s 3-column table) didn't pass one
either. Defaulted `TableHead` to `scope="col"` — every existing call site is a column header —
while still letting a future genuine row-header call site override it explicitly (`scope`
spreads from `...props` after the default, so an explicit prop wins).

### F27 — breadcrumb current-page semantics and truncation

`BreadcrumbPage` announced a broken interactive control: `role="link" aria-disabled="true"`
on a non-focusable `<span>` tells assistive technology "this is a link" and "this link is
disabled" simultaneously, which is not what a breadcrumb's current-page marker means.
`aria-current="page"` alone is the correct, sufficient pattern, and was already present
alongside the incorrect attributes — removed only the incorrect pair. Separately, the
truncated current-page text (`max-w-[200px] truncate`, no full-text fallback) now carries a
`title` attribute with the untruncated label, so a long G.O. reference is recoverable on
hover/long-press instead of permanently cut off.

## Re-confirmed already correct (not re-fixed, not re-decided)

- **F4 — focus indicator.** `app/globals.css`'s base `:focus-visible` rule now lives outside
  `@layer base`; `Input.tsx`/`NativeSelect.tsx` no longer use `outline-none` at all.
- **F6 — iOS zoom.** Both now use `text-base sm:text-sm` (16px on mobile).
- **F7 — touch targets.** All six originally-named controls (`Button` sm/md, `Input`/
  `NativeSelect`, `Pagination` links, `BottomNav` items, search clear control) are at or
  above 44px.
- **F13 — field errors.** `Field` clones `id`/`aria-describedby`/`aria-invalid`/
  `aria-required` onto its child; `TaxCalculatorUI`'s `NumF` wrapper (33 call sites) now
  routes through `Field`.
- **F14 / Dialog.** `Sheet.tsx` confirmed deleted (only referenced in `Dialog.tsx`'s own
  comment explaining what it replaced). `Dialog.tsx` carries the full contract directly:
  `role="dialog"`, `aria-modal`, `aria-labelledby`, focus trap, Escape, focus return, scroll
  lock.
- **F15 — accordion.** Collapsed content is `hidden={!isOpen}`, out of the tab order and
  accessibility tree, not merely `opacity-0`.
- **F17 (nav semantics half) — `aria-current`/`aria-label`.** Present on `BottomNav`,
  `DesktopNav`, and the sidebar; each `<nav>` carries a distinguishing label.
- **F28 — global shortcut.** `Sidebar.tsx`'s `Ctrl/Cmd+B` handler already checks the event
  target against input/textarea/contenteditable before intercepting.
- **F31 — 10px labels.** `FieldLabel` is `text-xs` (12px); no `text-[10px]` remains in the
  checked files.
- **F32 — ThemeToggle.** `aria-pressed` present; the pre-mount placeholder is a
  non-focusable, `aria-hidden` element, not a ghost button; the `title` reads "Switch to
  day/night mode," no internal codenames.
- **Alt text.** No `<img>`/`next/image`/`role="img"` anywhere (matches `UI-PERF-1`'s
  confirmed no-images finding). Decorative inline SVGs carry `aria-hidden="true"` inside a
  labelled parent; every icon-only control requires a `label` prop by its own TypeScript
  signature.
- **Reduced motion.** `app/globals.css`'s `prefers-reduced-motion: reduce` block zeroes
  animation duration/iteration-count, transition duration, and scroll-behavior — substantive,
  not a stub.
- **Other dialogs/menus.** `Tabs.tsx` implements the full WAI-ARIA tabs pattern correctly
  (roving tabindex, `aria-selected`, `aria-controls`, arrow/Home/End keys). No other
  dialog/menu-shaped widget exists beyond what's covered above.

## Closed as not applicable / not verifiable here, with reason

- **Contrast.** `DESIGN_SYSTEM.md` §14 specifies the target (4.5:1 body text, 3:1 large
  text/UI boundaries, both themes) and names this gate as the owner of measurement — but this
  environment has no browser or contrast-measurement tool, the same disposition every prior
  gate in this program has recorded for anything requiring rendered/measured output. The
  target is specified; the actual ratios remain unmeasured. Not silently dropped — carried
  forward as a known limitation, same as browser/device acceptance generally.

## Verification

- `npx tsc --noEmit` passes.
- Full Vitest suite: 64 files, 436 tests pass (up from 426 — 10 new: `test/
  heading-structure.test.tsx` (5, new file), `test/primitives.test.tsx` (+4: `TableHead`
  scope default/override, `BreadcrumbPage` semantics/title), `test/a11y.test.ts` (+1:
  skip-link source guard).
- **Mutation-tested**, in two passes (the heading-structure guards are in an untracked file
  `git stash` alone doesn't move, so they were verified separately from the rest): (1) full
  `git stash` of all tracked changes confirmed all 4 `test/heading-structure.test.tsx`
  assertions fail against the pre-fix component source; (2) a scoped `git stash push` of just
  `Table.tsx`/`Breadcrumb.tsx`/`layout.tsx` (keeping the new tests in place) confirmed the
  `TableHead` scope, both `BreadcrumbPage` assertions, and the skip-link source guard all fail
  against their pre-fix source too. All four restored and re-verified passing.
- `git diff --check` clean.
- A full `next build` succeeds; bundle-size report unchanged (semantic/markup-only changes,
  as expected). `next start` + `curl` against the three previously-headless routes confirmed
  exactly one real, server-rendered `<h1>` on each (not just passing in a component test), and
  confirmed the skip link plus its `#main-content` target both appear in real rendered HTML,
  not only in the source file.

## Next gate after closure

`UI-IMPECCABLE-1` (Phase 15, per `UI_SYSTEM_MASTER_PLAN.md`'s sequential roadmap — no
explicit instruction overrode it this gate).
