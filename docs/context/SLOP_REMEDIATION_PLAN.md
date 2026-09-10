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
| A03 emoji icon system | Clear slop — replace/remove | `SLOP-VISUAL-1` ✅ |
| A04 sub-12px text | Design debt + slop symptom — fix carefully | `SLOP-VISUAL-1` ✅ |
| A05 mono uppercase labels | Design-system drift — simplify | `SLOP-VISUAL-1` ✅ |
| A06 orders discovery overload | Clear slop — simplify | `SLOP-DENSITY-1` ✅ |
| A07 category filter overload | UX debt — make data-driven/proportional | `SLOP-DETAIL-1` ✅ |
| A08 empty Search dashboard | Likely slop — simplify conservatively | `SLOP-DETAIL-1` ✅ |
| A09 detail metadata duplication | Design debt — simplify | `SLOP-DETAIL-1` ✅ |
| A10 TOC/helper machinery | Clear slop — simplify/remove conditionally | `SLOP-DETAIL-1` ✅ |
| A11 latest/prev-next recirculation | Very clear slop — remove | `SLOP-REMOVE-1` ✅ |
| A12 "Utility Suite / Privacy First" | Very clear copy slop — remove | `SLOP-REMOVE-1` ✅ |
| A13 financial sidebar | Slop + trust risk — remove | `SLOP-REMOVE-1` ✅ |
| A14 calculator card steppers/badges | Clear slop — simplify | `SLOP-DENSITY-1` ✅ |
| A15 pension "suite" template | Clear slop — simplify | `SLOP-DENSITY-1` ✅ |
| A16 Service Desk vs Topics | Product/IA question — **do not touch yet** | none |
| A17 skeleton excess | Downstream symptom — fix after pages simplify | `SLOP-STATES-1` ✅ |
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
SLOP-DETAIL-1    ✅ complete — A07 + A08 + A09 + A10
      ↓
SLOP-VISUAL-1    ✅ complete — A03 + A04 + A05
      ↓
SLOP-STATES-1    ✅ complete — A17
      ↓
SLOP-ACCEPTANCE-1   browser before/after compare, mobile + desktop
      ↓
