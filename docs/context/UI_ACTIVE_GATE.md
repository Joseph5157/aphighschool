# UI Active Gate

## Active gate

`UI-MOBILE-NAV-1`

## Status

CLOSED

## Purpose

Complete the mobile navigation experience: close audit finding F5 (the off-canvas drawer's
missing modal behaviour) and F28 (the global keyboard shortcut), without duplicating the
navigation systems already in place.

## Retain / refine / merge / replace decision

**REFINE**, as `UI-AUDIT-1` recorded. The existing two-part model — a bottom tab bar for the
five most-used destinations below `lg`, and an off-canvas drawer for the full menu — is sound
and was not changed. Nothing was replaced and no second navigation system was introduced. The
drawer's *behaviour* was rebuilt; its structure, contents and destinations are untouched.

21st.dev was not available in this environment, so the external-component rule was not
exercised. It would not have applied regardless: the defect was missing behaviour in a
component that already fits the product, not a component that needed replacing.

## Change boundary

Mobile navigation behaviour only: `Sidebar.tsx` (provider and drawer) plus the test scanner
it exposed. Navigation structure, destinations, information architecture and page layout are
unchanged.

## Required closure evidence

- Starting worktree clean on `ui-system-production-readiness` at
  `e29383d344e23a1126ba98249ff076eee14eff39`, local and live remote in agreement.
- Every behaviour the gate names has a test: opening, closing, active route, route changes,
  outside interaction, Escape, focus handling, scroll locking, touch targets, accessible
  labels, responsive transitions.
- A mutation battery ran **eight** deliberate reintroductions of the defects being fixed.
  Seven were caught immediately; the eighth survived and the test was rewritten until it
  failed for the right reason.
- Full Vitest suite passes: 48 files, 347 tests. `npx tsc --noEmit` passes, Tailwind utility
  validation passes, `git diff --check` clean.
- Committed, pushed, and local branch HEAD matches the live remote branch SHA.

## Closure notes

**The mutation battery earned its keep — one test was passing for the wrong reason.** The
viewport-transition test asserted the drawer was gone at desktop width. It always is:
`Sidebar` renders the desktop aside instead, so the drawer unmounts whether or not its open
state was reset. Removing the reset entirely did not fail the test. The rewritten version does
the round trip — open on a phone, cross to desktop, come back — and now catches it. This is
the same shape as the `Field` defect in `UI-SYSTEM-2`: a test that observes the right thing at
the wrong moment.

**Inertness without losing the slide.** Unmounting the closed drawer would have been the
simplest way to make it inert, and is what `Dialog` does — but it would have thrown away the
drawer's slide animation, which is motion answering a user action and worth keeping.
`visibility: hidden` removes an element from the tab order and the accessibility tree while
still transitioning, so transitioning it alongside `transform` flips it exactly at the end of
the closing slide. The `inert` attribute is set from an effect as well, both as belt-and-braces
and because it is the half jsdom can observe.

**A guard produced a false alarm and was hardened rather than silenced.** The dead-class
scanner split template literals on `${...}` with a pattern that stopped at the first `}`, so a
hole containing a nested template literal ended mid-expression and the remainder was tokenised
as class text — reporting `translate-x-0"`, a class that does not exist, at a line where
nothing was wrong. The scanner now counts braces. The component was also restructured to
compute its state classes in named variables, which is clearer regardless.

## Next gate after closure

`UI-PATTERNS-1`
