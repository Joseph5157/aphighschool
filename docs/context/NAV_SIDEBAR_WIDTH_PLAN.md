# Desktop Quick Menu width experiment — record

Branch: `nav-sidebar-width-1`. Branch point: verified clean `main` at
`13260d1017b41ec522cfe2e5a2954cf46deb87b1`.

Follows `docs/context/NAV_SIDEBAR_PLAN.md` (`NAV-SIDEBAR-1`/`NAV-SIDEBAR-2`), which scoped the
desktop "Public Quick Menu" down to its eight utility deep links but left its **push** layout
model — and the 1024–1280px header collision it causes — as an explicit follow-up.

## Question

Should a rarely used, secondary utility menu be allowed to push the primary reading surface
sideways at all? `PRODUCT.md`/`DESIGN.md` are explicit: this is a reference/reading product; the
utility menu is furniture, not the point.

## Baseline (push model, real Chromium, production build)

| Width | Collapsed content width | Expanded content width | Header collision | Page overflow |
| --- | --- | --- | --- | --- |
| 1024×768 | main 1009px | main 753px | **yes** — "Home" overlaps "AP SCHOOL EDUCATION" (measured bounding-box overlap) | **yes** — `scrollWidth` 1061 vs `clientWidth` 1009; the `CMS →` button is pushed 36.5px past the viewport edge |
| 1280×900 | main 1265px | main 1009px | **yes** — 21×9px measured overlap | none |
| 1440×1000 | feed 1001px / rail 312px | feed 809px / rail 248px | none | none |
| 1920×1080 | feed 1282px / rail 406px | feed 1180px / rail 372px | none | none |

The 1024px horizontal page overflow is a **new finding this gate**, not previously measured —
confirmed shell-level (reproduces on the homepage and on a document-detail page identically), and
a direct violation of `DESIGN_SYSTEM.md` §9.3 ("No accidental page-level horizontal scroll at any
width"). Collapsed-state width and reading width are otherwise identical to `NAV-SIDEBAR-1`'s
figures.

Click cost to reach a deep link: 2 (open menu, already-expanded `Calculators & Bills` link) to 3
(open menu, expand `Pension Services`, link).

## Prototype A — overlay quick panel

Full-height, `fixed`, scrimmed panel sliding in from the left — the same visual language as the
mobile drawer, keyed to desktop `open` state instead of `openMobile`.

**Measured: fully solves the width problem.** Content width (main/feed/rail) is identical whether
the panel is open or closed, at all four widths — confirmed 1024 (1009px unaffected), 1280
(1265px unaffected), 1440 (feed 1001px / rail 312px, matching the *collapsed* baseline exactly),
1920 (no overflow). No header collision at any width.

**A real accessibility bug was found and fixed during this work, not deferred**: calling
`.focus()` on the panel's first focusable element while the panel was still mid-way through its
CSS `transform` slide-in was silently dropped by Chromium — an element positioned off-screen via
an in-progress transform does not accept focus even though transform has no effect on
focusability per spec. Fixed by moving the focus call into a `transitionend` listener (with an
immediate call as a fallback for `prefers-reduced-motion`/no-transition environments), not a
magic-number timeout. Verified: focus now correctly enters the panel on open, Tab stays trapped
inside it, Escape closes it and returns focus to the trigger, and clicking the scrim also closes
it.

**Rejected anyway.** The scrim dims the *entire page* while the panel is open — for a full-height
modal treatment of an eight-link utility lookup. Measured cost: 100% visual competition with the
document (the reader loses sight of it entirely, however briefly) for a task `PRODUCT.md` frames
as secondary. The width problem doesn't require this much interruption to solve.

## Prototype B — compact header quick-links popover

Anchored below the trigger, sized to its own content (not full height), no scrim — a non-modal
popover (`aria-modal="false"`) that leaves the document visible and interactive while open.

**Measured: identically solves the width problem**, with no equivalent implementation cost. Since
the popover has no CSS transform transition, it never hit the focus-timing bug found in Prototype
A — it mounts already in its final position, so focus enters immediately and correctly. Verified:
content width unaffected at 1024 (1009px), 1280 (1265px), no header collision, no page overflow
at any width. Focus enters on open, Escape closes and returns focus to the trigger, and clicking
outside the panel also closes it (without closing on the *same* click that opened it — the
listener attaches one tick after mount specifically to avoid that). Because it's genuinely
non-modal, Tab is deliberately **not** trapped inside it — trapping is a modal-dialog behaviour,
which this correctly isn't.

Measured panel size at 1024×768 with `Calculators & Bills` pre-expanded (its existing
`defaultOpen`): 256×510px, comfortably inside the viewport with no overflow.

## Comparison

| | Push (current) | Overlay (A) | Popover (B) |
| --- | --- | --- | --- |
| Header collision | yes, 1024–1280px | none | none |
| Page overflow | yes, 1024px | none | none |
| Reading-width preservation | no — shrinks at every width while open | yes — unaffected | yes — unaffected |
| Visual competition with document | moderate (narrower column) | high (full-page scrim) | low (small panel, page stays visible) |
| Click cost | 2–3 | 2–3 | 2–3 |
| Keyboard accessibility | no modal contract needed (not a modal) | full modal contract, required a real bug fix to work | focus-in/Escape/outside-click/return-focus, no transition-timing class of bug to fix |
| Implementation complexity | already built | new component, ~115 lines, needed the transitionend fix | new component, ~90 lines, simpler focus story |
| Mobile consistency | N/A (desktop-only difference) | matches the drawer's visual language | a distinct, desktop-specific affordance — acceptable since mobile and desktop already differ in navigation model for other reasons |
| Design-system fit | violates §9.3 (page overflow) at 1024px | no violation, but a full-page modal is a heavier treatment than `DESIGN.md`'s restraint principle wants for secondary furniture | best fit — restrained, no scrim, no motion beyond what's needed |

## Decision

**`SHIP HEADER QUICK-LINKS POPOVER`**

## Rationale

Both prototypes fully and equally solve the stated problem — zero header collision, zero page
overflow, zero reading-width cost at any measured width. Once two options are equally effective
at the actual goal, the tie-breaker is `DESIGN.md`'s own hierarchy: don't add weight a task
doesn't need. The overlay's full-page scrim treats a "look up which link goes to the PRC
calculator" lookup with the same visual weight as a genuine modal decision (confirm a delete, fill
a form) — the reader's whole view of the document they came for goes dark for the duration. The
popover asks for exactly the amount of attention the task actually needs: a small, anchored panel
that doesn't require the reader to lose their place.

