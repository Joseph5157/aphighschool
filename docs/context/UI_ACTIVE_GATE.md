# UI Active Gate

## Active gate

`UI-DESIGN-1`

## Status

CLOSED

## Purpose

Define the product's visual and interaction direction, and the design-system specification
that later gates implement, before any broad UI change is made.

## Change boundary

This gate is DESIGN DEFINITION. It may only add or update:

- `PRODUCT.md`
- `DESIGN.md`
- `docs/ui/DESIGN_SYSTEM.md`
- `docs/context/UI_ACTIVE_GATE.md`
- `docs/context/UI_CURRENT_STATE.md`

Application code, styles, components, routes, assets, database files, tests, and runtime
configuration are out of scope for this gate and were not modified. No audit finding was
fixed in this gate; the P0 findings are specified as intended behaviour for `UI-SYSTEM-1`.

Information architecture — routes, navigation structure, page composition — is explicitly
out of scope and unchanged.

## Required closure evidence

- The starting worktree was clean on `ui-system-production-readiness` at
  `fe309109acceaf8b4a3fd4e31889527882e3f0da`, local and live remote in agreement.
- `docs/ui/UI_AUDIT.md`, the master plan, and both context documents were read before any
  design decision was made, along with the binding constraints in `AGENTS.md` and
  `.agents/skills/design-tokens.md`.
- `PRODUCT.md` states the product, audience, jobs, promises and non-goals, and records the
  open product questions that block specific checklist items.
- `DESIGN.md` states the direction, target character, principles, what to avoid, and the
  reasoning for each decision made in this gate.
- `docs/ui/DESIGN_SYSTEM.md` specifies typography, colour roles, active/navigation state,
  focus treatment, spacing, containers, radius, borders, shadows, density, responsive
  philosophy, interaction states, motion, dark mode, trust/GOIR presentation, and
  lifecycle/freshness presentation.
- All three P0 audit findings named in the gate brief are accounted for as specification:
  invalid Tailwind utility usage (§R0.1), undefined `accent` (§4.1–4.2), and the
  non-rendering focus treatment (§6) — defined, not fixed.
- `npx tsc --noEmit` passes and `git diff --check` is clean.
- The documents are committed and pushed on the program branch, and the local branch HEAD
  matches the live remote branch SHA.

## Closure notes

The existing visual identity was **codified rather than replaced**. Every P0 and P1 finding in
`UI-AUDIT-1` is a correctness defect — utilities that do not compile, an undefined colour, a
focus ring that never paints, two stacked bottom bars — and none is evidence that the
aesthetic direction is failing. Redesigning in response to build defects would have treated
the wrong problem, and the master plan forbids redesigning information architecture here.

Three decisions go beyond restating the current design because the current design contradicts
itself:

- `accent` is **retired, not defined**. `AGENTS.md` fixes a closed token set, and navigation
  position is chrome that must not borrow a document-status colour.
- `superseded` moves from the green family to `kumkum`, because a document that has been
  replaced currently renders in the same colour family as one that is in force.
- `Badge`'s `success` and `warning` variants move off raw `emerald-*` / `amber-*`, which
  violate `AGENTS.md` and do not participate in the dark-mode flip — and which style the two
  most trust-bearing markers in the product.

Impeccable was not available in this environment, so no external design critique was run; this
is recorded in `DESIGN.md` and `UI-IMPECCABLE-1` remains the gate that would use it.

## Next gate after closure

`UI-SYSTEM-1`
