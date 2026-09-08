# UI Active Gate

## Active gate

`UI-SYSTEM-1`

## Status

CLOSED

## Purpose

Implement the approved design-system foundations from `docs/ui/DESIGN_SYSTEM.md`: the
regression guard for non-compiling utilities, removal of the invalid utilities themselves,
retirement of `accent`, a working focus-visible system, normalised trust-bearing state
colours, and the foundation token rules.

## Change boundary

This gate is FOUNDATIONS ONLY. In scope:

- `tailwind.config.js`, `app/globals.css`, `lib/breakpoints.ts`
- shared primitives in `app/(public)/_components`
- mechanical removal of non-compiling utilities wherever they appeared
- new guard tests

Out of scope and deliberately untouched: page redesign, information architecture, component
API changes, full component migration (`UI-SYSTEM-2`), responsive repair
(`UI-RESPONSIVE-1`), and navigation behaviour — Escape, focus trap, scroll lock, closed-state
inertness — which remain `UI-MOBILE-NAV-1`.

## Required closure evidence

- Starting worktree clean on `ui-system-production-readiness` at
  `177d631c2e118ba1d1265b0a8f12e36aff63c00e`, local and live remote in agreement.
- The dead-class guard was written and run **before** any fix, and failed naming all seven
  non-compiling utility families and all three `accent` sites with file and line.
- Every guard added in this gate was mutation-tested: the defect it covers was deliberately
  reintroduced and the guard failed with an on-topic message, then the code was restored.
- Full Vitest suite passes: 44 files, 288 tests, including the DB-backed trust suites
  (`goir-provenance`, `freshness-trust`, `freshness-rendered`, `seed-integrity`) and
  `dark-mode`.
- `npx tsc --noEmit` passes and `git diff --check` is clean.
- Tailwind class validation passes: every utility used in `app/**` compiles, every
  project-defined class exists, and no `accent` utility remains in source or output.
- Committed, pushed, and local branch HEAD matches the live remote branch SHA.

## Closure notes

The guard found a hole in itself. After the main fixes went in, a mutation that reinserted
`shadow-2xs` into `Card.tsx` **passed** — the scanner read source line by line, and a class
string written as a multi-line template literal has only one backtick on its opening line, so
it was never scanned at all. Card, Sidebar and every other component that builds a conditional
`className` that way were invisible to the guard. Scanning whole files and deriving line
numbers from offsets closed it; the shared scanner now lives in `test/class-source.ts` and
both style guards use it.

Two spec corrections were made from implementation, and both are recorded in place in
`DESIGN_SYSTEM.md`:

- **§7.1 radius.** The specified `sm 4 / md 8 / lg 12 / xl 16` scale would have redefined
  Tailwind's own token names under 163 existing usages — every `rounded-lg` shifting 8px →
  12px and `rounded-2xl` disappearing. That is a breaking rename, not a token definition.
  Tailwind's default scale is kept and the rule is now expressed in its names.
- **§6 focus.** Moving the rule out of `@layer base` and onto element selectors is necessary
  but not sufficient: `focus:outline-none` compiles to `(0,2,0)` and still outranks it. The
  three sites using that form were audited individually; the one with only a border-colour
  fallback was fixed.

`Sheet.tsx` was deleted rather than repaired. It had zero imports, zero test references, three
dead animation classes, a `<div onClick>` trigger and no dialog semantics; `UI-AUDIT-1`
classified it DELETE.

## Next gate after closure

`UI-SYSTEM-2`
