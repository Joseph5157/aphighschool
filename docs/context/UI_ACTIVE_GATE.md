# UI Active Gate

## Active gate

`UI-21DEV-1`

## Status

CLOSED

## Purpose

A selective 21st.dev enhancement pass for weak components only, per `UI_SYSTEM_MASTER_PLAN.md`
Phase 16: "search -> compare -> choose -> import -> normalize -> test -> own." 21st.dev is a
selective reference source, not the design system — imported components must be normalized
into the repository's own visual language, never treated as a replacement for it.

## Tool availability — checked, not assumed

21st.dev's MCP server (`magic`, package `@21st-dev/magic`) is present in `.mcp.json` — added
via the user's `/plugin` command earlier in this session — but was **not connected in this
running session**: `ToolSearch` for "21st.dev component search" and "magic 21st-dev component
generator" returned no matching tool, only unrelated ones (`DesignSync`, `EnterPlanMode`).
Inspecting the config (structure only, no secret values read or printed) confirmed it needs
`npx -y @21st-dev/magic@latest` plus an `API_KEY` env var, and a newly added MCP server
requires a session restart to actually load — which did not happen mid-gate.

Per explicit instruction: this did not block the gate, and no substitute design tooling was
installed. The selective-enhancement review ran manually instead, and — critically — **no
21st.dev component was searched for, compared, or imported**, recorded here rather than
implied. If a future session wants the tool-assisted version of this gate, it needs to start
fresh after the MCP server is actually connected (confirm via `ToolSearch` before assuming).

## Method

Reviewed every candidate the gate named — search interface, filters, empty states, dialogs,
mobile navigation, tables, callouts, 404, and pagination (reconsidered only if it now has a
genuine consumer) — against **current source**, not against `UI_CURRENT_STATE.md`'s
gate-history prose (the discipline this program has repeated at every recent gate: a claim
that something is "already fixed" is a claim about the repo when that entry was written, not
a fact to trust unverified). For each, asked the gate's own nine questions, with particular
weight on questions 1-2 (real unresolved problem? existing component already adequate?) since
questions 3+ (would an external component help) are moot without 21st.dev access.

## What was reviewed and found already adequate — no import needed regardless

- **Search** (`SearchUI.tsx`). `role="search"`, `aria-live="polite"` pending state, filter
  chips with `aria-current`, a 44px labelled clear control, quick-search chips verified
  server-side against real content, `EmptyState` used correctly in both empty branches.
