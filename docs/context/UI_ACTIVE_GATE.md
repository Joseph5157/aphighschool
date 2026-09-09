# UI Active Gate

## Active gate

`UI-REGRESSION-1`

## Status

CLOSED

## Purpose

Complete full regression verification, per `UI_SYSTEM_MASTER_PLAN.md` Phase 19 — confirm the
cumulative state of all seventeen closed gates (plus `UI-DEVICE-1`, BLOCKED) still holds
together, rather than finding new defects or doing new exploratory work. This gate found no
regressions and made no code changes.

## Scope and method

Two passes: a full static-verification re-run from a clean state (typecheck, full test
suite, a fresh production build), and a targeted browser re-verification pass using the
Playwright tooling confirmed working in `UI-ACCEPTANCE-1` — not a repeat of that gate's
exhaustive 9-route × 8-viewport exploration, but a focused confirmation that (a) the four
defects `UI-ACCEPTANCE-1` found and fixed are still fixed, including in combinations not
explicitly tested together before (dark mode + `ThumbZoneBar` hidden on desktop
simultaneously), and (b) the core cross-cutting interaction mechanisms (drawer, skip link)
still work correctly end to end.

## Static verification

- `npx tsc --noEmit`: clean.
- Full Vitest suite: **64 files, 441 tests pass** — exactly matching the count at
  `UI-ACCEPTANCE-1`'s closure, confirming no drift across the intervening `UI-21DEV-1`
  (`Dialog.tsx` only) and `UI-DEVICE-1` (docs-only, no code) commits.
- `rm -rf .next && next build`: succeeds; bundle-size report identical to `UI-ACCEPTANCE-1`'s
  (First Load JS shared 87.3 kB, no route changed size) — expected, since no application code
  has changed since that gate closed.

## Browser regression pass

Re-published representative test data (4 posts, varied lifecycle states, one with a
`pdfUrl`) against a fresh `next build` + `next start`, then, with real browser tooling:

- **`HeroCard`'s footer wrap** (the 320px overflow fix): confirmed the row still carries
  `flex-wrap` and the "Read Summary" link no longer overflows its container.
- **The dark-mode hydration fix**: toggled dark mode, then did a fresh navigation with
  `theme: dark` already in `localStorage` (the exact returning-visitor scenario the original
  defect required) — zero console errors, `suppressHydrationWarning` still present and
  working.
- **The `inkSoft` contrast fix**: `text-inkSoft/80` confirmed still present and applied
  (spot-checked on `Sidebar`'s `SidebarGroupLabel`).
- **`ThumbZoneBar`'s `lg:hidden`**: confirmed still hidden (`display: none`) at 1440px on a
  post with a `pdfUrl` — tested this time *combined* with dark mode active simultaneously, a
  combination not explicitly exercised in `UI-ACCEPTANCE-1`. No visual or console-level
  conflict between the two fixes.
- **Console errors**: zero across Home, Category, Search (with a query), and
  `/tools/tax-calculator`, both in light and dark mode.
- **The mobile drawer's full cycle** (open, `role="dialog"`/`aria-modal`, scroll lock,
  Escape, `inert` restore, focus return) and **the skip link** (first Tab stop, correct
  `href`): both re-confirmed working with a real (not programmatic) click.

### A methodology note, not a product defect

An initial focus-return check appeared to fail (focus landed back on the skip link instead of
the drawer trigger after Escape). Investigated before concluding anything: the cause was the
test's own setup — a programmatic `element.click()` via `browser_evaluate` doesn't shift
real browser focus the way an actual click does, so the drawer's own "remember where focus
came from" logic correctly captured the skip link (still genuinely focused at that moment)
as the return target — which is exactly correct behavior given that input. Re-tested with a
real `browser_click`, and focus returned to the trigger correctly. Recorded here because it's
a reusable lesson for future browser-testing gates: use a real click, not a programmatic one,
whenever the thing being tested is focus state itself.

## Verification

No application code changed this gate — nothing to fix, matching the finding that no
regression exists. `git diff --check` clean (the same pre-existing, unrelated `.gitignore`
change from the user's `/plugin` session activity remains excluded, as it has across every
gate since it appeared).

## Next gate after closure

`UI-SYSTEM-CLOSE` (Phase 20, the master plan's own final step — record final state, tests,
acceptance evidence, known limitations, and remote verification). `UI-DEVICE-1` remains
BLOCKED and is not implicitly resolved by this gate; it stays open per its own record.
