# Header 320px collision fix — record

Branch: `nav-header-320-1`. Branch point: verified clean `main` at
`9ca4ff9d60b6f6362be1636168d48308213b96d3`.

## Problem

`NAV-SEARCH-1` (`docs/context/NAV_SEARCH_PLAN.md`) surfaced, as an out-of-scope side finding, that
the public header already overlapped at the 320px accessibility floor on unmodified `main` — no
Search prototype involved. This gate is the narrow, defect-only fix for that overlap.

## Read first

`PRODUCT.md`, `DESIGN.md`, `docs/ui/DESIGN_SYSTEM.md`, `docs/context/NAV_SEARCH_PLAN.md`, the
public layout/header (`app/(public)/layout.tsx`), `DesktopNav.tsx`, `ThemeToggle.tsx`,
`IconButton.tsx` (`SidebarTrigger`'s underlying component), `test/nav.test.tsx`,
`test/mobile-nav.test.tsx`.

## Baseline (real Chromium, production build, `next start`, before any code change)

Measured at all nine required widths, `getBoundingClientRect()` on the live header:

| Width | Header h | Menu | Theme | Brand group width | Subtitle width | Gap: brand → theme | Overflow | Console |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 280 | 69px | 44×44 | 42×44 | 196.2px | 148.2px | **−46.2px** | **26px** | clean |
| 320 | 69px | 44×44 | 42×44 | 196.2px | 148.2px | **−6.2px** | 0px | clean |
| 360 | 69px | 44×44 | 42×44 | 196.2px | 148.2px | 33.8px | 0px | clean |
| 375 | 69px | 44×44 | 42×44 | 196.2px | 148.2px | 48.8px | 0px | clean |
| 390 | 69px | 44×44 | 42×44 | 196.2px | 148.2px | 63.8px | 0px | clean |
| 430 | 69px | 44×44 | 42×44 | 196.2px | 148.2px | 103.8px | 0px | clean |
| 768 | 69px | 44×44 | 120×44 | 196.2px | 148.2px | 272.3px | 0px | clean |
| 1024 | 69px | 44×44 | 106.4×44 | 196.2px | 148.2px | 535.1px | 0px | clean |
| 1440 | 69px | 44×44 | 120×44 | 196.2px | 148.2px | 912.3px | 0px | clean |

Confirms `NAV_SEARCH_PLAN.md`'s number exactly (−6.2px at 320px). `docScrollWidth ===
docClientWidth` at every required width except 280 — this is an internal same-row visual
collision, not page-level horizontal overflow, at the 320px floor.

## Root cause

The header's brand group (`app/(public)/layout.tsx`, inside `<header>`) was:

```
<Link href="/" className="group flex items-center gap-3 shrink-0">
  <div className="w-9 h-9 ...">AP</div>
  <div>
    <div className="font-bold text-sm ...">AP Teacher Desk</div>
    <div className="text-xs font-mono ... uppercase tracking-wider">AP School Education</div>
  </div>
</Link>
```

`shrink-0` sat on the **whole** `Link` (icon + text stack together), not on the icon mark alone.
Per the CSS Flexbox spec, an item with `flex-shrink: 0` never renders below its own max-content
size, and — because none of `Link`'s descendants had `min-width: 0` — this pinned the *entire*
group at its full natural width at **every** viewport, confirmed identical (196.2px) across all
nine widths above.

Measuring the two text lines' own intrinsic (unwrapped) widths via `Range.getBoundingClientRect()`
showed the width-driving line was the **subtitle**, not the primary wordmark:

- `"AP Teacher Desk"` (primary wordmark): **104.81px**
- `"AP School Education"` (secondary subtitle, `font-mono uppercase tracking-wider`): **148.2px**

The subtitle needed 43.4px more than the primary wordmark, and because the whole group was
`shrink-0`, that full 148.2px was locked in at every width — including 320px, where the header's
available content width (288px, after `px-4` padding) minus the theme toggle (42px) minus the
required 16px row `gap` leaves only ~230px for the brand group before it starts eating into the
`gap`, and the group's fixed 252.2px (icon + gap + text) exceeds that, producing the measured
−6.2px overlap. At 280px the deficit is large enough (−46.2px, needing 62px+ of reduction) to
overflow the header itself (26px page-level overflow), not just collide internally.

This is exactly the "inappropriate `shrink-0`" case named in the gate brief's own fix-priority
list, not a spacing or subtitle-visibility problem on its own.

## Options tested

1. **Flex correctness alone** (move `shrink-0` to just the AP icon mark, add `min-w-0` down the
   chain, no truncation): rejected as the *sole* fix — without `truncate`/`whitespace-nowrap`
   guards, the subtitle's normal `white-space: normal` would let it wrap onto a second line at
   narrow widths (browser will always prefer wrapping over shrinking indefinitely once dry), which
   would grow the header past 69px — a bigger regression than the one being fixed.
2. **Structural correctness + narrow-phone subtitle truncation** (chosen): flex correctness makes
   the group shrinkable at all, `whitespace-nowrap` on the primary wordmark keeps it always fully
   legible on one line (its 104.8px floor is well inside any required-width budget), and `truncate`
   (`overflow: hidden; text-overflow: ellipsis; white-space: nowrap`) on the *secondary* subtitle
   lets it compress and ellipsize instead of wrapping or overflowing. `truncate`'s `overflow:
   hidden` also zeroes that element's contribution to the flex automatic-minimum-size calculation,
   so it — not the primary wordmark — absorbs the narrow-width squeeze first.
3. **Desktop-width side effect, found and closed during verification**: an initial version of the
   fix (flex correctness with no `lg:` guard) also let the brand group shrink at exactly 1024px,
   where `DesktopNav`'s six links plus the CMS button plus the full-text `ThemeToggle` already
   consume the entire row (a **pre-existing**, separate tightness confirmed present on unmodified
   `main` — see Desktop finding below) — the newly-shrinkable brand group ended up sharing that
   squeeze, truncating the subtitle at **desktop** width, which it never did on `main`. Verified by
   diffing computed flex values before/after and by `git stash`-comparing a same-viewport
   screenshot against clean `main`. Fixed by adding `lg:shrink-0` to the brand group's outer
   wrapper, re-pinning it to its exact pre-gate width at `lg:` (1024px) and up, leaving the
   narrow-phone fix (below `lg:`) untouched.

## Chosen fix

`app/(public)/layout.tsx`, the header's brand group:

- Outer wrapper (`SidebarTrigger` + `Link`): `flex items-center gap-3` → `flex items-center gap-3
  min-w-0 lg:shrink-0`.
- `Link`: `group flex items-center gap-3 shrink-0` → `group flex items-center gap-3 min-w-0`
  (shrink-0 removed).
- AP icon mark `div`: adds `shrink-0` (protects the fixed 36×36 mark from ever compressing).
- Text-stack wrapper `div`: adds `min-w-0`.
- Primary wordmark `div` ("AP Teacher Desk"): adds `whitespace-nowrap` (never wraps, never
  truncates — primary identity stays whole).
- Secondary subtitle `div` ("AP School Education"): adds `truncate` (compresses and ellipsizes
  once space runs short; the full text remains in the DOM/accessibility tree regardless).

No change to `DesktopNav`, `BottomNav`, the mobile drawer, `ThemeToggle`, `IconButton`/
`SidebarTrigger`, header height, or the 1024px navigation breakpoint's own logic.

## Before/after measurements (real Chromium, production build)

| Width | Header h | Menu | Theme | Brand group width | Subtitle width | Gap: brand → theme | Overflow | Console |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 280 (diagnostic) | 69px | 44×44 | 42×44 | 134px | 86px | 16px | 26px (unchanged from baseline) | clean |
| **320** | **69px** | **44×44** | **42×44** | 174px | 126px | **+16px** | **0px** | clean |
| 360 | 69px | 44×44 | 42×44 | 196.2px (unchanged) | 148.2px (unchanged) | 33.8px (unchanged) | 0px | clean |
| 375 | 69px | 44×44 | 42×44 | 196.2px (unchanged) | 148.2px (unchanged) | 48.8px (unchanged) | 0px | clean |
| 390 | 69px | 44×44 | 42×44 | 196.2px (unchanged) | 148.2px (unchanged) | 63.8px (unchanged) | 0px | clean |
| 430 | 69px | 44×44 | 42×44 | 196.2px (unchanged) | 148.2px (unchanged) | 103.8px (unchanged) | 0px | clean |
| 768 | 69px | 44×44 | 120×44 | 196.2px (unchanged) | 148.2px (unchanged) | 272.3px (unchanged) | 0px | clean |
| 1024 | 69px | 44×44 | 102.1×44 | 196.2px (unchanged) | 148.2px (unchanged) | 542.3px (≈baseline 535.1px) | 0px | clean |
| 1440 | 69px | 44×44 | 120×44 | 196.2px (unchanged) | 148.2px (unchanged) | 912.3px (unchanged) | 0px | clean |

At 320px the previous −6.2px overlap is now a clean +16px gap (exactly the row's own `gap-4`
minimum) with zero page-level overflow. 360–1440px are pixel-identical to baseline (the
`lg:shrink-0` guard confirmed via a `git stash` A/B screenshot comparison against clean `main` at
1024px — the pre-existing `DesktopNav` link-wrapping at exactly 1024px, visible in both, is
unrelated to this change and out of this gate's scope). 280px (diagnostic only) is unchanged in
overflow magnitude (26px, same as baseline) — the subtitle now truncates rather than fully
colliding, a partial improvement, but the width deficit there is large enough (needs 62px+) that a
full fix would require touching the primary wordmark or an even narrower-scoped treatment, which
the gate's own Preserve list and "280px is diagnostic, not automatically a support target" framing
rule out.

## 280px diagnostic behavior

Screenshot-confirmed: the subtitle now ellipsizes ("AP SCHOOL …") instead of running fully under
the theme toggle, but the primary wordmark ("AP Teacher Desk") still visually approaches the
toggle at this sub-320px width, and the header still overflows the page by 26px (same magnitude as
baseline — this gate did not make 280px worse, and did not fully fix it either). Not a required
target per the gate brief.

## Desktop finding (pre-existing, out of scope)

At exactly 1024px on **unmodified `main`** (confirmed via `git stash` + rebuild + screenshot,
independent of this gate's change), `DesktopNav`'s "Orders & Circulars" and "Service Desk" links
already wrap onto two lines, and the gap between the brand subtitle and the first nav link
("Home") is visibly tight. This is a separate, pre-existing tightness at the 1024px breakpoint
(demand from `DesktopNav` + CMS button + full-text `ThemeToggle` already meets or exceeds the row's
available width there) — unrelated to the 320px defect this gate targets, not touched by this
fix (the `lg:shrink-0` guard specifically re-pins the brand group to this exact pre-existing
baseline behavior rather than letting it participate in — or improve — that separate squeeze).
Worth raising if a future gate's scope ever covers the 1024px breakpoint or `DesktopNav` itself.

## Accessibility

- Menu trigger accessible name: unchanged (`"Open navigation menu"` / `"Close navigation menu"`,
  `IconButton` untouched).
- Theme-toggle accessible name: unchanged (`"Dark theme"` / implicit light label, `ThemeToggle`
  untouched).
- Keyboard order: unchanged (no interactive elements added, removed, or reordered — only
  `className` changes on non-interactive wrapper `div`s).
- Focus-visible styling: unchanged (no focus-relevant classes touched).
- Primary product identity remains complete for assistive tech regardless of visual truncation:
  verified via `innerText()` on the live 320px page — `"AP\nAP Teacher Desk\nAP SCHOOL EDUCATION"`
  — the full subtitle text is present in the accessible tree; `truncate` is presentation-only
  (`overflow: hidden` + `text-overflow: ellipsis`), it does not remove or alter the DOM text node.

## Regression guard

`test/nav-header-320.test.tsx` — six structural assertions against `app/(public)/layout.tsx`'s
source, following this project's existing `test/nav.test.tsx` pattern (string/regex assertions on
the layout source rather than a full render, since the header lives inside `SidebarProvider` and
is impractical to mount standalone):

1. The brand `Link`'s own opening tag does not carry `shrink-0` (the regressing pattern).
2. The AP icon mark carries `shrink-0` (protected from compressing).
3. The text-stack wrapper carries `min-w-0` (allowed to shrink).
4. The primary wordmark carries `whitespace-nowrap` and not `truncate` (never hidden/clipped).
5. The subtitle carries `truncate` (allowed to compress and ellipsize).
6. The outer brand-group wrapper carries `lg:shrink-0` (protects the confirmed-tight 1024px
   desktop geometry from this narrow-phone fix).

**Mutation-checked**: re-introduced the exact regression (`shrink-0` back on the whole `Link`) and
confirmed test 1 fails with the reintroduced class printed in the assertion diff; reverted and
confirmed all six pass again.

## Validation

- `npx vitest run test/nav-header-320.test.tsx` — 6/6 passed.
- `npx vitest run` (full suite) — **71 files, 508 tests, all passed**, including
  `test/tailwind-classes.test.ts` (every utility class used compiles to real CSS) and
  `test/nav.test.tsx` / `test/mobile-nav.test.tsx` (unaffected).
- `npx tsc --noEmit` — clean, no errors.
- `git diff --check` — clean, no whitespace errors.
- `npx next build` — clean production build, no warnings.
- Chromium acceptance — all nine required widths measured above, zero console errors at any
  width, zero page-level overflow at every required (non-diagnostic) width.

## Files changed

- `app/(public)/layout.tsx` — header brand group flex/shrink/truncate fix.
- `test/nav-header-320.test.tsx` — new regression guard.
- `docs/context/NAV_HEADER_320_PLAN.md` — this file, new.
