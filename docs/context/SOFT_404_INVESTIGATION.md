# SOFT-404-1 — production investigation record

## Scope and baseline

- Baseline: `e8ba8229b7ec8c95783050a369498d9d5e070a9c`
- Next.js: `14.2.35` (pinned in `package.json` and lockfile)
- Scope: investigation only; no application behavior changed.

## Production reproduction

`npx next build` completed successfully, then `npx next start -p 3017` was
inspected with direct HTTP requests and Chromium.

| Route | HTTP | HTML robots | Rendered result |
|---|---:|---|---|
| `/posts/go-129-district-allocation-2026` | 200 | `index, follow` | valid document |
| `/posts/soft-404-investigation-missing` | 200 | `index, follow` and `noindex` | custom not-found UI |
| `/category/govt-orders` | 200 | `index, follow` | valid category |
| `/category/soft-404-investigation-missing` | 200 | `index, follow` and `noindex` | custom not-found UI |
| `/soft-404-investigation-missing` | 404 | `noindex` and `noindex, follow` | root custom not-found UI |

All responses were `text/html; charset=utf-8` and carried the expected Next.js
`Vary` header. Invalid dynamic routes were cache misses with the route's ISR
`s-maxage=3600, stale-while-revalidate` policy; the unmatched static route was
`private, no-cache, no-store, max-age=0, must-revalidate`.

Chromium confirmed the same 200/404 response status matrix and no console errors
for valid or invalid dynamic routes. The two invalid dynamic routes had the
normal `index, follow` directive plus two rendered `noindex` tags after
hydration. The unmatched static route returned 404 and rendered only noindex
directives (duplicated, but not semantically conflicting).

## Call sites and metadata

- `app/(public)/posts/[slug]/page.tsx` calls `notFound()` after its published-only
  `prisma.post.findFirst` query returns no row. `generateMetadata()` independently
  queries the same published-only record and returns only `title: "Order Not Found"`
  for absence; it neither calls `notFound()` nor supplies `robots`.
- `app/(public)/category/[slug]/page.tsx` calls `notFound()` after its category
  `findUnique` query returns no row. Its metadata function similarly returns only
  `title: "Category Not Found"` for absence.
- `app/(public)/layout.tsx` supplies inherited `robots: { index: true, follow: true }`.
  `app/(public)/not-found.tsx` supplies noindex metadata. Next additionally injects
  noindex when `notFound()` is caught. The inherited layout directive has already
  entered the stream, so the final document has both index and noindex directives.
  `generateMetadata()` contributes the misleading title but is not the origin of
  the conflicting robots policy.

## Root cause

Each affected segment has a sibling `loading.tsx`:

- `app/(public)/posts/[slug]/loading.tsx`
- `app/(public)/category/[slug]/loading.tsx`

In the App Router, Next's `loading.js` convention automatically wraps the page
and descendants in a Suspense boundary. The public layout and loading fallback
can stream before the page's database query completes. When the query then calls
`notFound()`, Next renders the correct not-found boundary but cannot replace the
already-sent HTTP 200 status or inherited head tags.

This is framework-defined streamed-response behavior, not an application query,
draft-protection, static-params, or custom-not-found visual defect. It is present
in production `next start`, not only dev. The official Next.js 14 streaming guide
states that streaming responses use 200 because headers have already been sent,
and that `loading.js` automatically creates the Suspense boundary:

- https://nextjs.org/docs/14/app/building-your-application/routing/loading-ui-and-streaming

The behavior is also reproduced in a Next.js issue across 14.2 and later canary
versions; an upgrade is therefore not a reliable correction by itself:

- https://github.com/vercel/next.js/issues/93239

## Fix paths

### 1. Remove the dynamic-segment `loading.tsx` boundaries

- Real 404: expected for `notFound()` once the response is non-streamed.
- Robots: unambiguous if the normal layout metadata is prevented from surviving
  the not-found response; verify in production before adoption.
- Static generation: preserves existing `generateStaticParams` and ISR.
- Queries/drafts: unchanged; the current `isDraft: false` post predicate remains
  the authoritative public visibility boundary.
- SEO: correct HTTP status; loses immediate loading UX for these segments.
- Risk/complexity: low code complexity, material mobile/perceived-performance
  trade-off and requires rendered loading-state acceptance.

### 2. Preflight existence in middleware/proxy, then return 404 before rendering

- Real 404: yes, because the response is decided before App Router streaming.
- Robots: unambiguous for the intercepted response; the normal page metadata
  never starts.
- Static generation: must bypass known generated paths and retain ISR behavior;
  cache interaction needs explicit design.
- Queries/drafts: duplicates existence work and must use the same `isDraft: false`
  predicate as the page, otherwise it can disclose draft existence or incorrectly
  reject a published document.
- SEO: strongest HTTP result while retaining loading UX on valid routes.
- Risk/complexity: medium-high. Edge middleware cannot use Prisma directly;
  a secure compatible data-access endpoint/cache or a Node-capable proxy design
  would be required. This is not a safe quick patch.

### 3. Upgrade Next.js without architectural change

- Real 404: not established. The cited official issue reports the same behavior
  on later canary versions.
- Robots: not established.
- Static generation, queries, drafts, SEO: unchanged only if behavior happens to
  remain compatible.
- Risk/complexity: high upgrade surface with no demonstrated benefit for this
  defect; not recommended as the primary fix.

### 4. Metadata-only change, redirect/rewrite, or a catch-all page

- Real 404: metadata cannot alter a committed status; redirect/rewrite/catch-all
  routes do not provide a trustworthy native 404 by themselves.
- Robots: metadata can reduce the conflicting head tags but cannot correct the
  soft-404 HTTP status; it is not a complete fix.
- Risk/complexity: low to medium but inadequate, and a catch-all can widen routing
  or obscure the restrained not-found design.

## Recommended next gate

`SOFT-404-2` should choose between the product trade-off in option 1 and a fully
designed preflight architecture in option 2. Do not upgrade Next.js as a fix
attempt. Before implementation, require production status/head verification for
both post and category routes, valid-route metadata regression checks, and an
explicit draft-visibility review.
