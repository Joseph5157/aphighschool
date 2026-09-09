# UI Active Gate

## Active gate

`UI-SEO-1`

## Status

CLOSED

## Purpose

Fix page titles, meta descriptions, favicon, and appropriate metadata, canonical, and social
metadata where justified, per `UI_SYSTEM_MASTER_PLAN.md` Phase 10.

## Scope boundary

`app/(public)` only, plus the root-level special files (`app/icon.svg`, `app/robots.ts`,
`app/sitemap.ts`) that are inherently site-wide concerns and were entirely absent. `app/admin`
was not given its own metadata; it is kept out of search results via `robots.ts`'s
`Disallow: /admin` instead, which needed no admin-route changes.

## Product constraint for this gate

The founder set an explicit rule before work started: **titles and descriptions must describe
the page factually — never write promotional "sell" copy.** Applied throughout: evaluative
words removed from descriptions (`"Comprehensive guidance"` → `"Guidance"`, `"100% client-side
privacy-first"` → `"100% client-side"`, `"Interactive AP RPS 2022..."` → `"AP RPS 2022..."`,
`"Browse AP School Education documents..."` → `"AP School Education documents..."`), while
factual attributes that happen to be positive (free, 100% client-side, verified against GOIR)
were kept because they are true and load-bearing, not because they sell.

## Findings closed

