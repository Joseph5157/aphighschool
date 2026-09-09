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
| A01 homepage hero | Clear slop — replace | `SLOP-DENSITY-1` |
| A02 homepage rails | Clear slop — strongly simplify | `SLOP-DENSITY-1` |
| A03 emoji icon system | Clear slop — replace/remove | `SLOP-VISUAL-1` |
| A04 sub-12px text | Design debt + slop symptom — fix carefully | `SLOP-VISUAL-1` |
| A05 mono uppercase labels | Design-system drift — simplify | `SLOP-VISUAL-1` |
| A06 orders discovery overload | Clear slop — simplify | `SLOP-DENSITY-1` |
| A07 category filter overload | UX debt — make data-driven/proportional | `SLOP-DETAIL-1` |
| A08 empty Search dashboard | Likely slop — simplify conservatively | `SLOP-DETAIL-1` |
| A09 detail metadata duplication | Design debt — simplify | `SLOP-DETAIL-1` |
| A10 TOC/helper machinery | Clear slop — simplify/remove conditionally | `SLOP-DETAIL-1` |
| A11 latest/prev-next recirculation | Very clear slop — remove | `SLOP-REMOVE-1` ✅ |
| A12 "Utility Suite / Privacy First" | Very clear copy slop — remove | `SLOP-REMOVE-1` ✅ |
| A13 financial sidebar | Slop + trust risk — remove | `SLOP-REMOVE-1` ✅ |
| A14 calculator card steppers/badges | Clear slop — simplify | `SLOP-DENSITY-1` |
| A15 pension "suite" template | Clear slop — simplify | `SLOP-DENSITY-1` |
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
SLOP-DENSITY-1      A01 + A02 + A06 + A14 + A15
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
