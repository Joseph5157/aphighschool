# UI Active Gate

## Active gate

`UI-STATES-1`

## Status

CLOSED

## Purpose

Add deliberate loading, empty, error and success states only where the product genuinely
needs them, and standardise the empty-state markup that had been hand-written at every call
site since before this program started.

## Scope boundary

`app/(public)` only, consistent with `UI-AUDIT-1`'s scope note that `app/admin` is out of this
program's scope except where it shares a primitive with the public UI. The public surface's
only mutation-adjacent action is `window.print()` (browser-confirmed, already closed as N/A by
`UI-AUDIT-1`); admin's real mutations (`createPost`/`updatePost`/`deletePost`/`publishPost`) are
not addressed here.

## Route/workflow classification

| Route | Loading | Empty | Error | Success |
|---|---|---|---|---|
| `/` (home feed) | **IMPLEMENTED** — `app/(public)/loading.tsx`; static rails (`DesktopLeftNav`/`DesktopSidebar`) render immediately, only the hero+feed column skeletons | **IMPLEMENTED** — `EmptyState` replaces the ad hoc "No published posts found" div | ALREADY ADEQUATE — `safeQuery` throws to `app/(public)/error.tsx` | NOT APPLICABLE — read-only |
| `/orders` | **IMPLEMENTED** — `orders/loading.tsx`; static `OrdersSidebar` renders immediately | **IMPLEMENTED** — Recent Documents strip now shows an `EmptyState` instead of silently disappearing; both `OrdersFilterTabs` ad hoc empty texts standardised | ALREADY ADEQUATE | NOT APPLICABLE |
| `/category/[slug]` | **IMPLEMENTED** — `category/[slug]/loading.tsx` | **IMPLEMENTED** — `CategoryLogList`'s filtered-empty state (which a genuinely empty category also hits) standardised onto `EmptyState` | ALREADY ADEQUATE — `notFound()` preserved | NOT APPLICABLE |
| `/posts/[slug]` | **IMPLEMENTED** — `posts/[slug]/loading.tsx` | ALREADY ADEQUATE — `PostNavCards`/`CategoryStacksGrid` silently omit themselves when empty, the same decorative-surface precedent as `UpcomingActionDates`; nothing was invented to fill the gap | ALREADY ADEQUATE — `notFound()` preserved | NOT APPLICABLE |
| `/search` | **IMPLEMENTED** — `search/loading.tsx` covers the initial navigation; the debounced same-route query updates now wrap `router.push` in `startTransition` (so React keeps the stale results on screen instead of falling back to that skeleton on every keystroke) and `SearchUI` shows its own inline "Searching…" affordance — closes the audit-flagged "400ms debounce, no pending affordance at all" gap | **IMPLEMENTED** — no-matches state gained a next step and a link to `/orders`; "Recent Documents" now shows "No recent documents yet." instead of vanishing | ALREADY ADEQUATE | NOT APPLICABLE |
| `/topics`, `/service-desk`, `/tools`, `/tools/*`, `/pensioners`, `/pensioners/*` | NOT APPLICABLE — no route in this set queries Prisma (confirmed by grep this gate); calculators compute synchronously client-side | NOT APPLICABLE — no dataset that can be empty | NOT APPLICABLE — nothing here can fail; the calculators are permissive by design (blank input reads as 0 rather than being rejected) | NOT APPLICABLE — `window.print()` only, already closed by `UI-AUDIT-1` |
| Calculator "invalid input" (all tools/pensioners forms) | — | — | **DEFERRED WITH REASON** — no calculator currently enforces required or range-valid input; every one accepts and computes with whatever is typed. Building a validation-error UI now would invent a rejection behaviour the product doesn't have. Revisit if/when a calculator gains real input constraints. | — |

## New shared primitives

