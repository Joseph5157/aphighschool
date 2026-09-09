# UI Active Gate

## Active gate

`UI-IMPECCABLE-1`

## Status

CLOSED

## Purpose

Use Impeccable for controlled visual critique against the established design rules, per
`UI_SYSTEM_MASTER_PLAN.md` Phase 15. Preserve functionality and information architecture —
this is a polish/consistency gate, not a redesign gate.

## Tool availability — checked, not assumed

Impeccable was checked for in this environment before doing anything else: `ToolSearch` for
"Impeccable" / "design critique" returned no matching deferred tool (only unrelated tools —
`DesignSync`, `EnterPlanMode`); a `PATH`/`npm ls` sweep found no CLI or package named
`impeccable` anywhere. **Not available**, matching the identical disposition
`UI-DESIGN-1` already recorded for the same reason. Per explicit instruction: no substitute
design tooling was installed. The same structured visual review was performed manually
against `DESIGN.md`/`DESIGN_SYSTEM.md` instead, and that substitution is recorded here rather
than silently treated as equivalent.

## Method

**No browser rendering tooling exists in this environment either**, so this gate could not
and did not claim visual acceptance of anything. Every change below is justified by a
specific, quoted `DESIGN_SYSTEM.md` rule or a specific, cited source inconsistency between
routes doing the same job — never by an unverifiable claim about how something looks
rendered. Actual rendered/visual acceptance stays `UI-ACCEPTANCE-1`'s job, per explicit
instruction.

A structured review was run across all ten named representative surfaces (home, orders,
category, search, post detail, calculator/tool pages, navigation, empty/loading/error states,
404) against all eighteen named evaluation dimensions, scored through the five-question test
(real problem? conforms to `DESIGN_SYSTEM.md`? improves consistency/comprehension? preserves
density? avoids generic-AI-dashboard aesthetics?). Only items passing all five were acted on.

## The deferred `PageHeader` decision, revisited

`UI-PATTERNS-1` left this open: "Four pages, two hero shapes differing in five ways...
picking one look is a visual decision for `UI-IMPECCABLE-1`." Current state (more page
headers exist now than at that gate) is **four masthead variants across 9 files**:

- **Variant A (ribbon + count).** `category/[slug]/page.tsx`, `orders/page.tsx` —
  `on-masthead bg-masthead ... rounded-2xl shadow-md` plus a classification-ribbon sub-strip
  showing document scope/count.
- **Variant B (bordered, no ribbon).** `pensioners/page.tsx`, `tools/page.tsx`,
  `pensioners/office-pipeline/page.tsx` — `border border-mastheadText/40 rounded-2xl p-6
  md:p-8`.
- **Variant C (bordered, `<section>` not `<div>`).** `service-desk/page.tsx`,
  `topics/page.tsx` — `border-mastheadText/35`, semantic `<section>`.
- **Variant D (no masthead).** `app/(public)/page.tsx` — plain `border-b border-hair pb-4`;
  the home feed isn't a document index, so it never had a masthead treatment to begin with.

**Decision: preserve the variation, do not force one `PageHeader` component.** The ribbon
(A) carries real information the others don't — orders/category are literal document
listings with a scope and a live count; pensioners/tools/service-desk/topics are simpler hub
pages; home isn't a listing at all. Collapsing four purposes behind one props-switch would
freeze meaningfully different content into a uniform shape, which is exactly what
`UI-PATTERNS-1` already declined to do and what this gate's own instruction says to avoid
unless "the current review supports one coherent pattern."

**What the review did find and fix: two of those variants had unexplained token drift, not
meaningful variation.** Category and orders' `<h1>` used a raw `text-2xl md:text-3xl` size
instead of the `.text-display` utility every other page-header `<h1>` (pensioners, tools,
service-desk, topics, office-pipeline) already uses correctly. No comment anywhere justified
the difference, the sizes are nearly identical (24→30px vs. 22→28px), and `.text-display` is
the token this exact role already has. Fixed — see below.

A second, smaller split (`border-mastheadText/40` on variant B vs. `/35` on variant C) was
found and **deliberately not touched**: a 5-percentage-point border-opacity difference is not
reliably judgeable from source alone and needs a rendered comparison, which this gate cannot
perform. Recorded for `UI-ACCEPTANCE-1`, not guessed at here.

## What was fixed

### 1. Three route headings styled as metadata, not as headings