It also happens to be the simpler, more robust implementation — no scrim z-index/click-through
logic, no focus-trap Tab-cycling code, and no exposure to the transform/focus timing bug the
overlay needed a real fix for (a popover with no slide transition can't hit that class of race).

`KEEP PUSH SIDEBAR` is ruled out by the measured 1024px page-level horizontal overflow alone —
that's a `DESIGN_SYSTEM.md` §9.3 violation, not a stylistic preference. `REMOVE DESKTOP QUICK
MENU` was never well-supported: `NAV-SIDEBAR-1` already found the eight deep links have some
standalone value and kept them; this gate's job was to fix *how* they're presented, not to
re-litigate *whether* they should exist, and now that the width problem is fully solved there's no
remaining argument for removal.

## A pre-existing defect found, not caused, and out of this gate's scope

While verifying the mobile drawer was unaffected, real-Chromium testing found that `MobileDrawer`
does **not** actually move focus into the panel on open — confirmed on **clean, unmodified
`main`** (verified via `git stash` + a from-scratch build, isolating this gate's changes
entirely) that this is pre-existing, not a regression from this work. It's the same class of bug
found and fixed in Prototype A (focus called while the panel is still mid-transform), but this
gate's explicit instruction was "do not modify the mobile drawer," so it is recorded here, not
fixed. A future gate (e.g. `NAV-DRAWER-FOCUS-1`) should apply the same `transitionend`-based fix
proven here to `MobileDrawer`'s equivalent effect.

**Fixed in `NAV-DRAWER-FOCUS-1`** (branch `nav-drawer-focus-1`, commit `889d866`). One correction
to the assumption above: a `transitionend` listener turned out to be the *whole* fix, not just the
primary path with an "immediate call" fallback for `prefers-reduced-motion` — direct measurement
found the immediate-call fallback still hits this exact bug under reduced motion, because the
global override collapses `transition-duration` to ~0.01ms rather than exactly 0, so a transition
still nominally runs and a synchronous call still lands before the browser flushes the resulting
layout. `MobileDrawer` instead always waits for `transitionend` on the panel's own `transform`
property, with a timeout fallback (derived from the panel's declared transition-duration, not a
guessed constant) only for the case where `transitionend` never fires at all — e.g. the panel was
already at its open transform, so no value changed to transition. See the commit message for full
verification detail (real-Chromium acceptance at all four required widths, both motion settings).

## Implementation

- `app/(public)/_components/Sidebar.tsx`: `Sidebar` gained a `desktopVariant?: "push" | "popover"`
  prop (default `"push"`). The admin CMS's `AdminSidebar` (`collapsible="icon"`) doesn't pass it,
  so its push behavior is **completely unchanged** — this is a real, still-used consumer, not
  dead code kept "just in case" (confirmed by grep before making any change). The public layout
  opts into `desktopVariant="popover"`. Prototype A's `DesktopOverlayPanel` was built, measured,
  and then deleted entirely — not kept behind a flag.
- `app/(public)/layout.tsx`: `<Sidebar side="left" desktopVariant="popover">` (the now-unused
  `collapsible="offcanvas"` prop, meaningful only for the push variant, was also removed here for
  clarity).
- `test/desktop-quick-menu.test.tsx` (new): guards the popover's `fixed` positioning (a
  structural proxy for "cannot push layout, regardless of width"), non-modal semantics, and its
  open/close/focus/Escape/outside-click contract. Mutation-checked: reverting the container to
  `sticky`, disabling the Escape handler, and disabling the outside-click handler each fail the
  guard that owns them.

## Verification

`tsc --noEmit` clean · full Vitest **70 files / 501 tests pass** (up from 496 — 5 new tests) ·
Tailwind class/colour guards pass (part of the suite) · `git diff --check` clean · `npx next
build` succeeds, First Load JS shared unchanged at 87.3 kB · real-Chromium acceptance at 1024×768,
1280×900, 1440×1000, 1920×1080 (push baseline, overlay prototype, popover prototype, and the final
shipped popover, each independently measured) plus 390×844 confirming the mobile drawer's
destinations and content are unchanged, on isolated production server instances throughout — the
shared dev server was never touched.

## Deliberately not done here

`DesktopNav`, `BottomNav`, the mobile drawer's behavior and content, the 1024px navigation
breakpoint, the sidebar's `SidebarProvider` architecture, active-state visuals, and A16 are all
unchanged. No 21st.dev component was installed — Prototype B's *interaction idea* (anchored
popover, non-modal) was original implementation, not copied styling.