SLOP-CLOSE
```

## `SLOP-ACCEPTANCE-1` — record

**Disposition: NOT ACCEPTED.** This is a verification-only gate. It did not start
a new redesign or alter the protected document/trust system.

### What passed

- Real Chromium review covered `/`, `/orders`, `/category/govt-orders`, empty and
  populated `/search`, a two-heading document, the 26-heading APPSC document,
  `/tools`, `/tools/tax-calculator`, `/pensioners`, `/service-desk`, `/topics`, and
  a genuine unmatched 404 at both 390×844 and 1440×1000. No page-level horizontal
  overflow was measured on those routes. The homepage showed three ordinary document
  rows in the phone first viewport; it no longer spends that viewport on a feature
  card.
- A01, A02, A04–A15, A17 and A20 hold in the rendered product. In particular:
  the orders hub has one category index rather than its former parallel discovery
  widgets; the three-document category has no filter bar; empty Search is a search
  field plus one compact suggestion/recent area; duplicate detail facts are absent;
  the two-heading document suppresses its TOC; and the 26-heading document retains
  the mobile Page Index after hydration. The stripped tools index has no rates widget,
  privacy repetition, or suite promotion. A16 remains deferred.
- The protected semantics remain intact in rendered/source verification: `CURRENT`,
  `SUPERSEDED`, and notification lifecycle stages; positive-only GOIR provenance;
  labelled `Issued`/`Added to portal` dates; reference numbers; Telugu titles;
  source links; the independent/unofficial statement; and public-query `isDraft:
  false` boundaries. Related Orders remains the only intentional detail-page lateral
  continuation and continues to require approved, published related posts.
- The three housekeeping items are corrected: `విషయ సూచిక`, no `1-Click Filter`,
  and `Runs in your browser` replacing `Runs 100% On Device`.
- The pre-existing 35px detail overflow is **not reproducible at 390px now**. Its
  formerly-wide APPSC tables are contained by their own local horizontal scrollers;
  `documentElement.scrollWidth` was 375px for the 390px browser viewport (the 15px
  scrollbar reservation), not wider than it. No escaping page box was found. The
  historical exact root cause remains unproven: SLOP-DETAIL-1 established that its
  then-observed 35px overflow predated that gate and identified no escaping element.
  It is unrelated to the remediation under review and has no current user impact;
  no scope exception is justified.

### Acceptance blocker: A03 is not fully closed

The remediated shell, index routes, tools, and pension routes have no emoji iconography
and no visible screen text below 12px. However the required long-document route,
`/posts/appsc-departmental-tests-notification-material`, still renders six decorative
article-content emoji occurrences: `💬`, `📢`, `📥`, `📰`, and `🔔` twice (plus directional
link glyphs).
They are visible below the masthead in the document body. This is outside the prior
route-component source guard, but it is inside the actual public product and conflicts
with `DESIGN.md`/`DESIGN_SYSTEM.md`'s no-emoji product-content rule. The prior
"visible emoji 104 → 0" measure therefore does not cover the required representative
long-document route. It is meaningful enough to withhold acceptance; it should be
removed or replaced with restrained semantic structure in a focused follow-up, without
transcribing or changing the document's numeric/tabular source material.

### Fresh measurements and regression evidence

| Measure | Audit baseline / prior gate | Acceptance observation |
| --- | --- | --- |
| Homepage ordinary rows in 390px first viewport | 0 (`A01`) | 3 |
| Government Orders filters / documents | 8 / 3 (`A07`) | 0 / 3 |
| Empty Search first-viewport composition | chips + recent + task grid (`A08`) | search controls + one recent/suggestion area |
| Detail duplicated facts | 4 (`A09`) | 0 |
| Short / long TOC | both rendered (`A10`) | 2-heading suppressed / 26-heading retained |
| Visible sub-12px screen text | 69 before / 0 after in `SLOP-VISUAL-1` | 0 on all acceptance first viewports (print-only carve-out not counted) |
| Visible emoji | 104 before / 0 after in `SLOP-VISUAL-1` | 0 on major index first viewports; **6 decorative emoji occurrences in the required long document body** |
| Horizontal overflow | none after earlier gates | none on all required route/viewport pairs; historical 35px defect not reproduced |
| CLS | 0.0000–0.0008 before and after (`SLOP-STATES-1`) | no improvement claimed |

Nested borders and pills were not pursued as abstract targets: retained borders carry
document rows, lifecycle, forms, or actual section boundaries. The orders desktop
discovery systems remaining are its category index and one quiet GOIR explanation;
there is no recent strip, tab system, or quick-search rail. Fresh Chromium console
smoke on a clean production tab reported no errors. `npm run build` reproduced the
known Prisma DLL rename lock; listener PID 6952 was this gate's isolated port-3010
Next dev server, so no unrelated process was killed. `prisma/` was unchanged and
`npx next build` completed successfully against the current generated client.

Regression status: TypeScript and `git diff --check` clean. The full Vitest command
was launched repeatedly but this constrained runner ended its output window before it
emitted a final aggregate result; a later focused Vitest invocation was blocked during
Vite config startup by the sandbox's denied parent-directory read. Both outcomes are
recorded as incomplete test evidence, not represented as green full-suite or guard
results.

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

## `SLOP-DETAIL-1` — record

Scope: A07, A08, A09, A10. The emphasis here is the opposite of the last gate's: **keep the
information, remove the machinery around it.** Nothing a document knows about itself was
dropped; what went is the apparatus that presented the same fact more than once.

### What changed

- **A07 — category filters are derived, and proportional.** The bar was fixed at `All`, `Open`,
  `Closed`, `2026`, `2025` plus every tag, so the rendered Government Orders category offered
  eight pills over three documents, with two hardcoded years that age on their own. Two rules
  replace all of it:

  1. **A facet is offered only if choosing it would change the result set** — it must match at
     least one document and fewer than all of them. That single test retires the hardcoded
     years (a year every document shares narrows nothing; one no document has is a dead end),
     the always-present Open/Closed pair, and a tag every document carries.
  2. **No filter bar until the list is longer than one page** (`FILTER_MIN_DOCUMENTS`, 10 — the
     number "Load More" already pages by). Below it every document is on the screen, so
     scanning beats operating a control that hides part of the list.

  `now` is captured once and shared between deriving the facets and filtering by them, which
  makes rule 1 a guarantee rather than an approximation: a facet on screen always matches at
  least one visible document, so a filtered-empty result is unreachable and the only empty
  state is an empty category. The list also stopped repeating the masthead's own document count
  and its "Newest first" sort note; the count now appears only while a filter is narrowing the
  list. Lifecycle state stays on every row either way.

- **A08 — the empty search stopped being a second portal.** Removed: the "Find by Task" grid of
  six cards pointing at `/orders`, `/pensioners` and two calculators (all primary navigation
  targets), and the "Quick Searches" widget — a heading over pills-inside-buttons carrying a
  magnifying-glass emoji. What remains is the field, the type control, and one compact area: a
  single line of verified suggestions (`Try: TET 2026 · Mega DSC · Transfers`) above the recent
  documents. The recent-document rows lost their document-type pill, which is now plain
  metadata beside the GOIR marker and the labelled date.

- **A09 — one document header.** The state indicator, the masthead and At a Glance were three
  consecutive full-width bordered panels, and between them the reference, department, date,
  deadline and GOIR check each appeared twice. The state indicator is now the strip that opens
  a single bordered header block — state still first on the page — and At a Glance lost the
  fact table entirely, because every row in it was already stated above. Its subtitle
  ("Author-provided summary and document facts") and the state card's "Document Status" label
  went too: both named the section instead of telling the reader anything. At a Glance now
  carries only what nothing else does — the authored Telugu summary, the English abstract and
  the action/PDF/source links — and renders nothing at all when a document has none of them.

  The state strip stays on paper rather than moving onto the navy masthead: the badge variants
  are tinted fills built for the paper ground, and the product's single most important marker
  is not the place to trade measured contrast for a cosmetic gain.

- **A10 — the helper label and a proportional TOC.** "Structured Document" is gone. The table of
  contents renders only at `MIN_TOC_HEADINGS` (4) or more headings; below that the document
  flows normally, and `DocumentTemplate` counts the headings server-side so the LAYOUT follows
  the same rule — a short document's text now takes the full width instead of leaving the
  contents column reserved and empty. `TableOfContents` is still mounted below the threshold,
  where it draws nothing but still assigns heading ids, so a direct link to a section keeps
  working on a document with no contents list.

### The one decision reversed mid-gate

The quick-search chips were deleted outright first, on the reasoning that the verified topic bar
above `SearchUI` was already the page's suggestion surface. Browser acceptance showed the topic
bar renders **nothing** on this dataset — no curated topic tag has a published post carrying it
— which would have left the empty search with no suggestion at all. The instruction was that
suggestions must *remain* self-verifying, not that they should go, so `quickSearchChips` and its
test were restored and the suggestions came back as one plain line of text links: the same
verification against published content, none of the widget.

### Measured acceptance (real Chromium, 390×844 and 1440×1000)

| Measurement | Before | After |
| --- | --- | --- |
| `/category/govt-orders` filters vs documents | 8 pills / 3 documents | **0 pills / 3 documents** |
| `/category/notifications` (largest available) | filters over 4 documents | **0 pills / 4 documents** |
| Duplicated document count on a category page | 2 ("3 documents" twice) | **1** |
| Empty `/search` first-viewport regions | search + chips + recent + task grid | **search + one recent/suggestion area** |
| Consecutive large bordered panels before the document body | 3 | **2** |
| Facts stated twice in the detail header (reference, department, date, GOIR) | 4 | **0** |
| Short document (2 headings) TOC | rendered, "(2 sections)" | **suppressed**, heading ids kept |
| Long document (25 headings) TOC | rendered | **rendered**, 25 entries, mobile and desktop |
| Short document content width at 1440 | ~70% (empty TOC column) | **1345 px of 1440** |
| Horizontal overflow | — | none on category, search or short document |
| Console errors | — | none on any route tested |

No category in the local dataset holds more than four documents, so the **above**-threshold
filter bar could not be shown in a browser; that direction is covered by unit tests instead,
including the year, state and tag derivation rules.

### A pre-existing defect found during acceptance, and left alone

`/posts/appsc-departmental-tests-notification-material` scrolls horizontally by 35px at 390px.
It is **not** caused by this gate: the same 35px was measured after temporarily reverting all
five changed detail files to their pre-gate state (that render still contained "Structured
Document", confirming it was the old code). No element extends the page outside a local scroll
container — the wide elements sit inside the breadcrumb's `overflow-x-auto` and the prose
tables' own scrollers, both permitted by `DESIGN_SYSTEM.md` §9.3 — so the cause needs its own
investigation. Recorded rather than fixed, because it belongs to no finding in this gate.

### Test changes

- New `test/detail-header.test.tsx` (19 cases) covering A07, A09 and A10, again pairing "the
  machinery is gone" with "the information is still rendered". The A09 duplication check counts
  occurrences inside the header and inside At a Glance rather than across the page, because the
  breadcrumb legitimately names the document by its reference — and repeats it in schema.org
  JSON-LD.
- Mutation-checked five ways: restoring the fact table to At a Glance, dropping the TOC
  threshold, weakening the facet rule to "always meaningful", showing the filter bar regardless
  of list size, and putting a task-links grid back on the empty search. Each failed the specific
  guard that owns it, and nothing else.
- Rewritten rather than deleted: the ActionSummary fact-row cases (their subject moved to the
  header), the category filter cases (padded past the threshold, with the padding filtered out
  of the assertions so they still read as exact lists), the `Document Status` assertions in
  `post-lifecycle-render.test.ts` (now on the state sentence, which is the part §2.4 actually
  requires), and "labels the document date wherever it appears" — which asserted a fixed count
  of two surfaces and would now have passed by accident, so it finds every date the page renders
  and requires each to carry its label.
- `states.test.tsx`'s filtered-empty case was replaced: that state is unreachable now, so it
  asserts the absent filter bar on a one-document category instead.

### Verification

`tsc --noEmit` clean · **64 files / 466 tests pass** · Tailwind class and colour guards pass ·
`git diff --check` clean · build succeeds, 42 static pages, First Load JS shared unchanged at
87.3 kB · real-Chromium acceptance at both widths on a small category, the largest available
category, empty `/search`, `/search?q=`, a current and verified document, a 25-heading document
and a 2-heading document.

**Build path.** `npm run build` still fails at `prisma generate` with `EPERM: operation not
permitted, rename 'query_engine-windows.dll.node'`. The holder was identified this time rather
than assumed: a `next dev` process (PID 20432, started 18:36:05, launched by `npm run dev` PID
23276) unrelated to this session holds the DLL open. Per the gate's instruction nothing was
killed or reconfigured; `prisma/` is unchanged in this gate (verified with `git diff -- prisma/`),
so the generated client is current and `npx next build` — the strongest valid path — was run
against it.

### Deliberately not done here

The emoji in the TOC's own labels (`📑 Page Index`) and across the shell are untouched (A03), as
are the mono uppercase section labels (A05) and the sub-12px text inside them (A04). A16 stays
deferred. Skeletons were not touched at all: the category and search loading files still reserve
filter pills that a short list no longer renders, which belongs to SLOP-STATES-1 (A17) and is
recorded here so that gate does not have to rediscover it.

## `SLOP-VISUAL-1` — record

Scope: A03, A04, A05. This gate enforces rules the design system already writes down; it does
not invent a standard. `DESIGN_SYSTEM.md` §13 bans emoji as iconography and specifies inline
SVG (stroke-based, 1.5–2px, 16/20/24 grid, `currentColor`, decorative ones `aria-hidden`);
§1.2 sets 12px as the absolute floor for any text; §1.3 permits uppercase tracked labels only
as genuine section labels, at minimum 12px, at most one per region.

### Scope correction — the audit's evidence is stale in two directions

The audit cites `DesktopSidebar.tsx`, `OrdersFilterTabs.tsx`, `ToolsSidebar.tsx` and
`orders/page.tsx:179` as A03/A04/A05 sites. **All of those were deleted by `SLOP-REMOVE-1` and
`SLOP-DENSITY-1`**, and with them the audit's worst counts: `/orders` measured 37 visible
sub-12px elements and `/tools` 57, against 2 each today, both from the shared shell. What
remains is smaller than the audit describes and sits in the shell, the calculators, search and
the category log — not on the index pages the audit measured.

Measured from source at the start of this gate: 66 emoji occurrences across 24 public files,
39 sub-12px class sites, 19 `font-mono` + `uppercase` label sites.

### The print carve-out, verified rather than assumed

A04 says the 9–11px typography inside the tax calculator's official form reproductions is "a
separate, intentional print-density case" that must not be swept into the same classification.
Checked site by site: **10 of the sub-12px sites are print**, and they are not touched —
nine in `TaxCalculatorUI` (lines 887–1841, all inside `bg-white border-2 border-black
print-page-break` A4 reproductions of Annexure-I and Form 10E) and one in `CommutationTrackerUI`
(the STO restoration application's signature block). The other two `TaxCalculatorUI` sites are
screen chrome, not print — the sticky result panel's 9px label and the tab bar's 11px caption —
and are in scope.

### What changed

- **A03 — the emoji icon system is gone, and mostly by subtraction.** Every drawer nav item,
  tool card, pension card, topic chip and FAQ/guidance heading already carried a full text label,
  so the symbol beside it was removed rather than redrawn: the audit's arbitrary mappings (a beach
  for leave, an elderly-person glyph for all pensioners, lightning for calculators, and three
  different chart/document emoji to separate six calculators) had no meaning left to preserve. The
  `SD` letter mark on Teacher Service Desk went with them — a set of five emoji plus one
  initialism is not a system.

  Three controls needed the other half of the audit's direction, because a bare character *was*
  their entire visible content and no adjacent label existed: `ThumbZoneBar`'s source link and the
  mobile table of contents' disclosure toggle are now inline stroke SVG on `currentColor`, which
  is what `BottomNav`, `Accordion` and `SidebarCollapsible` already used. No new icon library was
  added and no icon was invented for a label that already worked.

- **A04 — 12px is the floor on screen, and the print forms were left alone.** 29 screen sites
  moved up to the floor. Where the small size was carrying a second, redundant signal it was
  subtracted instead of enlarged: the desktop TOC's level-3 items dropped to 11px to indicate a
  nesting `ml-3` already indicates, and the two `service-desk` captions ("Service guide",
  "Internal portal guide") were 10px restatements of the heading beside them, so they are gone
  rather than promoted — A04's own direction is to remove a low-value label before increasing
  its size.

- **A05 — mono and uppercase went back to what they are reserved for.** The audit's evidence list
  is now mostly historical: five of its six named labels (`QUICK SEARCHES`, `FIND BY TASK`,
  `FINANCIAL RATES SUMMARY`, `DDO BILL SUBMISSION GUIDE`, `CATEGORY STACKS`) were deleted by
  earlier gates. Section identity — `Recent Documents`, `Results (n)`, `Table of Contents`,
  `Categories`, the topic bar heading, two calculator card headings — now uses the normal heading
  face. `ThumbZoneBar`'s primary action was the product's last ALL-CAPS button (§13 asks for
  sentence case) and the dialog title was uppercased section identity.

  Mono uppercase stays exactly where §13 reserves it: `Badge` (status), `DocumentDate`,
  GO/reference numbers, `UpcomingActionDates`' `<time>`, `Table` headers, the sidebar group
  labels and the category classification ribbon.

### The largest single change was found by the browser, not by reading the source

Source review had A05 down as nearly finished. The rendered measurement disagreed:
`/tools/da-arrears` showed **19** uppercase mono elements and `/tools/prc-calculator` 11, and most
of them were *form labels* — `BASIC PAY (MONTHLY)`, `OLD DA %`, `FROM MONTH` — eight tracked
ALL-CAPS labels stacked in one column. They all render through one primitive, `FieldLabel`, which
no route-level grep for a heading would ever surface. §1.3 allows at most one uppercase label per
region; §13 asks for sentence case on labels outright; and A05 reserves mono for dates, GO
numbers, status and calculator figures, which a field label is none of. One line in `Field.tsx`
took da-arrears from 19 to 7 and prc-calculator from 11 to 5.

Its `labelTe` span carried a `lowercase` counter-transform whose only job was to undo this
element's own `uppercase` on the Telugu parenthetical — a fair sign the transform was fighting the
content rather than serving it. Both are gone.

This is the third gate in a row where reading the source under-reported the defect.

### The one removal that was reverted, and why

"Published documents" was pulled from the category masthead ribbon on the reasoning that telling a
reader of a category page that it lists published documents is vacuous. It is not: it is a
**FRESHNESS-1 trust boundary**, asserted by `freshness-trust.test.tsx` on `/orders`, `/category`
and `SearchUI` under the name "does not describe a category or homepage feed as collection-wide
verified". It bounds what the feed claims to be, which is the protected trust system (A19), and it
was restored before the gate ran its suite. Only the genuinely duplicated half of the ribbon's
other label went — "AP School Education", which sits in the site header two rows above it.

The ribbon was also 10px at 40% opacity on navy: below the §1.2 type floor and the §14 contrast
floor at once. A classification line nobody can read is not classifying anything, so it is now
12px at 70%.

### Measured acceptance (real Chromium, dev server, 390×844 and 1440×1000)

Ten routes × two viewports, measured on the rendered DOM — visible elements only, computed
`font-size` — with the same script run against this branch and against the stashed pre-gate tree
on the same server.

| Measurement (20 route/viewport pairs) | Before | After |
| --- | --- | --- |
| Visible emoji characters | **104** | **0** |
| Visible text elements below 12px | **69** | **0** |
| Uppercase mono elements | 173 | **129** |
| Horizontal overflow | none | **none** |
| Console errors | — | **0** |

Per route the emoji were concentrated where the audit said: `/tools` 14 → 0 and `/pensioners`
12 → 0 at desktop, with a 7-emoji floor on every route from the shell drawer alone.

The sub-12px count is worth reading in detail, because on `/category/govt-orders` the 14 elements
below the floor were not decoration. They were **`G.O.Ms.No.129`, `G.O.Ms.No.21`, and three
`Added to portal · <date>` labels** — GO reference numbers and labelled dates, both protected
content, both rendered at 10px. Raising the floor there is not a tidying change; it makes the data
the product exists to show legible.

The 129 uppercase mono elements that remain are the reserved set: the `AP School Education`
masthead identity line, `Badge` status pills, document-type filters, and accordion section badges.
None is a heading, a button or a form label.

`/orders` at mobile reported two console errors in both the before and the after run — a Next dev
`Failed to fetch RSC payload` prefetch race against `/`, present without this gate's changes and
therefore not caused by it. The final measurement on a warm server is clean on every route.

### Test changes

- New `test/visual-system.test.ts` (9 cases) and `test/visual-system-render.test.tsx` (5 cases).
  The source guards state the invariant the findings are actually about — "this device does not
  reappear anywhere in `app/(public)`" — which no per-component render test can express; the
  render file carries the paired "the information is still there" half, since proving emoji are
  gone would also pass on a blank page.
- **The print carve-out is an allowlist of exact lines, not a file exclusion.** A04 says the
  9–11px typography inside the tax form reproductions is a separate case needing print review, so
  its 9 sites and `CommutationTracker`'s signature block are listed individually. Excluding the
  file instead would let a *new* screen-side 9px label into `TaxCalculatorUI` unnoticed, which is
  how the audit's 57-element count on `/tools` accumulated in the first place. A paired assertion
  requires those 9 print sites to still be there, so the floor cannot be reached by flattening the
  official A4 layouts.
- **Mutation-checked, 11 of 11 caught.** Each guard was run against the defect it owns and
  required to fail: an emoji back on a tool card (source *and* render), a bare arrow glyph back in
  `ThumbZoneBar`, a sub-12px back on a screen element, a **new** sub-12px added inside the
  allowlisted print file at a screen line (this is the one that proves the allowlist is per-line),
  a print form flattened to the screen floor, mono uppercase back on a section heading, ALL CAPS
  back on the primary button, ALL CAPS back on `FieldLabel`, mono stripped from the data it is
  reserved for, and a tool card losing its title.

### Verification

`tsc --noEmit` clean · **66 files / 480 tests pass** (from 64/466) · Tailwind class and colour
guards pass · `git diff --check` clean · build succeeds, First Load JS shared unchanged at
87.3 kB · real-Chromium acceptance at 390×844 and 1440×1000 on `/`, `/orders`, `/tools`,
`/pensioners`, `/search`, `/service-desk`, `/tools/prc-calculator`, `/tools/da-arrears`,
`/tools/cfms-checker` and `/category/govt-orders`.

**Build path.** `npm run build` still fails at `prisma generate` with `EPERM ... rename
'query_engine-windows.dll.node'`. `prisma/` is unchanged in this gate (verified with
`git diff HEAD -- prisma/`), so the generated client is current and `npx next build` was run
against it, exactly as in `SLOP-DETAIL-1`.

### Deliberately not done here

- **A16 stays deferred**, unchanged.
- **Skeletons untouched** — `/category` and `/search` loading files still reserve filter pills a
  short list no longer renders. That is `SLOP-STATES-1` (A17) and was already recorded by the last
  gate; this one adds nothing to it.
- **`Table` headers, `Badge`, sidebar group labels and the classification ribbon keep mono
  uppercase.** They are the data, status and section-label cases §13 and §1.3 explicitly reserve
  it for; stripping them would be A05 applied in reverse.
- **Two things noticed and left, because they belong to no finding in this gate.** `TopicTagBar`
  renders the microcopy "1-Click Filter", and `/tools/da-arrears` carries a "Runs 100% On Device"
  pill — the A12 privacy-repetition pattern, which was scoped to `/tools` and closed there. Both
  are copy decisions, not visual-system ones.
- **A Telugu typo, left for the founder.** The mobile TOC reads `విశయ సూచిక`; the word for
  "contents" is `విషయ` (ష, not శ). It sits on a line this gate edited, but correcting product
  Telugu is a content decision and is not silently folded into a visual pass.

## `SLOP-STATES-1` — record

Scope: A17. The audit's classification is SIMPLIFY at MEDIUM confidence, and its direction is
precise: "After simplifying the loaded routes, reduce skeletons to the minimum stable shape of the
retained heading, controls and first content rows. Do not create decorative placeholder cards for
widgets that should be removed."

Three of the five `loading.tsx` files had not been touched since the audit baseline `1a32e62`
(`category`, `search`, `posts/[slug]`); `/` and `/orders` were partly updated by the gates that
changed those pages, and both carried a comment deferring the rest to this gate.

### The two real defects: placeholders for widgets that no longer exist

- **`/category/[slug]` reserved six filter pills.** After SLOP-DETAIL-1 (A07) a category renders
  a filter bar only when it holds more than `FILTER_MIN_DOCUMENTS` documents *and* at least one
  derived facet would narrow the list. **No category in the dataset qualifies**, so this
  placeholder promised a control that then never arrived — on every category load, without
  exception. Removed.

- **`/posts/[slug]` reserved `grid grid-cols-1 md:grid-cols-2 gap-4` holding two cards.** That is
  the exact shape of `PostNavCards` (Previous/Next Post), which SLOP-REMOVE-1 deleted under A11.
  Checked against history rather than assumed: `git show 1a32e62:…/PostNavCards.tsx` opens with
  that same class string. This is the literal case A17 names — a decorative placeholder card for a
  widget that should be removed. Replaced with the one thing that does follow the document body
  now: a single back link to its category.

### Sizes corrected against the rendered page

Every block was measured in Chromium rather than estimated, at 390×844 and 1440×1000:

| Block | Reserved | Actually renders |
| --- | --- | --- |
| Home / orders document row | `h-28` (112px) | **187 / 124px** |
| Orders category row | `h-12` (48px) | **74 / 77px** |
| Orders masthead | `h-44` (176px) | **239 / 246px** |
| Orders closing GOIR note | *nothing* | **132 / 87px** |
| Category masthead | `h-40` (160px) | **248 / 247px** |
| Category log row | `h-28` (112px) | **232 / 177px** |
| Category gazette footer | *nothing* | **49 / 33px** |
| Search recent row | `h-16` (64px) | **88 / 73px** |

Row counts were cut to what the first viewport actually needs (four on the homepage, three on a
category) rather than a full page of documents: reserving the whole list would put a screen and a
half of grey blocks below the fold, which is its own kind of dishonesty about what is arriving.

`/search` keeps its pill row, and that is deliberate — unlike the category page's, it stands for
the document-type control (All · GO · Circular · Memo · Proceeding · Notification · Other) which
renders on every visit. It was six chips for a seven-option control, so `TYPE_FILTERS` is now
exported from `SearchUI` and the skeleton derives its count from the control itself. A number
copied by hand is what let it drift in the first place.

### A negative result, reported as such

The working assumption behind the size corrections was that they would reduce layout shift. **They
do not, and the measurement says so.** Cumulative Layout Shift was captured with a
`PerformanceObserver` across the skeleton→content transition, on a client-side navigation with
1200ms of emulated latency so `loading.tsx` was genuinely on screen:

| Route | Before | After |
| --- | --- | --- |
| `/orders` @390 | 0.0004 | **0.0004** |
| `/category/*` @390 | 0.0000 | **0.0000** |
| `/posts/*` @390 | 0.0000 | **0.0000** |
| `/search` @390 | 0.0000 | **0.0000** |
| `/category/*` @1440 | 0.0008 | **0.0008** |
| `/posts/*` @1440 | 0.0008 | **0.0008** |

Identical, and already far below the 0.1 "good" threshold. (One run showed 0.0011 on `/orders`;
re-running returned 0.0004, so that was noise, not a regression.) The reason is structural: Next
swaps the entire `loading.tsx` subtree for the entire page subtree in one commit, so there is no
sequence of visible elements being pushed down the screen — which is what the metric counts.

So the size corrections are justified on the narrower ground that a placeholder reserving 112px
for a 187px row is simply wrong about the page it stands for, and a reader watching a phone screen
sees a shape that does not become the shape that arrives. That is worth fixing. It is not worth
claiming a performance win for, and this gate does not.

### Test changes

- New `test/loading-states.test.tsx` (7 cases). The rule they encode: **a skeleton may only
  reserve a structure the loaded page can actually render.** Each is paired against a case in the
  second describe block, because "the category skeleton has no pills" and "the detail skeleton has
  no card grid" would both pass on an empty component.
- The search chip count is asserted as `TYPE_FILTERS.length + 1` rather than `7`, so the
  placeholder cannot drift from the control again without failing.
- The block-count guard asserts **exact** per-route counts, not a floor. The first version used
  "at least four blocks" and a mutation that deleted a block sailed through it — the skeleton *is*
  the geometry, so losing one is the defect.
- **Mutation-checked, 8 of 8 caught** after that fix: category pills reintroduced, the
  PostNavCards grid reintroduced, the search chip count drifted to six, home rows returned to
  `h-28`, orders rows returned to `h-28`, `role="status"` removed, a block deleted, and a block
  added.

### Verification

`tsc --noEmit` clean · **67 files / 487 tests pass** (from 66/480) · `git diff --check` clean ·
real-Chromium measurement of every skeleton's geometry and of CLS across the skeleton→content
transition at 390×844 and 1440×1000.

### Deliberately not done here

- **`/` and `/orders` keep rendering real chrome in their skeletons** — `DesktopLeftNav` and
  `Breadcrumb` respectively. Both are static and need no route data, so showing them immediately
  is better than grey blocks, and A17 never asked otherwise.
- **The detail skeleton deliberately under-reserves the document body.** Body length is unknowable
  before the document arrives, and over-reserving would create a scrollbar that then collapses.
- **A16 stays deferred.** A18's empty/error/404 states remain untouched and protected — this gate
  covered loading states only, which is what A17 is about.
