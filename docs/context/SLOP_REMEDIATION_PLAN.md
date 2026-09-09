# AI slop remediation — plan and gate record

Branch: `ai-slop-audit`

Baseline: `main` at `1a32e629ec65e954a5f767637d7edfb8559404e3`

Audit of record: `docs/ui/AI_SLOP_AUDIT.md`, committed unmodified at `54efa2a` before any
implementation, so every later change has a written, immutable reason.

## Governing principle

> Subtract first. Redesign only where subtraction leaves a genuine usability gap.

The audit's own standard holds: product purpose, not visual plainness. The gazette identity is
deliberate and is not the target.

## Founder disposition of the 20 findings

The audit classified each finding; this is the founder's decision about which to act on, and
in what order. It differs from the audit's suggested ordering, and where it differs, this
document wins.

| Finding | Disposition | Gate |
| --- | --- | --- |
| A01 homepage hero | Clear slop — replace | `SLOP-DENSITY-1` ✅ |
| A02 homepage rails | Clear slop — strongly simplify | `SLOP-DENSITY-1` ✅ |
| A03 emoji icon system | Clear slop — replace/remove | `SLOP-VISUAL-1` |
| A04 sub-12px text | Design debt + slop symptom — fix carefully | `SLOP-VISUAL-1` |
| A05 mono uppercase labels | Design-system drift — simplify | `SLOP-VISUAL-1` |
| A06 orders discovery overload | Clear slop — simplify | `SLOP-DENSITY-1` ✅ |
| A07 category filter overload | UX debt — make data-driven/proportional | `SLOP-DETAIL-1` |
| A08 empty Search dashboard | Likely slop — simplify conservatively | `SLOP-DETAIL-1` |
| A09 detail metadata duplication | Design debt — simplify | `SLOP-DETAIL-1` |
| A10 TOC/helper machinery | Clear slop — simplify/remove conditionally | `SLOP-DETAIL-1` |
| A11 latest/prev-next recirculation | Very clear slop — remove | `SLOP-REMOVE-1` ✅ |
| A12 "Utility Suite / Privacy First" | Very clear copy slop — remove | `SLOP-REMOVE-1` ✅ |
| A13 financial sidebar | Slop + trust risk — remove | `SLOP-REMOVE-1` ✅ |
| A14 calculator card steppers/badges | Clear slop — simplify | `SLOP-DENSITY-1` ✅ |
| A15 pension "suite" template | Clear slop — simplify | `SLOP-DENSITY-1` ✅ |
| A16 Service Desk vs Topics | Product/IA question — **do not touch yet** | none |
| A17 skeleton excess | Downstream symptom — fix after pages simplify | `SLOP-STATES-1` |
| A18 empty/error/404 states | Good design — **KEEP** | protected |
| A19 gazette/trust system | Core identity — **KEEP** | protected |
| A20 dead query/imports/Pagination | Technical debt — clean up | `SLOP-REMOVE-1` ✅ |

### Protected zones

Nothing in this program may remove, dilute or "tidy" the following. They are not decoration;
they are the product:

- Lifecycle state (`CURRENT`, `SUPERSEDED`, and the recruitment stepper).
- `GOIR Verified`, shown only where a check is actually recorded.
- `Issued` versus `Added to portal` date labelling.
- GO / reference numbers and their mono treatment.
- Provenance and source links.
- Telugu summaries and first-class Telugu type.
- Related Orders — approved, curated document relationships.
- The restrained empty, error and 404 states (A18).

### Deliberately deferred

**A16 (Service Desk vs Topics)** stays out of the program. The audit gave it MEDIUM confidence,
and Topics (browse by subject) and Service Desk (start from a task) are different mental models.
Merging or deleting either needs product reasoning or real entry-path data, not a similarity
judgement.

## Gates