- **Filters** (`OrdersFilterTabs.tsx`, `CategoryLogList.tsx`'s filter row). The shared `Tabs`
  primitive used correctly; `CategoryLogList`'s hand-built roving-tabindex pattern already
  confirmed correct in an earlier gate this session. `OrdersFilterTabs`' per-category emoji
  icons are the *already-tracked* emoji-iconography defect (`DESIGN_SYSTEM.md` §15), not a
  new filter-specific gap — not double-counted here.
- **Empty states.** No new gap since `UI-STATES-1`; `EmptyState`/`EmptyState compact` used
  consistently everywhere checked.
- **Dialogs** (`Dialog.tsx`, the mobile drawer in `Sidebar.tsx`). Both still carry their full
  contract untouched by later gates — `role="dialog"`, `aria-modal`, `aria-labelledby`/
  `aria-label`, focus trap, Escape, focus return, scroll lock, `inert` when closed. See below
  for the one real defect found inside this candidate.
- **Mobile navigation** (`BottomNav.tsx`, `DesktopNav.tsx`). `aria-current="page"` present on
  both, 44px targets already confirmed in earlier gates. `BottomNav`'s `backdrop-blur-md` is
  functional (keeps the sticky bar legible over scrolling content beneath it), not decorative
  glassmorphism — doesn't trip `DESIGN.md`'s "reject outright" list.
- **Tables** (`Table.tsx`). Exactly one real consumer now (`DaArrearsUI.tsx`); scroll-region
  semantics and `TableHead`'s `scope="col"` default already fixed in `UI-A11Y-1`.
- **Callouts** (`Callout.tsx`). No new gap since `UI-IMPECCABLE-1`'s full review one gate ago.
- **404** (`NotFoundContent.tsx`, both `not-found.tsx` files). Clean — uses `.text-display`
  correctly, bilingual, shared `buttonClassName`, not an oversized hero.
- **Pagination** (`Pagination.tsx`). Re-confirmed **zero consumers** app-wide
  (`grep -rn "Pagination\b" app/` outside its own file returns nothing). Per the gate's own
  instruction — reconsider only if it now has a genuine consumer — this was **not**
  reconsidered.

## What was fixed

### Dialog's title heading used mono styling

Found while reviewing "dialogs" as a named candidate, reading `Dialog.tsx` directly rather
than trusting the earlier "full contract, untouched" summary at face value for every detail:
its `<h2>` title (the dialog's own accessible name, via `aria-labelledby`) was styled
`font-mono text-sm font-semibold uppercase text-ink`. `DESIGN_SYSTEM.md` §1 states plainly:
**"Mono is not for body copy, headings, or navigation labels."** This is the same rule
`UI-IMPECCABLE-1` fixed on three route `<h1>`s one gate ago — a dialog's title plays the
identical role (the one heading, the accessible name) at a smaller scale.

This is not a "would an external component help" question — it is a one-property token-
conformance fix, same shape as `UI-IMPECCABLE-1`'s work, found incidentally while reviewing
this gate's own "dialogs" candidate rather than left for an unspecified future pass. Fixed by
dropping `font-mono` only — kept `text-sm font-semibold uppercase text-ink` exactly as-is
(no size change), since this is an in-context dialog title rather than a page heading, and
there is no rendering available to verify a resize. It falls back to the body's own sans
default (`app/globals.css`'s `body { font-family: var(--font-space-grotesk)... }`).

**Deliberately not widened into a general rule.** A tree-wide check turned up roughly a dozen
existing `<h2>`/`<h3>` elements across the app still using `font-mono` — all small,
uppercase-tracked **section-label** headings ("Recent Documents", "Teacher Calculators",
sidebar subsection titles), not primary/page-identity headings. `DESIGN.md`'s own
"constrain, do not ban" section explicitly permits "uppercase tracked labels... legitimate
for genuine section labels," which is a plausible, defensible reading of every one of those
cases — unlike the Dialog title (the modal's sole accessible name) or the three `UI-A11Y-1`
route headings (a route's sole `h1`), which are unambiguously headings in the banned sense,
not section-eyebrow labels. Deciding which of those dozen section labels are "headings" in
the banned sense versus permitted "uppercase tracked labels" is a real, but much larger and
more ambiguous, design question — outside a selective-enhancement gate's scope, and not
something to blind-fix without rendering to check the effect on density and hierarchy. Left
untouched and unflagged as a defect; the new guard is scoped exactly to what was verified and
fixed (see below), not to every heading tag in the app.

## Deferred items revisited — none resolvable here without rendering

Per instruction: revisit currently-deferred visual items only if this gate can resolve them
responsibly without browser guessing.

- **Emoji iconography.** Still real, still needs drawn/selected SVGs verified for
  alignment/sizing rendered — cannot be resolved from source alone, and 21st.dev (the tool
  that could plausibly supply icon-set candidates) isn't connected this session anyway.
  Preserved for `UI-ACCEPTANCE-1` or a future session with 21st.dev actually connected.
- **~100 sub-12px route-local text sizes.** Still assigned to `UI-A11Y-1`/`UI-ACCEPTANCE-1`
  per `DESIGN_SYSTEM.md` §15; bumping ~100 sizes risks wrapping regressions only a browser
  can catch. Not touched.
- **Masthead border-opacity split** (`/40` vs `/35`, found in `UI-IMPECCABLE-1`). A
  5-percentage-point difference too small to judge from source. Not touched; still owned by
  `UI-ACCEPTANCE-1`.

## Verification

- `npx tsc --noEmit` passes.
- Full Vitest suite (incl. `test/tailwind-classes.test.ts`'s compiled-CSS validation): 64
  files, 438 tests pass (up from 437 — one new test in `test/dialog.test.tsx`).
- **Mutation-tested.** A scoped `git stash push` of just `Dialog.tsx` (keeping the new test in
  place) confirmed it fails against the pre-fix source, then restored and re-verified passing.
- `git diff --check` clean (excluding an unrelated, pre-existing `.gitignore` change from the
  user's own `/plugin` session activity — not part of this gate, left uncommitted for the
  user to handle separately).
- A full `next build` succeeds; bundle-size report unchanged (a single className edit).
  `Dialog` is conditionally rendered client-side (`if (!open) return null`), so there is no
  static HTML artifact a `curl` pass could inspect — the RTL component test already renders
  the real component with real props and asserts the real output, which is the correct tool
  for this case (component-level render, not a raw HTTP scan, per this program's established
  lesson on what each verification method can and cannot see).

## Next gate after closure

`UI-ACCEPTANCE-1` (per explicit instruction).
