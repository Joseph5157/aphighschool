# Homepage polish — plan and gate record

Branch: `home-polish-1`

Branch point: verified clean `main` at `2493d8167497aef4b91c0fa3ac07d07807a3c552` (local
`main` and `origin/main` matched before branch creation).

A small, narrowly-scoped series distinct from the closed UI System and AI slop programs
(`docs/context/UI_SYSTEM_CLOSURE.md`, `docs/context/SLOP_REMEDIATION_PLAN.md`). Each gate here
is deliberately small: one finding in, one fix out, no redesign.

## Gates

```
HOME-21ST-AUDIT-1   audit only — no application code changed
      ↓
HOME-POLISH-1       CLOSED — this record
      ↓
HOME-TELUGU-1       CLOSED — measured, no application change (docs/context/HOME_TELUGU_PLAN.md)
```

## `HOME-21ST-AUDIT-1` — record

Design-inspiration audit against 21st.dev, scoped to the homepage only. No application code
changed. Findings delivered in-conversation (not a separate doc), structured as: current
strengths/weaknesses measured in real Chromium at 390×844 and 1440×1000, five selected 21st.dev
references with useful/reject notes, and a recommendation. Verdict: **no mockup or
implementation required** for the homepage overall; one concrete defect was traced and handed to
`HOME-POLISH-1`.

The one actionable finding: at 390×844 the homepage carried an unexplained ~32px gap above the
heading/document feed, traced to the outer container's `space-y-8 lg:space-y-0` operating across
`DesktopLeftNav`'s wrapper — a sibling that is always present in the DOM but renders empty below
`lg` (`hidden lg:block` on `DesktopLeftNav`'s own root). Tailwind's `space-y-*` selector is
`:not([hidden])`, which checks the HTML `hidden` attribute, not computed display, so the margin
landed regardless.

## `HOME-POLISH-1` — record

Scope: the one `HOME-21ST-AUDIT-1` finding above. No redesign, no IA change, no 21st.dev
component installed.

### Root cause

`app/(public)/(home)/page.tsx`'s outer grid container used `space-y-8 lg:space-y-0` to space the
rail column from the feed column when they stack. They never actually stack: `DesktopLeftNav` is
`hidden lg:block`, so its wrapper renders empty below `lg` every time, on every visit. The
`space-y-*` margin still applied to the feed column because Tailwind's generated selector
excludes only elements carrying the literal `hidden` HTML attribute, not elements hidden via a
`display: none` utility class or an empty subtree.

### Fix

Removed `space-y-8 lg:space-y-0` from the outer container in both `page.tsx` and its
`loading.tsx` (kept in sync, per `SLOP-STATES-1`'s own rule that a skeleton may only reserve a
structure the loaded page can actually render). `lg:gap-8` alone is correct and sufficient: CSS
`gap` only inserts space between grid/flex items that are actually laid out, so it naturally
produces zero space next to a `display:none` item — the property `space-y-*`'s selector-based
margin does not have.

### Measured acceptance (real Chromium, isolated dev server, light theme)

| Measurement | Before | After |
| --- | --- | --- |
| First document row top (390×844) | 254.6px | **222.6px** (−32px, exact) |
| First document row top (375×812) | not measured at `HOME-21ST-AUDIT-1` | 251.2px |
| Row 3 visibility against the bottom nav (390×844) | ~75% visible | **~90% visible** |
| Fully visible document rows before the bottom nav (390×844) | 2 full + 1 partial | **2 full + 1 partial** (unchanged — not claimed as 3; see below) |
| Desktop rail width (1440×1000) | 312.25px | **312.25px** (unchanged) |
| Desktop feed width (1440×1000) | 1000.75px | **1000.75px** (unchanged) |
| Horizontal overflow (390, 375, 1440) | none | **none** |
| Console errors | none | **none** |

The fix removes exactly the dead 32px and nothing else — confirmed by the before/after row-top
delta matching the removed utility's value precisely. It does **not** reach a literal "3 fully
visible rows": the third row is now ~90% visible instead of ~75%, a real improvement, but the
gate's own instruction was not to force that claim if measurement didn't support it, so it isn't
made here.

### Regression guard

`test/density-regressions.test.tsx` gained one case (`HOME-POLISH-1` describe block): asserts the
rendered homepage HTML never contains `space-y-8`, and still contains `lg:grid-cols-12` /
`lg:gap-8`. Mutation-checked: reintroducing `space-y-8 lg:space-y-0` on the outer container fails
the guard with the exact old string in the diff; removing the mutation restores green.

### Verification

`tsc --noEmit` clean · full Vitest **69 files / 486 tests pass** (density-regressions.test.tsx:
13, up from 12) · Tailwind class/colour guards pass (part of the suite) · `git diff --check`
clean · `npx next build` succeeds, 42 static pages, First Load JS shared unchanged at 87.3 kB ·
real-Chromium acceptance at 390×844, 375×812 and 1440×1000, light theme, on an isolated dev
server instance (the shared port-3000 dev server was mid-recompile/stale during this session and
was left untouched rather than restarted).

### Files changed

- `app/(public)/(home)/page.tsx` — removed `space-y-8 lg:space-y-0` from the outer container.
- `app/(public)/(home)/loading.tsx` — same removal, kept in sync with the loaded page's geometry.
- `test/density-regressions.test.tsx` — added the regression guard above.

### Deliberately not done here

Telugu-title truncation asymmetry (`HOME-21ST-AUDIT-1` finding) is `HOME-TELUGU-1`'s scope, not
touched. The expand-in-place search icon idea is a later prototype, not built. Document row
structure, `PostCard` content, category rail, desktop feed width, search placement, navigation,
bottom navigation, lifecycle/state presentation, labelled dates, GO/reference metadata,
typography scale and design tokens are all unchanged.
