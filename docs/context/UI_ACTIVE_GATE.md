# UI Active Gate

## Active gate

`UI-SYSTEM-2`

## Status

CLOSED

## Purpose

Standardise the reusable UI primitives the application actually uses, on the foundations
`UI-SYSTEM-1` established, and close the primitive-level defects carried forward from it.

## Change boundary

In scope: shared primitives in `app/(public)/_components`, and the call sites that had to
change to adopt them. Out of scope and untouched: page redesign, information architecture,
responsive-layout repair (`UI-RESPONSIVE-1`), and the sidebar drawer's own behaviour
(`UI-MOBILE-NAV-1`).

New primitives were created only where a real consumer already existed. Five were
deliberately not built; `docs/ui/DESIGN_SYSTEM.md` §15 records each with the condition that
would justify it.

## Required closure evidence

- Starting worktree clean on `ui-system-production-readiness` at
  `4e1881a41367db2c31b6ce4fb2fbc9117e41c2ee`, local and live remote in agreement.
- Every carried-forward item from `UI-SYSTEM-1` is closed or explicitly re-carried with a
  named owning gate.
- New behaviour is mutation-tested: removing Escape handling, removing the focus trap, and
  reverting `Field`'s cloning each fail their guard with an on-topic message.
- Full Vitest suite passes: 46 files, 318 tests, including the DB-backed trust suites and
  `dark-mode`.
- `npx tsc --noEmit` passes, Tailwind utility validation passes, `git diff --check` clean.
- Committed, pushed, and local branch HEAD matches the live remote branch SHA.

## Closure notes

**The integration test earned its place.** A unit test proving `Field` associates its parts
passed while five inputs in `TaxCalculatorUI` were still unlabelled — they bypass `Field`
entirely. Rendering the real screen and asserting that *every* input has an accessible name
found them: four in the quarterly TDS grid, whose only labels were a sibling header row of
`<div>`s, and one label/control pair with nothing linking them. Testing the mechanism is not
the same as testing the screen.

**A superseded guard was removed, not left to rot.** `test/a11y.test.ts`'s file-level
focus-outline check failed on `Textarea.tsx` — for a *comment explaining the defect*. It was
already strictly weaker than `test/focus-visible.test.ts` (per-file rather than per-element,
and blind to the bare `outline-none` that caused the original P0). Keeping a guard that
cries wolf teaches people to ignore guards, so it was deleted with the reasoning recorded in
place.

**`Sheet.tsx` left a real gap.** Its deletion in `UI-SYSTEM-1` was correct — zero imports,
`<div onClick>` trigger, no dialog semantics — but the product still had one hand-rolled
modal in the admin form with the same failings. `Dialog` was written to §8.5 rather than
restored from the component that had already failed those rules.

**21st.dev was not available** in this environment, so the external-component rule was never
exercised. No external component was imported, and no second visual language was introduced.

## Next gate after closure

`UI-RESPONSIVE-1`
