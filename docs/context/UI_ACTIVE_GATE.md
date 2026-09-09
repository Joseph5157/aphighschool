# UI Active Gate

## Active gate

`UI-404-1`

## Status

CLOSED

## Purpose

Add a useful custom not-found/unavailable experience with recovery paths, per
`UI_SYSTEM_MASTER_PLAN.md` Phase 12. `UI_AUDIT.md` F10: no `app/not-found.tsx` existed;
`notFound()` calls in `category/[slug]` and `posts/[slug]` fell through to the unstyled
Next.js default, dropping the user out of the site shell entirely.

## Scope boundary

`app/(public)` plus the root-level `app/not-found.tsx` special file (a site-wide concern,
same category as `UI-SEO-1`'s `icon.svg`/`robots.ts`/`sitemap.ts`). `app/admin` untouched.

## What was built

- `app/(public)/_components/NotFoundContent.tsx` — shared recovery content (bilingual
  English/Telugu message, three recovery links: Home, Browse Orders & Circulars, Search the
  Portal). Written to assume nothing about its wrapper, since it's used in two different
  contexts below.
- `app/(public)/not-found.tsx` — the common case: an explicit `notFound()` from a
  removed/renamed post or category. Lives in the same route group as `app/(public)/layout.tsx`,
  so it renders inside the full public shell (header, nav, footer) automatically.
- `app/not-found.tsx` (root) — a genuinely unmatched URL (typo, stale bookmark), which Next.js
  resolves outside any route group and therefore does **not** wrap in `app/(public)/layout.tsx`.
  Ships its own minimal standalone header (masthead-navy, "AP" monogram, links home) so this
  case doesn't read as an unbranded, broken page.
- `test/not-found.test.tsx` — 4 tests covering both boundaries and the shared content
  component's recovery links and Telugu text.

## Explicit instruction for this gate: no Next.js version change

A pre-existing defect was found while verifying this gate against a real build (see below).
The investigated fix path was a Next.js version upgrade; **the user explicitly directed that
this not happen in this gate**, and that the defect be documented as a known framework/
streaming limitation rather than worked around with an unexplained application change. Both
directives were followed exactly: `next` stays pinned at `14.2.35` (`package.json`
unchanged), and no application code was altered to mask the symptom.

## Known limitation, precisely diagnosed: dynamic-route soft 404

**Symptom.** `posts/[slug]` and `category/[slug]` return **HTTP 200**, not 404, when
`notFound()` fires for a slug that doesn't exist. The custom not-found *content* renders
correctly (right heading, right recovery links) — only the transport-level status code is
wrong. A genuinely unmatched URL (nothing under `app/` matches it at all) is unaffected and
correctly returns 404.

**Diagnosis (this gate, via `next build` + `next start` + `curl`, not source reading).**
Isolated with a minimal reproduction: a trivial `notFound()`-calling page placed in a fresh,
single-route test group returns 404 correctly — even when that test group's `layout.tsx`,
`error.tsx`, and `not-found.tsx` are byte-for-byte copies of the real `app/(public)` versions.
The identical construct, placed inside the real `app/(public)` directory (18 sibling routes,
several using `generateStaticParams`/`revalidate`), returns 200. The following were each
individually tested and **ruled out** as the cause: `revalidate` (ISR), `generateStaticParams`,
`loading.tsx`, `export const dynamic = "force-dynamic"`, and the shared nav components
(`Sidebar`/`BottomNav`/`DesktopNav`, all of which use only `usePathname()`, confirmed present
in the working isolated reproduction too). The cause is therefore not attributable to any
single file or directive found so far — it correlates with the real route group's scale
(many sibling static/dynamic/ISR routes) rather than anything reproducible in isolation, which
matches the shape of several closed, upstream Next.js reports on `notFound()` status codes
under similar ISR/route-count conditions. No further diagnosis or workaround was attempted
past this point, per the explicit instruction above.

**Compounding wrinkle found during closure verification.** On the soft-404 pages specifically,
the rendered `<head>` carries **two conflicting `<meta name="robots">` tags**:
`content="index, follow"` (the site-wide default from `app/(public)/layout.tsx`) *and*
`content="noindex"` (from this gate's `app/(public)/not-found.tsx`). Most crawlers are
documented to honor the more restrictive directive when duplicates conflict, but this is
non-standard markup and not a guaranteed-safe claim — recorded precisely rather than asserted
either way. By contrast, the correctly-404ing root boundary (`app/not-found.tsx`) also emits
two robots tags (`noindex` and `noindex, follow`) but they agree with each other; this looks
like Next.js's own automatic not-found handling adding a bare `noindex` alongside whatever the
route explicitly sets, which is redundant but not contradictory there.

**Follow-up item (dedicated, not silently absorbed into this gate's closure).** Recorded in
`docs/context/UI_CURRENT_STATE.md`'s Known limitations list: *"`/posts/[slug]` and
`/category/[slug]` return HTTP 200 instead of 404 on an unknown slug, and the resulting page
carries two conflicting `robots` meta tags. Root cause isolated to the real `app/(public)`
route group's scale, not any single file (see `UI-404-1`'s diagnosis for the full elimination
list). Not fixed in `UI-404-1` per explicit instruction: no Next.js version change, and no
unexplained application-code workaround. A dedicated investigation (or a deliberate,
explicitly-approved Next.js upgrade) owns resolving this — it is not implicitly any later
gate's job just because it touches `app/(public)`."*

## Closure verification — production build, representative invalid slugs

Run via `next build` + `next start` + `curl -D -` (headers) against real dev data, per
explicit instruction, immediately before closing this gate:

| Case | URL tested | HTTP status | Not-found UI renders | `robots` meta in `<head>` | Recovery links present |
|---|---|---|---|---|---|
| Completely unknown route | `/this-route-genuinely-does-not-exist` | **404** ✅ | Yes — "This page could not be found" + Telugu | `noindex` **and** `noindex, follow` (redundant, not conflicting) | `/`, `/orders`, `/search` ✅ |
| Invalid post slug | `/posts/this-post-does-not-exist-xyz` | **200** ⚠️ (known limitation, see above) | Yes — identical content, full public shell | `index, follow` **and** `noindex` (conflicting — see above) | `/orders`, `/search` ✅ |
| Invalid category slug | `/category/this-category-does-not-exist-xyz` | **200** ⚠️ (known limitation, see above) | Yes — identical content, full public shell | `index, follow` **and** `noindex` (conflicting — see above) | `/orders`, `/search` ✅ |

No claim is made that the dynamic-route cases return a correct resource status — the table
states the actual observed status plainly rather than asserting or implying 404 for them.

## Closure criteria (per explicit instruction) — all met

- [x] Completely unknown routes correctly return HTTP 404.
- [x] Invalid dynamic resources (bad post/category slug) render the intended not-found UI.
- [x] Recovery links are correct on all three cases (`/`, `/orders`, `/search` as applicable).
- [x] No unsupported resource-status claims are made — the 200 cases are stated as 200, not
      implied to be 404, anywhere in code, tests, or these docs.
- [x] The 200 status behavior is precisely documented as a known limitation, with root-cause
      elimination evidence, not silently shipped or silently ignored.

## Required closure evidence

- Starting worktree clean at `ecf2e57` (`UI-LINKS-1` closure SHA), local and remote in
  agreement.
- Full Vitest suite: 62 files, 424 tests pass (up from 420 — 4 new tests in
  `test/not-found.test.tsx`). `npx tsc --noEmit` passes. `git diff --check` clean.
- A full `next build` succeeds; `next start` + `curl` verification performed twice — once
  during initial development, once immediately before closure per the explicit
  instruction — against real dev data, covering a genuinely unmatched URL, an invalid post
  slug, and an invalid category slug. Package.json's `next` version is unchanged
  (`14.2.35`) — confirmed by `git diff package.json` showing no changes.
- All temporary diagnostic routes/layouts created during root-cause isolation
  (`app/diag404test`, `app/(public)/diag404test`, `app/(diag)/*`) were removed before
  closure; `git status` and a repo-wide `find -iname "*diag*"` confirm none remain.

## Next gate after closure

`UI-PERF-1` (per explicit instruction).