`CommutationTrackerUI.tsx`, `PensionCalculatorUI.tsx`, `PrcCalculatorUI.tsx` — their `<h1>`
(added in `UI-A11Y-1` by promoting an existing label to a real heading) kept that label's
original `font-mono text-xs text-inkSoft font-normal` styling. `DESIGN_SYSTEM.md` §1 states
plainly: **"Mono is not for body copy, headings, or navigation labels."** A page's one
heading, styled identically to a metadata chip beside it, is semantically present but
visually camouflaged — a real, rule-cited defect, not a preference.

**Fix.** Dropped `font-mono`; applied `.text-card-title` (15px mobile / 16px desktop, weight
700 — the smallest of the three defined heading tokens) and `text-ink`. Chosen over the
larger `.text-display` used by dedicated tool-page header blocks (GPF/APGLI, DA arrears,
leave encashment) specifically to preserve these three routes' existing compact, single-row
badge+heading density — going all the way to `.text-display` would restructure the row in a
way this gate cannot verify unrendered. Same visual position, same row, same badge beside it;
only the type styling changed.

### 2. Category/orders header size drift from the shared token

Covered above under the `PageHeader` decision. `text-2xl md:text-3xl font-bold ... leading-
snug` → `text-display` (color/tracking classes kept), matching the five other page headers
that already use the token correctly.

## Re-confirmed via source, deliberately not flagged

- **Emoji iconography** (`DESIGN.md`: reject outright; `DESIGN_SYSTEM.md` §15: still carried
  forward, ~15-20 sites). Real, rule-cited — but replacing icons across the sidebar,
  `DesktopLeftNav`, search chips, `ThumbZoneBar` means drawing/selecting SVGs and verifying
  alignment/sizing rendered. Fails "supported by code/design-system evidence alone" the same
  way this gate's own instruction constrains it; `DESIGN_SYSTEM.md` itself names no owner
  gate for this specific item. Left for `UI-21DEV-1` or a dedicated pass — not silently
  dropped, just not blind-fixed here.
- **~100 sub-12px arbitrary text sizes in route-local components** (`DESIGN_SYSTEM.md` §15's
  own count, ~42 files) — mechanically detectable, but that same section explicitly assigns
  this to **"`UI-A11Y-1` with `UI-ACCEPTANCE-1`,"** not this gate, because bumping ~100 sizes
  risks wrapping/density regressions only a browser can catch. `UI-A11Y-1` closed without
  touching it (its own scope was narrower — see that gate's record); left as a carried-
  forward known limitation rather than attempted here without rendering.
- **`Callout.tsx`, `EmptyState.tsx`** — read in full against `DESIGN_SYSTEM.md` §8.4a and the
  empty-state conventions. Already correct: tone-as-meaning mapping, `rounded-xl`, `hair`
  border, `role="status"`. No defect found.
- **Radius scale** — grepped app-wide for oversized/arbitrary radii (`rounded-3xl` and
  similar): zero hits. No violation of the closed radius scale.
- **Raw hex/arbitrary colors in components** — grepped app-wide outside `globals.css`: zero
  hits. The closed token set (`DESIGN_SYSTEM.md` §R0.2) holds everywhere checked.

## Closed as not applicable / deferred, with reason

- **Visual/rendered acceptance of anything in this gate.** No browser tooling exists in this
  environment. Every change above is justified by source/design-system evidence only, per
  explicit instruction; `UI-ACCEPTANCE-1` owns actually seeing any of it rendered.

## Verification

- `npx tsc --noEmit` passes.
- Full Vitest suite (including Tailwind class-usage validation, `test/tailwind-classes.
  test.ts`): 64 files, 437 tests pass (up from 436 — one new guard, `test/typography.test.ts`
  "never styles an `<h1>` with `font-mono`").
- **Mutation-tested.** A scoped `git stash push` of the three `font-mono` fixes (keeping the
  new guard in place) confirmed it fails against the pre-fix source — all three offending
  `<h1>`s listed by file — then restored and re-verified passing.
- `git diff --check` clean.
- A full `next build` succeeds; bundle-size report unchanged (pure className/markup changes,
  as expected). `next start` + `curl` against `/tools/prc-calculator` and `/orders` confirmed
  in real rendered HTML: the `<h1>` no longer carries `font-mono`, and `.text-card-title`/
  `.text-display` both compile to real, non-purged CSS rules.

## Next gate after closure

`UI-21DEV-1` (per explicit instruction).
