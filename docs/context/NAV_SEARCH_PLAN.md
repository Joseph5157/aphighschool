# Header Search discoverability experiment — record

Branch: `nav-search-1`. Branch point: verified clean `main` at
`b0ae86de8af1e60bbf1983a6ebc0e84890f0b153`.

## Question

> Does a header Search trigger improve a reference product enough to justify another Search
> entry point?

This is a discoverability/duplication question, not a Search-functionality question. Per the
gate's own scope, no command palette, modal search, autocomplete, keyboard-shortcut
infrastructure, new search API, animated input, or decorative motion was in play — only whether
a compact icon/link belongs in the header at all, and if so, at which breakpoints.

## Read first

`PRODUCT.md`, `DESIGN.md`, `docs/ui/DESIGN_SYSTEM.md` §4 (navigation), §9 (responsive
philosophy), §10 (motion). No file named `NAV-21ST-AUDIT-1` exists in the repository; the
equivalent record is `UI-21DEV-1` in `docs/context/UI_CURRENT_STATE.md`, which reviewed "search"
as one of nine 21st.dev-candidate areas and found it already adequate — a component-quality
verdict, not a placement/discoverability one, so it does not pre-empt this gate's question.
`docs/context/NAV_SIDEBAR_WIDTH_PLAN.md` (`NAV-SIDEBAR-WIDTH-1`) supplied the restraint
tie-breaker this gate reuses: once a change and no-change both satisfy the goal equally, don't
add weight the task doesn't need.

## Current Search access (confirmed by reading source, not assumed)

