# UI Active Gate

## Active gate

`UI-PATTERNS-1`

## Status

CLOSED

## Purpose

Standardise repeated application-level patterns, resolve the tinted-callout semantic model,
and put the trust-bearing rules into shared components rather than conventions.

## Pattern dispositions

| Pattern | Decision | Reasoning |
|---|---|---|
| Post/document templates | **MERGE** | `GoMemoTemplate` and `NotificationTemplate` were 95% the same file. Now one `DocumentTemplate`; the three genuine differences survive as data. |
| GOIR presentation | **MERGE** | 10 call sites re-derived the same guarded badge. `GoirBadge` makes the "no unverified state" rule unexpressible. |
| Date presentation | **MERGE** | 10 call sites re-assembled label + date by hand. `DocumentDate` makes them inseparable. |
| Tinted callouts | **MERGE + REPLACE the model** | One `Callout` with meaning-named tones. Colour is no longer the API. |
| Filter/tab strips | **KEEP both** | They solve different problems: `OrdersFilterTabs` switches between panels of categories; `CategoryLogList` filters one list in place with a roving-tabindex strip. Merging would force one into the other's shape. |
| PageHeader | **REFINE — deferred** | See below. |
| Breadcrumbs | **KEEP** | Already a shared primitive; its only duplication was the trail built twice in the two templates, which the merge removed. |
| Search/list result cards | **KEEP** | `PostCard`, `HeroCard`, the category log row and the search result are surface-specific by design. Their *metadata* is now standardised through `DocumentDate` and `GoirBadge`, which is where the drift risk actually was. |
| `ActionSummary` GOIR row, admin GOIR marker | **KEEP** | Genuinely different presentations — a `FactRow` in a definition list, and an operator marker. Both still guarded by the recorded boolean with no unverified branch. |
| Pagination | **DEFER** | Still zero consumers. Not adopted, and no usage invented for it. |

### Why PageHeader was deferred

Four pages carry a masthead hero in **two different shapes**: `service-desk` and `topics`
share one (a `<section>` with a turmeric wash and a `max-w-3xl` content column), `tools` and
`pensioners` share another (a `<div>` with a badge row and no wash). They differ in element,
border opacity, spacing, content width and the wash.

Merging them behind a component would need four or five props to reconcile five differences —
an abstraction shaped by its call sites rather than by the product — and it would freeze the
inconsistency in place while making it look resolved. Picking **one** hero look is a visual
decision, and this gate must not redesign pages. Recorded for `UI-IMPECCABLE-1`, which owns
visual critique; the extraction becomes trivial once one shape is chosen.

## Required closure evidence

- Starting worktree clean at `9988e281326769d90fde36a5a423dc12aa99ddd9`, local and remote in
  agreement.
- Trust semantics verified by behaviour, not only by source text: GOIR conditional in both
  directions, no unverified state reachable, `Issued` vs `Added to portal` preserved, and the
  lifecycle indicator correct for both document kinds.
- Six mutations run against the new tests; **all six caught, zero survivors**.
- Full Vitest suite passes: 49 files, 365 tests. `npx tsc --noEmit` passes, Tailwind utility
  validation passes, `git diff --check` clean.
- Committed, pushed, and local branch HEAD matches the live remote branch SHA.

## Closure notes

**The merge exposed a real lifecycle bug.** `lib/posts/lifecycle.ts` states that an action
deadline is orthogonal to the lifecycle *kind*, and `isLifecycleClosed()` already treats a
passed deadline as closing a document of either kind — but only `NotificationTemplate`
rendered the deadline. A GO that opens an application window was therefore filtered as closed
once its deadline passed while its own page showed no deadline at all. One shell means the
page and the filter now agree. This is the kind of divergence that duplicated templates
produce and that nothing else would have surfaced.

**The callout model found a miscoloured warning.** `GpfApgliUI` told a user their premium was
*below* the required minimum in `tamarind` — the in-force colour — with a ⚠️ emoji doing the
semantic work the colour contradicted. Naming tones by meaning made the contradiction visible.

**My first mutation harness produced six false "survived" results.** Two bugs: the ANSI strip
left the ESC byte so every run parsed as zero failures, and `String.replace` with a string
pattern hits the *first* occurrence — which, in components that document themselves by quoting
their own code, was a doc comment. Both fixed, and the corrected battery caught all six. Worth
recording because a mutation harness that under-reports is worse than none: it manufactures
false confidence in exactly the tests meant to prevent it.

## Next gate after closure

`UI-STATES-1`