| Primitive | Why | Real consumers |
|---|---|---|
| `Skeleton` | `UI-SYSTEM-2` deliberately withheld this pending "a route that introduces `loading.tsx`" — this gate is that condition | The five `loading.tsx` files above |
| `EmptyState` | Five call sites (`page.tsx`, `CategoryLogList`, `OrdersFilterTabs` ×2, `SearchUI` ×2, `orders/page.tsx`) had each hand-written their own bordered "nothing here" div — the exact duplicate-pattern shape `UI-PATTERNS-1` merged elsewhere in the product | All of the above; `compact` variant for the two in-card instances in `OrdersFilterTabs` |

`Toast` was **not** built: the public surface still has no async flow that reports success or
failure (confirmed again this gate — `window.print()` remains the only action, and it is
browser-confirmed). Its condition in `DESIGN_SYSTEM.md` §15 is unmet.

## Required closure evidence

- Starting worktree clean at `3714ea4c0e333171ae5b3256a0dfb443b66cc38f` (`UI-PATTERNS-1`
  closure SHA), local and remote in agreement.
- Full Vitest suite: 50 files, 389 tests pass (up from 365 — 22 new tests: `test/states.test.tsx`
  plus 3 added to `test/search-ui.test.tsx`). `npx tsc --noEmit` passes. Tailwind utility
  validation passes (`test/tailwind-classes.test.ts`, plus a manual compile-and-grep spot check
  for `animate-pulse`). `git diff --check` clean.
- Eight mutations run against the new/changed guards; **all eight caught, zero survivors**:
  `role="status"` removed from `EmptyState` and from the home `loading.tsx` (2), `CategoryLogList`'s
  empty branch reverted to placeholder text (1 test file, 2 assertions caught it), `SearchUI`'s
  `isSearching` derivation hardcoded to `false` (1), `OrdersFilterTabs`'s per-category empty state
  reverted (1), the home page's `EmptyState` branch reverted (1).

## Closure notes

**The debounced search pending-state needed real design, not just a component.** The obvious
fix — a `search/loading.tsx` skeleton — would have fired on every keystroke's `router.push`
(a searchParams-only navigation still re-invokes the page's Server Component and hits the
nearest `loading.tsx`), blanking the input mid-type. The actual fix wraps the debounced
`router.push` calls in `startTransition`, which keeps the previous results mounted and lets
`SearchUI` own an inline, reliably testable pending affordance instead
(`value.trim() !== query.trim()` — derived from props already flowing through the component,
not a second piece of state to keep in sync with a completion signal `router.push` doesn't
provide). `search/loading.tsx` still exists and still covers the one case `startTransition`
doesn't: a fresh hard navigation into the route.

**Decorative-surface empty states were left alone on purpose.** `PostNavCards` and
`CategoryStacksGrid` on `/posts/[slug]` already return `null` when they have nothing to show —
the same pattern `UpcomingActionDates` established on the home page and that `lib/db-safe.ts`'s
`optionalQuery` doc comment names as the correct contract for a decorative surface: "an empty
fallback here degrades the page without misinforming anyone." Converting these to a visible
`EmptyState` would have been adding UI weight to a bonus surface that already fails gracefully,
against `DESIGN.md`'s restraint rule. The four **content-carrying** "recent documents" listings
(orders index, search discovery) were treated differently and given a visible empty state,
because they are what those sections exist to show, not a bonus alongside it.

**Two ad hoc empty-state divs per route, before this gate.** Home, `CategoryLogList`,
`OrdersFilterTabs` (×2) and `SearchUI` (×2) each hand-wrote a bordered centred panel with
slightly different markup — `EmptyState`'s `compact` variant exists because two of those seven
sit inside a card/grid cell where the full block would be visually heavier than the thing it
replaced.

**Admin was not touched.** `app/admin`'s real mutations already have no toast/success layer, but
per `UI-AUDIT-1`'s scope note this program has not touched `app/admin` except where it shares a
primitive with the public UI, and this gate did not change that. Recorded rather than silently
skipped.

## Next gate after closure

`UI-CONTENT-1`