| Finding | Disposition | Evidence |
|---|---|---|
| `UI_AUDIT.md` F23 — title template is inert (`template: "%s"` does nothing; all 18 routes hand-appended `— AP Teacher Desk` themselves) | **FIXED** — `app/(public)/layout.tsx`'s template is now `"%s — AP Teacher Desk"`; every route's own title is bare. **Exception, found this gate:** a `page.tsx` in the *same segment folder* as the `layout.tsx` that defines the template — i.e. only the home page — does not receive the template (documented Next.js behaviour: a template formats descendant routes, not its own segment's page), so the home page alone still spells out the full title explicitly. | Verified by an actual `next build` + `next start` + `curl`, not just source reading — see Verification below. |
| `UI_AUDIT.md` F24 — three titles exceeded ~60 chars even bare (`/tools/cfms-checker` 75→52, `/tools/leave-encashment` 73→59, `/pensioners/office-pipeline` 69→59, all totals with the template suffix) | **FIXED** — shortened to fit, reusing phrasing already established elsewhere in the app (e.g. `tools/page.tsx`'s own card title for CFMS) rather than inventing new copy. | Manual length check across all 18 routes; `curl`-verified rendered `<title>`. |
| Three meta descriptions also exceeded ~160 chars (not named by the audit, found applying the same standard the title-length finding used) — `/pensioners/office-pipeline` 181, `/pensioners` 189, `/tools/da-arrears` 177 | **FIXED** — trimmed while keeping every fact; no content removed, only redundant phrasing. | Manual length check. |
| Home page missing its own description (checklist item 2 — "mostly done... home route omits its own description") | **FIXED** — added, plus a canonical. | `curl` of rendered `<meta name="description">`. |
| `UI_AUDIT.md` F9 — `NEXT_PUBLIC_SITE_URL` fell back to `localhost:3000` silently in two independent places (`app/(public)/layout.tsx`, `Breadcrumb.tsx`'s JSON-LD) | **FIXED** — both now call one `lib/site.ts` `getSiteUrl()`, which still falls back locally (correct for dev) but `console.error`s if the fallback fires in `NODE_ENV=production`, so a missing env var in a real deploy is loud instead of silently publishing localhost URLs into SEO metadata and structured data. | Code review; not a blocking build gate, per `AGENTS.md`'s standing rule against turning checks into hard blockers. |
| Checklist item 3 — no favicon anywhere | **FIXED** — `app/icon.svg`, a static hand-written SVG reusing the exact existing masthead-navy (`#1B2A4A`) / turmeric (`#E8A33D`) "AP" monogram already used for the site header's badge. No new branding invented. | `curl`-verified `<link rel="icon">` and a direct fetch (200, `image/svg+xml`). **Note:** a `next/og`-based `ImageResponse` route was tried first and abandoned — it hit a Windows-specific `fileURLToPath`/`Invalid URL` crash in `@vercel/og`'s default font loader during `next build`'s static-export prerender step, caught only because this gate actually ran a production build rather than trusting `tsc`. |
| No canonical anywhere | **FIXED** — `alternates.canonical` added to all 18 routes. `/search` canonicalizes to the bare `/search` (every `?q=`/`?type=`/`?tag=` variant is the same page). | `curl`-verified `<link rel="canonical">` on static, dynamic, and query-bearing routes. |
| No OpenGraph/Twitter metadata anywhere | **FIXED, minimally** — `type`, `siteName`, `locale` (OG) and `card: "summary"` (Twitter, no image exists to justify `summary_large_image`) set once at the layout. **Deliberately no `openGraph.title`/`description` there** — an early version set them explicitly and every route's social preview showed the same site-wide default instead of its own title, because a plain per-route `title` string does not "fall through" into an `openGraph` object once an ancestor has defined one. Leaving `openGraph`/`twitter` without their own title/description is what lets Next's built-in fallback (uses the resolved page title/description) work per-route. | `curl`-verified `og:title`/`twitter:title` differ per route and match that route's own `<title>`. |
| No robots/sitemap | **FIXED** — `app/robots.ts` (allows all, disallows `/admin` and `/api`), `app/sitemap.ts` (static routes + live categories + live published posts, degrades to static-only on a DB failure rather than 500ing). | `curl`-verified `/robots.txt` and `/sitemap.xml` render real content against the live dev database. |

## Two defects found and fixed outside the original audit

- **"Offline Ready" was an unsupported claim.** Appeared in the sidebar footer and
  `DesktopSidebar`'s calculator widget with no service worker, manifest, or cache strategy
  anywhere in the repository to back it — the identical "nothing may be invented" defect
  shape as `UI-CONTENT-1`'s WhatsApp banner (F16), just missed by that gate's audit. Fixed to
  state only what's true (calculators run client-side; the site itself is not offline-capable).
  New repo-wide guard: `test/no-offline-claim.test.ts`.
- **`DesktopSidebar`'s "Quick Searches" widget had the exact F30 shape `UI-CONTENT-1` fixed
  elsewhere**, missed because it lives in a component that gate's audit didn't inspect: five
  hardcoded `/search?q=` chips (one, `#PRC2024`, carrying a stale year no longer accurate) that
  could lead nowhere, alongside three accurate static tool-page links. Fixed the same way as
  `UI-CONTENT-1`'s `SearchUI`/`TopicTagBar` chips — verified server-side against real content
  (reusing `lib/posts/query.ts`'s `quickSearchChips`) before render, with the static tool links
  (always accurate, not content-availability claims) left untouched. New tests:
  `test/desktop-sidebar.test.tsx`.
- **`/category/[slug]`'s title doubled "Orders"** for the "Government Orders" category
  specifically (`${category.nameEn} Orders` → "Government Orders Orders"), found by actually
  curling a real category page rather than trusting the source. Fixed to skip the append when
  the category name already ends with "Orders". New test: `test/category-metadata.test.ts`.
- **Two `generateMetadata` catch-block fallbacks hand-duplicated `"AP Teacher Desk"`** as a
  literal string a third time in the same file that also had it in the not-found branch and the
  file's normal-path title. Both (`posts/[slug]`, `category/[slug]`) now return `{}` on error,
  correctly inheriting the layout's own default title/description instead.

## Verification

Reading source was not enough to trust this gate — F9/F23's original audit note says so
explicitly, and this gate confirmed why: the OpenGraph/title-template interactions above are
not deducible from Next.js's public docs skimmed casually, and the favicon approach that looked
right in source (`next/og`) silently crashed only at actual build time. This gate ran:

```
npx prisma generate && npx next build   # confirms every route, including /icon.svg,
                                          # /robots.txt, /sitemap.xml, actually compiles
                                          # and prerenders
npx next start -p <port>                 # then curl'd rendered <title>, <meta description>,
                                          # <link rel=canonical>, og:*, twitter:*, robots meta,
                                          # and the favicon link/content-type across the home
                                          # page, several static routes, a dynamic post, and a
                                          # dynamic category — not just one representative route
```

This is what caught the `next/og` Windows crash, the home-page template-adjacency gap, the
OpenGraph per-route fallback regression from an earlier iteration of this gate's own change, and
the stale server process serving a pre-rebuild `.next` output that made the first two rounds of
`curl` verification silently lie. All four were invisible to `tsc`/`vitest`.

## Required closure evidence

- Starting worktree clean at `5e8a18a` (`UI-CONTENT-1` closure SHA), local and remote in
  agreement.
- Full Vitest suite: 58 files, 410 tests pass (up from 402 — 8 new tests: `test/no-offline-
  claim.test.ts` (1), `test/desktop-sidebar.test.tsx` (3), `test/category-metadata.test.ts`
  (4)). `npx tsc --noEmit` passes. `git diff --check` clean (CRLF-normalization notices only).
- A full `next build` succeeds (see Verification) — the first time a UI-program gate has
  exercised the actual production build rather than `tsc`/`vitest` alone, and it caught a real
  defect neither of those could have.
- Every new/changed guard mutation-tested: reverting the PRC-preserving... (carried from
  `UI-CONTENT-1`, not repeated here) — this gate's own mutations: the `DesktopSidebar` "Quick
  Searches" conditional, and the category-title double-"Orders" fix. Both caught, zero
  survivors.

## Next gate after closure

`UI-LINKS-1`