- **`DesktopNav`** (`app/(public)/_components/DesktopNav.tsx`): a plain text link, same visual
  treatment as every other primary destination, **last position** in the row (`NAV_LINKS`
  array's final entry). Visible only at `lg` (1024px) and up — the single navigation breakpoint
  (`DESIGN_SYSTEM.md` §9.1).
- **`BottomNav`** (`app/(public)/_components/BottomNav.tsx`): Search is the **3rd of 5**
  permanent, always-visible icon+label tabs. Rendered with `lg:hidden` — **visible at every
  width below 1024px**, not just "mobile" widths. This is a materially different fact than the
  gate brief's framing ("tablet: there is no DesktopNav yet") suggested; see Duplication
  analysis below.
- **Mobile drawer** (`app/(public)/layout.tsx`, inside `SidebarMobileOnly`): Search is 6th of 6
  primary links, reachable only after opening the drawer. Below `DesktopNav`'s and `BottomNav`'s
  reach, since it's gated behind an extra tap.
- **No dedicated header Search affordance** existed before this gate, and none exists after it
  (decision: keep it that way).

## Baseline (real Chromium, production build, `next start`)

Measured at all eight `DESIGN_SYSTEM.md` §9.2 verification widths: 320, 360, 375, 390, 430, 768,
1024, 1440 (900px tall, `getBoundingClientRect()` on the real header, not computed guesses).

| Width | Header h | Menu trigger | Logo right edge | Free gap before theme toggle | DesktopNav visible | CMS visible | Overflow |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 320 | 69px | 44×44 | 268.2px | **−6.2px (overlap)** | no | no | no |
| 360 | 69px | 44×44 | 268.2px | 33.8px | no | no | no |
| 375 | 69px | 44×44 | 268.2px | 48.8px | no | no | no |
| 390 | 69px | 44×44 | 268.2px | 63.8px | no | no | no |
| 430 | 69px | 44×44 | 268.2px | 103.8px | no | no | no |
| 768 | 69px | 44×44 | 276.2px | 272.3px | no | **yes** | no |
| 1024 | 69px | 44×44 | 284.2px | 535.1px | **yes** | yes | no |
| 1440 | 69px | 44×44 | 292.2px | 912.3px | **yes** | yes | no |

**An unexpected finding, out of this gate's scope to fix**: at the 320px accessibility floor,
the wordmark subtitle ("AP SCHOOL EDUCATION") already overlaps the theme toggle by measured
−6.2px **before this gate changed anything** — confirmed visually (screenshot below), not just
by bounding-box arithmetic. `docScrollWidth === docClientWidth` at every width, so this is a
same-row visual stacking defect, not page-level overflow (`DESIGN_SYSTEM.md` §9.3's overflow
rule is not violated). Recorded here because it's directly relevant evidence for this gate's
question — the header has **zero** free space at the narrowest required width even today — but
left unfixed: the gate's Preserve list forbids touching the header height, logo, or wordmark,
and this defect predates and is independent of the Search question.

Confirmed by screenshot (not committed as a repo asset; reproducible via `npx next build &&
npx next start`, viewport 320×568) — the wordmark subtitle visibly runs into the theme toggle's
icon at 320px on unmodified `main`.

The 258px/49px figures in the gate brief are close to, but not identical to, the direct
measurements above (272px and 63.8px respectively) — likely measured from a different reference
point (e.g. visible text edge vs. link bounding box). The conclusions below use this gate's own
direct measurements, not the brief's approximations.

## Prototype A — Search icon trigger

Built for real (not simulated): a genuine `<Link href="/search">`, magnifying-glass icon reused
verbatim from `BottomNav`'s existing Search icon (visual consistency, zero new iconography),
`min-h-[44px] min-w-[44px]`, `aria-label="Search"`, no tooltip, no animation beyond the existing
`transition-colors` every other header control already uses, no popover, no modal. Inserted into
the header's existing right-side `flex items-center gap-3` group, immediately before
`ThemeToggle` — the only structurally sound slot without touching the logo group or `DesktopNav`.
Made unconditionally visible (all widths) purely to gather comparable measurements at every
breakpoint in one build; visibility scoping was always going to be a post-measurement decision,
not a pre-decision.

Verified via real Chromium (`npx next build` + `npx next start`), `getBoundingClientRect()` on
the live header, at all eight widths:

| Width | Search bounds | Gap: logo → search | Collides with wordmark? | Gap: search → theme toggle | Search affordances visible simultaneously |
| --- | --- | --- | --- | --- | --- |
| 320 | 44×44 @ (206.2, 12) | **−62.0px** | **YES** | 12px | 2 (header + BottomNav) |
| 360 | 44×44 @ (246, 12) | **−22.2px** | **YES** | 12px | 2 |
| 375 | 44×44 @ (261, 12) | **−7.2px** | **YES** | 12px | 2 |
| 390 | 44×44 @ (276, 12) | +7.8px | no (marginal) | 12px | 2 |
| 430 | 44×44 @ (316, 12) | +47.8px | no | 12px | 2 |
| 768 | 44×44 @ (492.5, 12) | +216.3px | no | 12px | 2 (header + BottomNav) |
| 1024 | 44×44 @ (781, 12) | +496.8px | no | 12px | 2 (header + DesktopNav) |
| 1440 | 44×44 @ (1148.5, 12) | +856.3px | no | 12px | 2 (header + DesktopNav) |

**Real, measured collision at 320/360/375px** — three of the five required mobile widths — not
a hypothetical. Screenshots confirm the icon visually sits on top of the wordmark subtitle text
at 320px and clips its tail at 375px. `docScrollWidth === docClientWidth` at every width (no
page-level overflow introduced — `next/link`'s flex sibling just overlaps in place, the same
class of same-row stacking as the pre-existing 320px defect above, not new horizontal scroll).
Header height stayed exactly 69px at every width — no height regression. CMS remained reachable
wherever it was already visible (768px+).

At 390px — the width the gate brief's own baseline evidence was drawn from — the gap is only
**+7.8px**, which is not a collision by bounding-box math but is visually tight (screenshot) and
well under a comfortable touch-target separation. The brief's own instruction — "do not assume
390px evidence applies to 320–375px" — is directly vindicated: 390px is the *first* width where
the box-level collision clears, and even there the margin is thin, not comfortable.

**Accessibility, verified on the built prototype (not assumed adequate because it was rejected)**:
44×44 target ✓; accessible name `"Search"` via `aria-label` ✓; a real anchor, so `Enter` performs
standard link navigation to `/search` with no JS interception (`page.keyboard.press("Enter")`
navigated correctly in the Chromium check) ✓; 2px solid focus outline painted on
`:focus-visible`, inheriting the global treatment (`DESIGN_SYSTEM.md` §6), not suppressed ✓. The
prototype was built correctly; it is rejected on information-architecture grounds (collision,
duplication), not implementation quality.

### Desktop treatment options (A/B/C from the gate brief)

- **A — icon stays alongside `DesktopNav`'s Search text link**: measured `simultaneousSearchAffordancesVisible: 2`
  at 1024px and 1440px. Two same-purpose controls in the same header, one a text link at normal
  nav weight, one an icon-only control a few hundred pixels away — this is exactly the
  "two same-purpose Search controls beside each other without justification" the gate brief
  says not to allow. No evidence (crowding, complaint, measured gap) justifies it: desktop has
  535–912px of free space, and empty space is not itself proof of a discoverability failure.
- **B — icon replaces the `DesktopNav` Search text link**: out of scope by this gate's own
  Preserve list ("Do not change: DesktopNav destinations/order"), and nothing in the measured
  evidence shows this is "absolutely necessary" — the explicit bar for touching anything on the
  Preserve list.
- **C — icon disappears at desktop, `DesktopNav`'s link is sufficient**: consistent with both
  the Preserve constraint and the no-duplication evidence. This is the only option that survives.

## Prototype B — text + icon at wider widths

Evaluated analytically, not built, because Prototype A's own measurements already settle every
breakpoint on one of two independent, sufficient grounds before any visual-treatment question
arises:

- **Mobile** (icon-only in Prototype B, same footprint as Prototype A): the collision at
  320/360/375px is a *space* problem (the icon has nowhere to go, not that it looks wrong), so a
  wider tablet-style treatment at mobile widths would not change the verdict — it isn't proposed
  there anyway.
- **Tablet** (icon + "Search" text): this makes the control physically *larger* in a region
  (640–1023px) where the question was never "does it fit" (it does — 216–272px free) but "is it
  needed" (see Duplication analysis — `BottomNav` already covers this exact range). A bigger,
  more visually prominent redundant control is a worse outcome under `DESIGN.md`'s "one accent
  at a time" / restraint principle, not a better one.
- **Desktop** ("integrate with existing `DesktopNav` Search treatment"): this is already
  Option C above — no separate control to build.

Building Prototype B would have re-run the same measurement cycle for a foregone conclusion
without new evidence, so it was not implemented. This is recorded as a considered-and-rejected
variant, not a skipped one.

## Duplication analysis

### Mobile (< 640px)

`BottomNav`'s Search tab is permanent, always visible, icon **and** label, reachable in exactly
one tap with no menu to open first — a strictly better discoverability profile than a header
icon competing for space that, per the baseline table above, does not reliably exist at this
range. Adding a header Search here would **duplicate the easiest existing route**, not improve
on it, while consuming space already measured to cause a wordmark collision. **Rejected.**

### Tablet (640–1023px)

The gate brief frames this band as lacking `DesktopNav`, implying a possible gap. Direct
measurement contradicts the premise: `BottomNav` (`lg:hidden`, i.e. hidden only at ≥1024px) is
**confirmed visible at 768px and 1023px** in this build — the same permanent, icon+label Search
tab that covers mobile covers the entire tablet band too, because `DESIGN_SYSTEM.md` §9.1's
single navigation breakpoint (1024px) means tablet uses the *mobile* navigation model in full,
not a hybrid one. There is no tablet-specific navigation gap for Search to fill. A header trigger
here would be a third simultaneous Search entry point (header + `BottomNav` + drawer) solving a
problem that measurement shows does not exist. **Rejected — including as a `TABLET-ONLY HEADER
SEARCH` carve-out**, which was explicitly considered per the gate brief's own suggested outcome
and rejected on this evidence, not skipped.

### Desktop (≥ 1024px)

`DesktopNav` already carries a Search entry at the same visual weight as every other primary
destination. The evidence shows abundant free space (535–912px) but no evidence of a
discoverability failure — no crowding, no hidden control, no extra tap required. A second,
icon-based control adds a duplicate, not a fix (`simultaneousSearchAffordancesVisible: 2`,
measured). **Rejected**, including the "replace the `DesktopNav` link" variant, which the
Preserve constraint rules out independently.

## Accessibility (measured on the built-then-rejected prototype)

- 44×44 target: confirmed (`min-h-[44px] min-w-[44px]`).
- Accessible name: confirmed (`aria-label="Search"`, resolves to `"Search"` in the accessibility
  tree).
- Keyboard focus visibility: confirmed — 2px solid outline on `:focus-visible`, the same global
  treatment every other control uses; not suppressed.
- Enter activation: confirmed — real anchor, native link navigation to `/search`, no JS
  interception.
- No duplicate confusing labels within a single navigation region: the header's own Search
  control and `BottomNav`'s/`DesktopNav`'s are in different landmarks (`header` vs
  `nav[aria-label="Primary"]` vs `nav[aria-label="Main"]`), so identical `"Search"` names would
  not have been ambiguous to assistive tech — but this was never the disqualifying factor here;
  the disqualifying factors are the measured collision and duplication above.
- No focus-order regression: the prototype sat in natural DOM/tab order between the logo group
  and `ThemeToggle`; since it was reverted, this is moot for the shipped state, but was verified
  correct while built.

## Decision

**`KEEP CURRENT SEARCH NAVIGATION`**

## Rationale

Every breakpoint fails independently, on measured evidence, not on a single blanket objection:

1. **Mobile (< 640px) fails on collision.** A header Search icon in the only structurally sound
   slot (the existing right-side group) measurably overlaps the wordmark at 320/360/375px — three
   of the five required mobile widths — and clears it only marginally at 390px. This directly
   violates the gate's own Preserve constraint ("do not touch/collide with the wordmark").
2. **Tablet (640–1023px) fails on duplication, not space.** There is room (216–272px free), but
   `BottomNav`'s permanent Search tab already covers this entire band — confirmed by measurement,
   not assumed — because the product has one navigation breakpoint (1024px), not a mobile/tablet
   split. A header trigger here duplicates the easiest existing route without adding reach.
3. **Desktop (≥ 1024px) fails on duplication.** `DesktopNav`'s existing Search link is at the
   same visual weight as every other primary destination and shows no evidence of being missed.
   A second icon-based control next to it is exactly the "two same-purpose controls beside each
   other without justification" the gate brief says to avoid; replacing it is out of scope by
   the Preserve list.
4. **No breakpoint-specific carve-out survives either.** `TABLET-ONLY HEADER SEARCH` was
   explicitly evaluated (per the gate brief's own suggested outcome) and rejected on the same
   duplication evidence as the general tablet case — the tablet band was never actually
   uncovered.

This is the same restraint tie-breaker `NAV-SIDEBAR-WIDTH-1` used: once two options are equally
(in)effective at solving the actual, evidenced problem, don't add weight the product doesn't
need. Here, the losing option isn't even equally effective — it actively regresses mobile
branding while adding nothing measurable elsewhere.

APPLICATION CHANGE: **REJECTED** — no shipped code change. The Prototype A implementation was
built, measured in real Chromium at all eight required widths, screenshotted, and then fully
reverted; `git diff` against `main` for `app/(public)/layout.tsx` is empty.

## Files changed

- `docs/context/NAV_SEARCH_PLAN.md` (this file) — new.

No application source file differs from `main`.
