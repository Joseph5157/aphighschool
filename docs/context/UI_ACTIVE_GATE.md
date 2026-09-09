# UI Active Gate

## Active gate

`UI-LINKS-1`

## Status

CLOSED

## Purpose

Audit and fix internal, external, and document links. Implement `mailto:`/`tel:` where
genuine contact information exists, per `UI_SYSTEM_MASTER_PLAN.md` Phase 11.

## Scope boundary

`app/(public)` only. `app/admin` was not touched.

## `mailto:`/`tel:` — no product decision to make, nothing to implement

Per `PRODUCT.md`'s standing open question, no genuine email address or phone number exists
anywhere in the public UI, and `AGENTS.md`/`PRODUCT.md` both forbid inventing one. Re-confirmed
this gate (no new contact surface was added elsewhere in the program since). Recorded as
not-applicable, same disposition `UI-AUDIT-1` gave it, not silently resolved.

## Method

`test/link-crawl.test.ts` already guards internal links written as literal
`href="/path"` JSX attributes against real DB slugs. It does **not** match `href={...}`
dynamic/template-literal hrefs or `href: "..."` object-literal properties (colon, not
equals) — a real coverage gap, not just theoretical: two of this gate's three internal-link
defects were sitting in exactly that blind spot. Every hardcoded external URL was checked
with a live fetch (`WebFetch`, cross-checked with `curl` for DNS/HTTP status — not source
reading, since a URL either resolves or it doesn't, and no amount of code review settles that).

## Findings closed

| Finding | Disposition | Evidence |
|---|---|---|
| **Three external government-portal links pointed at domains that don't resolve at all** — `agap.cas.nic.in` (AG AP pension, `PensionersSidebar`), `agap.ap.nic.in` (AG AP GPF, `CfmsCheckerUI`), `esr.ap.gov.in` (e-SR, `CfmsCheckerUI`) | **Two fixed, one removed.** AG AP's office migrated its whole domain to `agaeap.cag.gov.in` (verified live) — pension and GPF links now point there. No working replacement could be found for e-SR despite AP having relaunched "e-SR 2.0" per a real GO (No. 57, 2026-07-20) — every candidate domain a web search surfaced (`esr.ap.gov.in`, `apesr.apcfss.in`, `ag.ap.nic.in`) also failed to resolve, so the link was removed rather than guessed, per `AGENTS.md`'s "nothing may be invented" rule. | `WebFetch` + `curl` against all three original domains (twice each) and all four candidate replacements; `curl -o /dev/null -w %{http_code}` confirms `000`/DNS failure for the dead ones, `200` for the two `agaeap.cag.gov.in` replacements. |
| Two `http://www.ehs.ap.gov.in` links (should be `https`) | **FIXED** — upgraded to `https`; the `http` variant didn't reliably resolve. | `curl`: `https://www.ehs.ap.gov.in/` → 200; `http://www.ehs.ap.gov.in/` → connection failure. |
| **Every post-detail page's "Category Stacks" widget 404'd on "View More"** — both `categorySlug` values (`ap-teachers-latest-news`, `teachers-softwares`) matched no row in the `Category` table; invisible to `link-crawl.test.ts` because the href is `` `/category/${stack.categorySlug}` `` (template literal, not a literal `href="..."` JSX attribute) | **FIXED** — the second stack now queries the real `tools` category (`slug: "tools"`, confirmed to exist) instead of an invented slug, and is omitted entirely when that category has no other posts. The first stack, which was never category-scoped to begin with, now links to `/orders`, the real "browse everything" hub, instead of a fabricated category. | New DB-backed `test/category-stacks.test.tsx` (4 tests, mutation-tested) + a real `next build`/`curl` pass against live dev data. |
| Same widget: the second stack showed the **same six posts as the first, just `.reverse()`d** — not a real per-category query | **FIXED** — replaced with a genuine `category: { slug: "tools" }` Prisma query. | Same test file. |
| Same widget: a **"NEW" badge assigned by array position** (`iIdx < 3`), not by any actual date — an unverified freshness claim in the same family as `UI-CONTENT-1`'s WhatsApp banner (F16) and `UI-SEO-1`'s "Offline Ready" claim | **Removed** rather than replaced with an invented recency threshold (e.g. "within 7 days") that no product document specifies — the component already had an unused `isNew?: boolean` field suggesting this was meant to be computed from real data and never was; inventing a threshold now would be exactly the kind of guess `AGENTS.md` forbids. | `test/category-stacks.test.tsx` asserts no `>NEW<` in the rendered output; `curl` against live data confirms it too. |
| **A third, previously-unaudited instance of the F30-shaped hardcoded/unverified quick-search-chips defect** — `OrdersSidebar.tsx` (rendered on `/orders`), with the identical five `/search?q=` chips `UI-CONTENT-1`/`UI-SEO-1` already fixed twice elsewhere (`SearchUI`, `TopicTagBar`, `DesktopSidebar`), including the same stale `#PRC2024` label | **FIXED the same way** — verified server-side (`lib/posts/query.ts`'s `quickSearchChips`, reused, not reimplemented) before render; the three static tool-page links (always real, not content-availability claims) render unconditionally. | New `test/orders-sidebar.test.tsx` (3 tests, mutation-tested). |

## Guards added

`test/external-links.test.ts` (3 tests — no known-dead domain, no plain-http `ehs.ap.gov.in`,
the two `agaeap.cag.gov.in` replacements present), `test/category-stacks.test.tsx` (4 tests),
`test/orders-sidebar.test.tsx` (3 tests). The two behavioural fixes (`CategoryStacksGrid`'s
category link, `OrdersSidebar`'s chip filtering) were mutation-tested — reverting either
fails its new test; zero survivors.

## Required closure evidence

- Starting worktree clean at `d92a843` (`UI-SEO-1` closure SHA), local and remote in agreement.
- Full Vitest suite: 61 files, 420 tests pass (up from 410 — 10 new tests). `npx tsc --noEmit`
  passes. `git diff --check` clean (CRLF-normalization notices only).
- A full `next build` + `next start` + `curl` pass against live dev data confirmed: the real
  destination URLs render correctly on `/pensioners` and `/tools/cfms-checker`; the fabricated
  category slugs are gone and `/category/tools`/`/orders` render instead on a real post-detail
  page; the fake "NEW" badge is gone; no dead domain string appears anywhere in rendered output.
- One verification pitfall recorded so a future gate doesn't repeat the time spent on it: a
  raw `curl`+`grep` scan of response *body* text is unreliable for checking element order or
  counting occurrences, because Next.js's App Router embeds the React Server Components
  payload as escaped JSON inside `<script>` tags for hydration — the same text appears more
  than once in the raw HTTP response without appearing more than once in the actual DOM. This
  did **not** affect `UI-SEO-1`'s verification, which only ever checked `<head>` tags (not
  duplicated by RSC streaming) — it only bit this gate when checking rendered chip order in
  the `<body>`. The reliable check for body content is a component-level React Testing Library
  render (what this gate's new tests do), not a raw HTTP text scan; `curl` remains the right
  tool for `<head>` metadata and for confirming a specific string/URL is (or isn't) present
  anywhere at all.

## Closure notes

**Two of three internal-link defects were invisible to the existing automated guard, and both
were found by grep, not by the guard failing.** `test/link-crawl.test.ts` only recognizes
`href="/literal/path"` — a JSX attribute written as a plain quoted string. Every dynamic href
(`` href={`/category/${x}`} ``) and every href sourced from an object-literal array
(`{ href: "/tools/x" }`, colon syntax) is invisible to it. The DB-derived dynamic hrefs
(`` `/posts/${post.slug}` ``, `` `/category/${cat.slug}` `` where `cat` came from a real
Prisma query) are safe by construction and didn't need auditing — but `CategoryStacksGrid`'s
`categorySlug` was a **hardcoded string masquerading as a real one**, which the crawler's
literal-string-only regex was never going to catch. Widening the crawler to parse arbitrary
template-literal and object-literal hrefs was considered and rejected as disproportionate
(it would need real expression evaluation, not regex, to resolve dynamic values generally);
manual audit remains the right tool for hardcoded-but-dynamic-looking hrefs specifically.

**The same hardcoded-chips defect shape has now been found and fixed four times across three
gates** (`SearchUI`/`TopicTagBar` in `UI-CONTENT-1`; `DesktopSidebar` in `UI-SEO-1`;
`OrdersSidebar` here). All four fixes reuse the identical `lib/posts/query.ts` verification
functions built once in `UI-CONTENT-1` — the fix doesn't get reinvented per component, only
applied. No fifth instance was found searching the whole `app/` tree for the same signature
strings (`#PRC2024`, `#DAArrears`, etc.) this gate, so this is very likely the last one, but
worth a repo-wide grep for the pattern (`/search?q=` + hardcoded label) if a new sidebar widget
is ever added.

**Government portal URLs go stale on a timescale this program should expect, not treat as a
one-time fix.** Three of eight hardcoded government URLs had already gone dead by the time
this gate ran — one because of an active 2026 migration (e-SR 2.0, GO 57) that has apparently
not yet produced a discoverable replacement URL, not a years-old link rot. Nothing in this
codebase currently re-checks these periodically; recorded as a gap for whichever future gate
or process owns ongoing maintenance, not something to solve by adding a new automated
mechanism speculatively in this gate.

## Next gate after closure

`UI-404-1`