```
SLOP-AUDIT-1     ✅ complete (54efa2a)
      ↓
SLOP-REMOVE-1    ✅ complete — A11 + A12 + A13 + A20
      ↓
SLOP-DENSITY-1   ✅ complete — A01 + A02 + A06 + A14 + A15
      ↓
SLOP-DETAIL-1       A07 + A08 + A09 + A10
      ↓
SLOP-VISUAL-1       A03 + A04 + A05
      ↓
SLOP-STATES-1       A17
      ↓
SLOP-ACCEPTANCE-1   browser before/after compare, mobile + desktop
      ↓
SLOP-CLOSE
```

## `SLOP-REMOVE-1` — record

Scope: A11, A12, A13, A20. Chosen first because all four are high-confidence subtractions with
little risk to the document product.

### What was removed

- **A11 — generic recirculation on `/posts/[slug]`.** `PostNavCards` (Previous/Next Post) and
  `CategoryStacksGrid` (`🔔 తాజా అప్‌డేట్‌లు — Latest Updates & Softwares` plus the tools stack)
  deleted, along with the four queries that fed them. Replaced by one quiet link back to the
  document's own category, falling back to `/orders` when it has none. Related Orders is now the
  document's only lateral continuation, which is what the audit asked for: chronological
  adjacency and site-wide recency are not relationships between documents.
- **A12 — repeated privacy claims and "suite" branding on `/tools`.** The client-side privacy
  fact was stated five times (hero eyebrow, hero sentence, bordered strip, `Privacy First` pill,
  and a navy `Client-Side Security Guarantee` sidebar card). It is now stated once, plainly, in
  the page's opening sentence. `Heritage Craft Utility Suite` is gone.
- **A13 — the tools sidebar.** `ToolsSidebar` deleted entirely, which removes the
  `Financial Rates Summary` widget — four hardcoded rates labelled `Active` / `Fixed` /
  `Updated` / `Max Limit` under the subtitle `AP Treasury Approved Standards`, with no source,
  effective date, GO reference or verification field anywhere near them. That was the finding's
  trust risk, not just its visual noise. The `DDO Bill Submission Guide` (links to three tools
  already in the main grid) went with it. `/tools` and `/tools/prc-calculator` both lost their
  8/4 split and now use full width.
- **A20 — dead source.** The `post-siblings` query, whose result was never read; eleven unused
  imports left behind when rendering moved into `DocumentTemplate`; and `Pagination.tsx`.

### The one judgement call worth re-reading

`Pagination.tsx` was deleted. It has zero consumers and was recorded as unused by two prior
audits — but `docs/ui/UI_AUDIT.md` F29 ("no pagination anywhere") and its component inventory
recommend **"REFINE, then adopt"** it if list pagination is ever built, and `UI-SYSTEM-2` had
already refined it (44px targets, correct `aria-current`). No gate ever scheduled that adoption
and the UI System program closed without it, so this program treated it as dead code per A20.

If pagination is adopted later, restore the component and its primitive test together from
`git show <this commit>^:'app/(public)/_components/Pagination.tsx'` rather than writing a new
one. The refinement work is preserved in history, not lost.

### What was deliberately not touched

The calculator cards on `/tools` still carry emoji tiles, badges, status text and numbered step
chips (A14), and the detail page still has its `Structured Document` micro-label and TOC (A10).
Those belong to later gates. This gate subtracted whole widgets; it did not restyle what remains.

### Verification

- `tsc --noEmit` clean.
- Full suite: **64 files / 441 tests pass**, against the real Postgres test database.
- **Mutation evidence, not just green tests.** The five new `test/detail-recirculation.test.tsx`
  cases were run against the pre-change code with the deleted components restored: all five
  failed, each on the specific string it guards. They pass against the new code. A test that
  asserts a feature is gone proves nothing unless it is shown to fail when the feature is
  present.
- The rewritten draft-leak guard was mutation-checked the same way, and the first version of it
  **failed that check**: it scanned a 600-character window after each `prisma.post.find*`, so the
  detail query's nested `relatedPost: { isDraft: false }` satisfied the assertion even with the
  top-level `where` filter deleted. It now stops the window at `include:`, and a deleted
  top-level `isDraft: false` makes it fail as intended.
