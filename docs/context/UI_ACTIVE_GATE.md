# UI Active Gate

## Active gate

`UI-ACCEPTANCE-1`

## Status

CLOSED

## Purpose

Browser and responsive acceptance across representative routes and desktop/tablet/mobile
widths, per `UI_SYSTEM_MASTER_PLAN.md` Phase 17 — the first gate in this program with real
browser rendering available, not source-level inference.

## Browser tooling — checked in the stated preferred order

1. **Existing project/browser tooling** — none: no `playwright.config.*`, no Playwright/
   Cypress/Puppeteer dependency in `package.json`.
2. **Playwright, if already available/configured** — **found and used.** The
   `plugin_playwright_playwright` MCP server's tools loaded successfully via `ToolSearch`,
   and a real navigation (`browser_navigate` to the local dev server) confirmed an actual
   Chromium instance responds, not just a configured-but-disconnected tool (the same check
   that found `UI-IMPECCABLE-1`'s Impeccable and `UI-21DEV-1`'s 21st.dev both configured but
   NOT connected). This was the primary tool for the entire gate.
3. **Claude browser/computer tooling** — not needed; step 2 succeeded.
4. **Project-native alternatives** — not needed.

No new browser stack was installed.

## Method

`rm -rf .next && next build` baseline, then `next dev` for fast iteration (screenshots,
computed-style assertions, and interaction tests all run the same against dev output; a
second full `next build` + `next start` pass, with representative published test data,
confirmed the fixes hold in the production build specifically before closing). The test
database (native-Postgres `portal_test`, per this program's established environment note)
was seeded via `prisma/seed.ts` and then had 4 rows directly published (bypassing the seed
script, which — correctly, per `test/seed-integrity.test.ts` — never publishes anything
itself) with varied `orderState`, `verifiedAgainstGoir`, a deliberately long title, and a
`pdfUrl`, so lifecycle badges, GOIR markers, and `ThumbZoneBar` all had real content to
render against. This is disposable local test-DB state, not a repository change.

## Routes tested

Home, Orders, Category (`govt-orders`, `circulars`, and empty categories `memos`), Search
(with results and with a no-match query), Post detail (a verified/current notification with
a `pdfUrl`, and a separate amended post with a deliberately long title), `/tools/tax-calculator`
(representative calculator), `/tools/da-arrears` (the one real `Table` consumer), Service
Desk, Pensioners (masthead border check), a genuinely unmatched URL (hard 404), and the
known-limitation soft-404 case (`/posts/<invalid-slug>`).

## Viewports tested

All eight named: 320, 375, 390, 430 (mobile); 768, 1024 (tablet); 1440×900, 1920×1080
(desktop).

## What was verified working, with evidence (no defect — confirmed, not assumed)

- **No page-level horizontal scroll** at any tested route/viewport combination, verified via
  a real DOM measurement (`scrollWidth` vs `innerWidth`, excluding intentionally-scrollable
  containers and the closed/`inert` drawer) — not visual inspection alone.
- **`BottomBarSlot` behavior.** `ThumbZoneBar` correctly claims the bottom-bar slot and
  `BottomNav` correctly yields (exactly one fixed bottom bar mounts) when a post has a
  `pdfUrl`; `BottomNav` correctly returns when it doesn't. Verified via computed `position`/
  `display` on the real DOM, not just source reading.
- **Mobile drawer**, full round trip: opens with `role="dialog"`/`aria-modal="true"`/
  `aria-label="Site navigation"`, moves focus in, locks body scroll; Escape closes it,
  restores `inert`, returns focus to the trigger, unlocks scroll; clicking a nav link inside
  it closes it on route change. All confirmed via real keyboard events and DOM state reads,
  not simulated.
- **Single navigation breakpoint (1024px) holds in a real render**, both the CSS
  (`DesktopNav` `display: none` below `lg`, `BottomNav` `display: block`) and the JS-driven
  drawer (opens as a genuine off-canvas modal, not a desktop push-sidebar, at 768px).
- **`Table` region + `TableHead` scope** (`UI-A11Y-1`'s fix): confirmed live —
  `role="region"`, `tabindex="0"`, and `scope="col"` all present on `/tools/da-arrears`'s
  actual rendered table once the calculator has input to show a result.
- **Loading state**: the `animate-pulse` skeleton was caught mid-transition during a real
  client-side navigation (Home → Orders), confirming `loading.tsx` actually engages, not just
  exists as a file.
- **Empty states**: category and search empty branches both render `EmptyState` correctly,
  no clipping, clear next-step link.
- **404**: a genuinely unmatched URL returns real HTTP 404 with correct content; the
  known-limitation soft-404 case (`UI-404-1`) is unchanged and still correctly documented,
  not newly broken.
- **Skip link**: first Tab stop, visible 2px turmeric focus ring, and pressing Enter actually
  moves the URL fragment to `#main-content` — the full mechanism works, not just its markup.
- **Focus visibility, active navigation, favicon/title**: all confirmed via real computed
  styles and DOM attributes (`aria-current="page"` present; `/icon.svg` resolves; page titles
  match expected route titles).
- **Dark mode**: toggles correctly (`aria-pressed`, `dark` class, title text all update);
  masthead correctly does not invert per `DESIGN.md`.

## Defects found and fixed (browser-rendered, cause clear, fix stays in the design system)

### 1. `HeroCard`'s date/CTA footer overflowed its own row at 320px

Measured, not assumed: the "Read Summary →" link's right edge sat at 328.6px in a 320px
viewport — 65px past its own flex parent's right edge (263px) — because the footer row
(`flex items-center justify-between`, no wrap) couldn't fit both the date label and the link
on one line and neither shrank nor wrapped. **Fix:** added `flex-wrap gap-x-3 gap-y-1`,
matching the identical pattern already used elsewhere in this codebase (calculator header
rows). Re-tested: the link's right edge moved to 148.6px, fully within bounds.

### 2. React hydration-mismatch console error for returning dark-mode visitors

`app/layout.tsx`'s inline theme script adds `dark` to `<html>` before React hydrates, so a
visitor with `theme: dark` already in `localStorage` gets a server/client `className`
mismatch on every load — a real, reproducible console error (confirmed, then confirmed gone
after the fix, on a fresh navigation with dark mode pre-set). **Fix:** `suppressHydrationWarning`
on `<html>` — React's own documented pattern for exactly this theme-flash-prevention-script
scenario, narrowly scoped (non-recursive; only suppresses the mismatch on that one element).

### 3. `inkSoft` at 50/60/70% opacity failed the 4.5:1 body-text contrast requirement

Measured directly from computed styles, not estimated: `text-inkSoft/70` (the sidebar footer
credit line, 10px/400-weight — genuine small body text, not "large text" under WCAG's
definition) measured **3.74:1** in light mode against the required 4.5:1.
`DESIGN_SYSTEM.md` §14 names exactly this target and had left it unmeasured for two prior
gates (no rendering available then). Computed the minimum opacity that clears 4.5:1ish in
**both** themes (light `inkSoft` on `paper`, dark `inkSoft` on the dark `paper`/`paperRaised`
pair): 80% is the floor that works for every starting opacity (50/60/70) in both themes
(light: 2.41/2.99/3.74 → 4.74; dark: 3.06/3.82/4.73 → 5.78). **Fix:** `text-inkSoft/50`,
`/60`, `/70` → `/80` uniformly across ~26 real informational-text sites (dates, descriptions,
footer credits, empty-state text, lifecycle-stepper labels, category/orders footnotes).
**Deliberately excluded:** `Breadcrumb.tsx`'s separator glyph (`aria-hidden="true"`) and
`Pagination.tsx`'s disabled prev/next state (WCAG explicitly exempts inactive UI components)
— both correctly stay at their original opacity. One chevron-icon usage in `Sidebar.tsx`
(`SidebarCollapsible`'s disclosure arrow) was checked and left alone: as a graphical object,
not text, it only needs 3:1, and `/70` already clears that (3.74/4.73) in both themes.

### 4. `ThumbZoneBar` had no desktop-hiding class, unlike its sibling `BottomNav`

Found via a real 1440px screenshot: a narrow, oddly-centered "VIEW FULL ORDER" action strip
floated at the bottom of an otherwise full-width desktop layout — a mobile thumb-zone pattern
that had no `lg:hidden`, unlike `BottomNav`, which already correctly hides at that breakpoint.
Confirmed safe to hide: `ActionSummary` already renders the identical `pdfUrl`/`sourceUrl`
links inline in the page body at every viewport width, so hiding the floating bar loses no
functionality. **Fix:** added `lg:hidden`, matching `BottomNav`'s own established convention
exactly. Re-tested at both 1440px (now `display: none`) and 375px (still `display: flex`).

## Deferred visual items — decided, not reflexively re-deferred

- **Sticky `top-[76px]` assumption vs. the real, measured header height (69px).** **KEEP.**
  The 7px discrepancy creates a small, harmless gap between the sticky header and a sticky
  summary panel when both are stuck — confirmed via screenshot, reads as intentional
  breathing room, not a collision or overlap. Not a demonstrated problem.
- **Masthead border-opacity split** (`/40` on `pensioners`/`tools`/`office-pipeline` vs.
  `/35` on `service-desk`/`topics`, found in `UI-IMPECCABLE-1`). **KEEP.** Measured
  (`rgba(237,232,220,0.4)` vs `0.35`) — a real, numeric difference, but visually
  imperceptible in an actual screenshot at normal viewing conditions. Per instruction, not
  changing something that "merely differs stylistically" without a demonstrated rendered
  problem.
- **Remaining sub-12px route-local text** (~100 instances / ~42 files per the original
  audit's own count, `DESIGN_SYSTEM.md` §15). **DEFER, with stronger evidence than prior
  gates could offer.** Spot-checked on two representative routes: legible, no wrapping
  breakage — but also a real violation of `DESIGN.md`'s explicit "never below 11px" floor for
  uppercase tracked labels specifically (found instances at 9px and 10px). Not blind-fixed:
  verifying that bumping ~100 sites doesn't cause density/wrapping regressions elsewhere is
  itself gate-sized work disproportionate to folding into this already-large gate. This is
  the one item still genuinely better owned by a dedicated future pass than decided here.
- **Ambiguous mono-styled section labels.** **KEEP**, per the decision already made in
  `UI-21DEV-1` (roughly a dozen short, uppercase, `font-mono` section-eyebrow labels —
  "Recent Documents," "Teacher Calculators" — plausibly fall under `DESIGN.md`'s explicitly
  *permitted* "uppercase tracked labels" allowance, distinct from the banned heading case
  already fixed on `Dialog`'s title and three route `h1`s). Visually reconfirmed this gate:
  legible, appropriately de-emphasized in real screenshots, not a hierarchy problem.
- **Emoji iconography.** **DEFER**, unchanged from `UI-IMPECCABLE-1`/`UI-21DEV-1`'s
  reasoning — real, `DESIGN.md`-cited, but replacing ~15-20 icons needs drawn/selected SVGs
  verified for legibility and alignment rendered, which is design work this acceptance gate
  isn't positioned to originate. Confirmed still present and unchanged in the drawer
  screenshot captured this gate.
- **Color contrast, generally.** No longer blanket-unmeasured (`DESIGN_SYSTEM.md` §14's
  standing "not yet measured" note is now materially false for the `inkSoft` family, the
  highest-named risk) — measured and fixed where it failed; other token pairs (body text on
  `paper`, `inkSoft` at full opacity) were spot-measured and comfortably pass (7.79:1 and
  8.32:1 light/dark) and were not re-litigated further.

## Verification

- `npx tsc --noEmit` passes.
- Full Vitest suite (incl. `test/tailwind-classes.test.ts`'s compiled-CSS validation): 64
  files, 441 tests pass (up from 438 — 3 new: `HeroCard`'s footer-wrap structural
  precondition, `ThumbZoneBar`'s `lg:hidden`, and `<html>`'s `suppressHydrationWarning`,
  all in `test/responsive-layout.test.tsx`/`test/dark-mode.test.ts`).
- **Mutation-tested.** A scoped `git stash push` of the three structurally-tested fixes
  (`HeroCard.tsx`, `ThumbZoneBar.tsx`, `app/layout.tsx`) confirmed all three new tests fail
  against the pre-fix source, then restored and re-verified passing. The contrast fix
  (~26 sites, pure opacity-value changes) has no separate structural-contract test — its
  correctness is the direct, reproducible browser measurement recorded above, re-verifiable
  the same way if it ever regresses.
- `git diff --check` clean (excluding the pre-existing, unrelated `.gitignore` change from
  the user's own `/plugin` session activity, left uncommitted for the user to handle).
- A full `next build` succeeds both before this gate's fixes (baseline) and after; bundle-size
  report unchanged (every fix is a className/markup/one-attribute change, no new
  dependencies). A second `next build` + `next start` pass with real published test data
  confirmed all routes return correct status codes (200 for real routes, 404 for a genuinely
  unmatched URL) with no server errors.

## Next gate after closure

`UI-DEVICE-1` (per explicit instruction).
