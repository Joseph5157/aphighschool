# UI Active Gate

## Active gate

`UI-PERF-1`

## Status

CLOSED

## Purpose

Optimize images and frontend performance, per `UI_SYSTEM_MASTER_PLAN.md` Phase 13: size,
dimensions, responsive delivery, lazy loading, layout shift, unused assets, and unnecessary
frontend weight.

## Scope boundary

Frontend performance only — no visual redesign, no information-architecture change. Two
checklist items (`UI_AUDIT.md` rows 5 and 20 — image compression, image dimensions/layout
shift) were already confirmed not applicable at `UI-AUDIT-1` and are re-confirmed, not
re-litigated, below. The gate's actual work is the two items the audit did not already close:
unused assets and unnecessary frontend weight.

## What was found and fixed

### 1. `category/[slug]/page.tsx` — unbounded, unselected posts query (primary finding)

The category detail page's Prisma query for its posts list carried no `take` (unbounded — a
category's document count only grows over the life of a "living document portal") and no
`select` (fetching every `Post` column, including `content` — "Full structured content /
tables / guides," `prisma/schema.prisma` line 90 — for every published post in the category,
on every view). `CategoryLogList`, the sole consumer, only reads 14 named fields (id, slug,
titleEn, titleTe, summaryTe, englishAbstract, statusBadge, documentType, orderState,
verifiedAgainstGoir, goReference, actionDeadline, createdAt, documentDate, tags) — it never
renders `content`, `pdfUrl`, `actionUrl`, `sourceUrl`, `sourceDept`, `effectiveDate`,
`categoryId`, or `updatedAt`. This is the "unnecessary frontend weight" checklist item
concretely: the full document body of every post in a category was being pulled from
Postgres and embedded in the page's RSC serialization payload, unbounded, for a view that
never displays document bodies.

**Fix.** Added an explicit `select` on the `posts` relation listing exactly the 14 fields
`CategoryLogList`'s `PostItem` type declares. The `take`/pagination question (the query is
still otherwise unbounded — `CategoryLogList` already does client-side "Load More" over the
fetched set) was deliberately left alone: bounding the query itself would change what a user
can eventually reach without a UI decision this gate isn't scoped to make, whereas the field
list is a pure payload-weight fix with no behavior change — every field the page actually
uses is still fetched, in full, for every post.

### 2. Home page — dead `relatedFrom` fetch, unselected top-level fields

`app/(public)/page.tsx`'s `homepage-feed` query (`take: 6`, correctly bounded) had no
top-level `select` (same `content`-and-friends over-fetch as above, on 6 posts instead of an
unbounded set) and additionally fetched `relatedFrom: { include: { relatedPost: true } }` —
each of the 6 posts' full set of related-order links, with each linked post's own full row
(its `content` included) nested inside. Neither `HeroCard` nor `PostCard`, the two components
that render this data, reads `relatedFrom` at all: `HeroCard`'s prop type declares a narrow
`relatedFrom?: Array<{ relatedPost: { titleEn; goReference } }>` shape but never uses it in
JSX, and `PostCard`'s prop type doesn't mention it at all. This was a 100%-dead nested fetch —
not merely over-selected, but entirely unconsumed.