- Real browser, dev server, Playwright: `/tools`, `/tools/prc-calculator` and a document detail
  page at 1440×1000 and 390×844. Zero console errors, no horizontal overflow at either width.
  On `/tools` none of the nine removed phrases appear in rendered text, the privacy sentence
  appears exactly once in the DOM, and all six calculators are present. On the detail page none
  of the six recirculation strings appear, the back link renders at a 44px height with the
  correct category href, and the `CURRENT` state badge and document reference are intact.
- Bordered elements on `/tools` fell from the audit's 83 to 67 at desktop width.

### Follow-up owned by later gates

`test/db.ts`'s `makePost` gained an optional `createdAt` override, so a test can depend on
document ordering instead of on the row happening to be inserted first.

## `SLOP-DENSITY-1` — record

Scope: A01, A02, A06, A14, A15. The principle for the whole gate was restoring
document/task density **by subtraction** — not replacing one elaborate composition with a
different one.

### What changed

- **A01 — the homepage no longer promotes a document to a hero.** `posts[0]` was pulled into
  `HeroCard` because it sorted first, which is a landing-page convention standing in for an
  editorial decision the data never made. `HeroCard` is deleted (no consumer survived) and every
  document renders as the same `PostCard` row. No `featured`/`urgent` field was introduced, per
  the gate's instruction.
- **The date moved onto the row.** The hero was the only place a date appeared on the homepage
  index, so removing it would have taken "when was this issued" off the index entirely — one of
  the four questions `PRODUCT.md` says the product exists to answer. `PostCard` now renders
  `DocumentDate`, which cannot render a date without its `Issued` / `Added to portal` label.
- **A02 — one rail instead of two card kits.** The right rail (four calculators the primary
  navigation already reaches, plus a "Quick Searches" chip card) is deleted with
  `DesktopSidebar`. The left rail is flattened from Card-inside-Card-with-pills to a plain list:
  category name, Telugu name, count, category colour. The category-count pill, the per-row count
  pills, the microcopy and "Explore All Categories" are gone. The feed went from 50% to 70% of
  the main column at 1440px.
- **A06 — `/orders` runs one browse model.** Deleted: the masthead's dark ribbon and its own
  search button, the topic tag bar (still on `/search`, which owns topic browsing), the
  horizontally scrolling "Recent Documents" chip strip, the six document-type tabs, the category
  cards with their three-post previews and footer CTAs, and `OrdersSidebar`'s quick-search chips.
  What remains: masthead, a category index with counts, one list of latest documents as the same
  `PostCard` rows the homepage uses, and the GOIR explanation as quiet help text. The page also
  stopped shipping a client component (the tabs).
- **A14 / A15 — tool and pension cards.** Every badge and status on both card sets repeated a
  word already in the title or description, so both came out, along with the numbered
  "Fill Details → Auto-Calculate → Export PDF" chips, `/pensioners`' "Emerald Treasury Care Suite"
  branding, and its six-chip office-pipeline preview (the same destination was already a card and
  a linked guide). One qualifier survived: whether a tool exports anything, which is the only
  card metadata that differs between tools and cannot be read off the title.
- **`PensionersSidebar` → `OfficialPensionPortals`.** Its "Treasury DR Standards" card was the
  A13 pattern again — four hardcoded figures under an "AP Treasury" badge with no source,
  effective date or GO reference, on a page whose readers are making pension decisions — and it
  painted a figure with `text-emerald-700`, a raw palette colour `DESIGN_SYSTEM.md` R0.2 bans.
  The widget is gone; the four live-checked government portal links stayed, since they are
  sourced guidance a reader needs to choose a task.

### The one thing added, then measured back out

A one-line Telugu summary was added to every document row, to keep the summary content the hero
used to carry. Measured at 390×844 it made rows 219px tall and left only **two** documents inside
the first viewport, against `DESIGN_SYSTEM.md` §5.3's three-row target. It was removed again and
rows fell to 172–187px. The Telugu title is still on every row; the summary lives on the document
page. `DESIGN.md` §4 is explicit that density wins this trade.