**Fix.** Removed the `relatedFrom` include from the homepage query (nothing renders it) and
added an explicit top-level `select` covering exactly what `HeroCard`/`PostCard` read (id,
slug, titleEn, titleTe, summaryTe, englishAbstract, statusBadge, documentType, orderState,
goReference, sourceDept, verifiedAgainstGoir, createdAt, documentDate, plus a
`category: { select: { nameEn, slug, color, icon } }`). The post detail page's own,
similarly-shaped `relatedFrom` fetch (`posts/[slug]/page.tsx`) was checked and left alone —
it is genuinely rendered (`DocumentTemplate` shows each related order's title/reference/date)
and already `select`s only the fields it needs on `relatedPost`, so it was already correct.

### Everything else in "frontend weight" checked and found already correct

- `orders/page.tsx` and the rest of `posts/[slug]/page.tsx`'s supplementary queries
  (siblings, prev/next, "latest news" stack) already use `take` and `select` correctly —
  these two pages were the outliers against the codebase's own established pattern, not
  representative of it.
- `lib/posts/query.ts` (search, recent-documents, tag-availability queries) already `select`s
  narrowly and caps `take` (100 for search results, 6 for recent documents).
- No `<img>`, `next/image`, or `<Image>` usage exists anywhere under `app/` (re-confirmed via
  grep, matching `UI_AUDIT.md` row 5's original finding) — nothing to compress, resize, or
  lazy-load. `public/` holds only `.gitkeep`.
- Fonts (`Space_Grotesk`, `Noto_Sans_Telugu`, `IBM_Plex_Mono`) are already self-hosted via
  `next/font/google` with `display: "swap"`, per-language subsetting (Telugu font only loads
  the Telugu subset), and a closed weight list — no external font request, no FOUT-driven
  layout shift beyond what `swap` already declares as an accepted tradeoff.
- Tailwind's compiled, minified stylesheet is 61 KB uncompressed / ~10.5 KB gzipped for the
  entire app (`npx tailwindcss` output, verified via a real `next build`) — correctly purged
  against `content: ["./app/**/*.{js,ts,jsx,tsx}"]`, nothing to trim.
- `next-auth`'s client-side `SessionProvider`/`useSession` usage is already confined to
  `app/admin` (`app/providers.tsx` is only imported by `app/admin/layout.tsx`); public routes'
  shared JS bundle (87.3 kB, verified via `next build`'s own size report) carries none of it.
  `middleware.ts`'s matcher is already scoped to `/admin/((?!login).*)`, so it does not run on
  public-route requests at all.
- No route's First Load JS exceeds 113 kB (`/tools/tax-calculator`, the single largest page,
  legitimately owns its size — tax-slab constants and calculator logic, not bloat); every
  client-interactive surface (calculators, dialogs, filter tabs) is already page-scoped by
  Next.js's own automatic per-route code splitting, so there was no candidate for `next/
  dynamic` lazy-loading that would meaningfully change what ships to a first-time visitor.

### Unused assets — found, recorded, deliberately not deleted

`app/(public)/_components/Pagination.tsx` (a full, tested, DESIGN_SYSTEM-compliant
pagination primitive — `PaginationNav`/`Content`/`Item`/`Link`/`Previous`/`Next`/`Ellipsis`
plus a high-level `Pagination` helper) has zero import call sites anywhere in `app/`, confirmed
by grep. `UI-PATTERNS-1`'s own outcome summary already recorded this ("Still zero consumers.
No usage invented."), and `UI-AUDIT-1` flagged the same file for a separate, since-fixed
defect (the retired `accent` token, F3). Because nothing imports it, it contributes **zero
bytes** to any shipped bundle — Next.js's build already tree-shakes it away, so it is not an
instance of the "unnecessary frontend weight" this gate's other two fixes address. It is
recorded here as the "unused assets" checklist item's answer rather than silently ignored, but
left in place rather than deleted: it is a real, working, tested primitive kept in reserve for
whenever a route needs true multi-page pagination (every current list surface uses
client-side "Load More" instead), and deleting a harmless, zero-cost, already-reviewed
component is a product/architecture call this gate's scope (frontend *performance*) doesn't
license on its own.

## Closed as not applicable (re-confirmed, not re-decided)

- **Image compression, dimensions, responsive delivery, lazy loading, layout shift**
  (`UI_AUDIT.md` rows 5 and 20) — no images exist anywhere in the app (`public/` holds only
  `.gitkeep`; no `<img>`/`next/image`/`<Image>` usage under `app/`), re-confirmed by grep this
  gate. Nothing to optimize.

## Verification

- `npx tsc --noEmit` passes (the new `select` shapes type-check exactly against `HeroCard`'s,
  `PostCard`'s, and `CategoryLogList`'s existing prop types — no `as any`, no prop-type
  changes needed on the consuming side).
- Full Vitest suite: 63 files, 426 tests pass (up from 424 — `test/query-weight.test.ts` is
  new, 2 tests; `test/draft-leaks.test.ts` had its homepage-`relatedFrom` guard rewritten to
  match the fix, net test count in that file unchanged).
- **Mutation-tested.** `git stash`d both fixes, re-ran the two new/changed guards against the
  pre-fix source: both failed as expected (missing `select` on the category query, missing
  `select` and still-present `relatedFrom` on the home query). Restored via `git stash pop`
  and re-ran clean.
- `git diff --check` clean.
- A full `next build` succeeds; bundle-size report is unchanged from before this gate (these
  are server-side data-fetching changes — Prisma `select` shape does not affect client JS
  bundle size, only per-request payload weight, which the build's static size table doesn't
  capture for dynamic routes). A `next start` + `curl` smoke pass against `/`, `/orders`, and
  an invalid `/category/[slug]` confirmed all three render without a 500 or any error-boundary
  text, and that the home page's hero card renders correctly with the trimmed field set.

## Next gate after closure

`UI-A11Y-1` (Phase 14, per `UI_SYSTEM_MASTER_PLAN.md`'s sequential roadmap — no explicit
instruction overrode it this gate).