### Measured acceptance (real Chromium, dev server)

Homepage document rows visible in the initial 390×844 viewport: **3** (two of them entirely
clear of the fixed bottom nav, the third about three-quarters visible including its state,
reference, date and English title). **Before this gate the number was zero** — the hero filled
the viewport.

| Route | Width | Bordered | Nested bordered | Sub-12px text | Overflow |
| --- | --- | --- | --- | --- | --- |
| `/` | 390 | 50 | 27 | 2 | none |
| `/` | 1440 | 50 | 27 | 2 | none |
| `/orders` | 390 | 51 | 36 | 2 | none |
| `/orders` | 1440 | 49 | 27 | 2 | none |
| `/tools` | 390 | 51 | 40 | 2 | none |
| `/pensioners` | 390 | 46 | 36 | 2 | none |
| `/pensioners` | 1440 | 44 | 27 | 2 | none |

Read those against the audit's own counts: `/orders` had **37** visible sub-12px elements at
mobile and 19 nested bordered panels at desktop; `/tools` had **57** sub-12px at mobile and 83
bordered at desktop; `/pensioners` had 58 bordered, 28 nested, five pills and 15 sub-12px.

The counts that remain are almost entirely the shared shell, not the pages. Scoped to `<main>`
on `/pensioners` at 1440: **19 bordered, 12 nested, 0 sub-12px**. Pill-shaped text elements on
`/orders` and `/pensioners` at 1440: **0**. Zero console errors and no horizontal overflow on
any route at either width.

Retained on every measured route: lifecycle state words, labelled dates, GO references, GOIR
provenance where recorded, Telugu titles, and category identity/colour.

### Test changes

- New `test/density-regressions.test.tsx` (12 cases): for each removed structure, one assertion
  that it is gone **and** one that the information it wrapped is still rendered.
- Mutation-checked. Re-splitting the feed (`posts.slice(1)`) failed the row-count and
  information assertions; deleting `DocumentDate` from the row failed the labelled-date
  assertions on both indexes; adding a "Quick Searches" widget back to the homepage failed the
  A02 guard.
- Rewritten rather than deleted, so their invariants survive their subjects: the orders
  empty-state cases (were `OrdersFilterTabs`, now the page's two empty states), the per-document
  GOIR rule (was `OrdersFilterTabs`, now `PostCard`), the 320px wrap rule (was `HeroCard`'s
  footer, now `PostCard`'s metadata line), the export-claim rule (was step chips, now the export
  metadata line, with the two exporting tools named so the count cannot drift), the FRESHNESS-1
  GOIR wording guard (was `OrdersSidebar`, now `orders/page.tsx`), and the no-engagement-language
  guard (was two rail files, now every file under `app/(public)`).
- Deleted with their subjects: `test/desktop-sidebar.test.tsx`, `test/orders-sidebar.test.tsx`.
- `test/db.ts`'s `makePost` gained `createdAt`, so ordering-dependent tests do not rely on
  insertion order.

### Verification

`tsc --noEmit` clean · **63 files / 442 tests pass** · Tailwind class and colour guards pass
(part of the suite) · `git diff --check` clean · `next build` succeeds, 42 static pages, First
Load JS shared unchanged at 87.3 kB · real-Chromium acceptance at 390×844 and 1440×1000 on `/`,
`/orders`, `/tools`, `/pensioners`.

`npm run build` itself could not run: `prisma generate` fails with `EPERM` renaming
`query_engine-windows.dll.node` because another local Node process holds the DLL open. The
schema did not change in this gate, so `next build` was run directly against the existing
client. This is an environment lock, not a build failure.

### Deliberately not done here

Emoji still stand in for icons on the tool and pension cards and in the shell (A03), the
remaining mono uppercase labels are untouched (A05), and skeletons still describe the old page
shapes beyond the two this gate had to edit to keep them honest (A17). A16 remains deferred.
