# AP Teacher Desk post template

Use this template only after the corresponding research pack is approved for drafting. Remove
unused sections rather than filling a short post with repetition. Editorial instructions and
source records must not appear in the public article body.

## Non-negotiable rules

1. AP School Education and AP teachers only.
2. Competitors are discovery sources, never publication evidence.
3. Every date, number, rule and action link must be traceable to an official source.
4. Never transcribe vacancy grids, pay scales, PTR tables, eligibility matrices or other
   numeric tables from a PDF into the post body. Link the official PDF.
5. Do not call an unofficial answer key, result, list or calculator official.
6. Do not show an action button before the official action is live or after it expires.
7. Telugu must be natural administrative Telugu, not transliterated English.
8. Distinguish a GO, proceeding, memo, circular and notification correctly.
9. Record Related Orders when a document amends, supersedes, clarifies or depends on another
   order. Never infer the relationship.
10. Keep the CMS record as `isDraft: true` until the human quality review passes.

## Required inputs

- Approved research-pack path
- Intended reader and teacher question
- Exact official source URL and, when applicable, PDF URL
- Official document number and date
- Current lifecycle or order state
- Review or expiry trigger
- Known Related Orders

If any required source is missing, stop and return an editorial blocker.

## CMS fields

Return this table before the article body.

| CMS field | Required output |
| --- | --- |
| `slug` | Stable, lowercase, descriptive slug |
| `titleEn` | Specific English title naming the document or teacher task |
| `titleTe` | Natural Telugu title |
| `summaryTe` | Three to six short Telugu bullet lines |
| `englishAbstract` | Concise scope and practical effect; no copied table data |
| `documentType` | `go`, `circular`, `memo`, `proceeding`, `notification`, `other` or `null` |
| `orderState` | `current`, `amended`, `superseded` or `archived` |
| `categoryId` | `id` of an existing `Category` row matching the document type, looked up by slug (e.g. `notifications`) and reported with that slug; `null` and flagged if none fits. Never create, rename or guess one |
| `documentDate` | Official issue date only; never inferred |
| `statusBadge` | Recruitment notifications only: `notification`, `apply_link`, `hall_ticket`, `results` or `expired` |
| `tags` | Canonical tags from `lib/terminology.ts` only |
| `goReference` | Exact valid GO, memo, circular or proceeding reference when established |
| `sourceDept` | Issuing department or authority |
| `sourceUrl` | Exact official page used to verify the record |
| `pdfUrl` | Official document PDF or approved stored PDF |
| `actionUrl` | Live official task link only |
| `actionDeadline` | Official deadline only |
| `verifiedAgainstGoir` | `true` only for an exact GOIR source URL |
| `relatedOrders` | Existing post IDs plus authored relationship notes; otherwise explain why none applies |
| `isDraft` | Always `true` in generated output |

## SEO fields

- SEO title: specific topic and year where the official material is year-bound.
- Meta description: scope, practical action and official-source value in plain language.
- Search aliases: approved English, Telugu and common teacher terms from the research pack.

SEO wording must not broaden the verified scope.

## Public article structure

### Current status

One short line stating whether the document is current, amended, superseded, archived, open,
closed or awaiting an official action. Include a deadline only when verified.

### Telugu summary

Lead with natural Telugu explaining:

- what was issued or changed;
- who is affected;
- what the teacher should do now, if anything.

### At a glance

Use five to eight short facts. Do not reproduce a source table.

### Scope

State the covered post, cadre, management, district, applicant group or school type. State the
important exclusions near the scope, not in a distant disclaimer.

### Verified explanation

Choose only the sections needed for this topic:

- What changed
- Who is covered
- Eligibility or applicable rule in plain prose
- Important dates
- How to use the official service
- What teachers should check
- What happens next

For a document with four or more meaningful headings, the public template can provide a page
index. Do not create headings merely to trigger it.

### Official documents and actions

Use at most three primary actions with task-specific labels such as:

- Apply on official portal
- Download official notification
- Open GO PDF
- Check application status

Never use a dead, speculative or competitor link as an action.

### Frequently asked questions

Include only questions supported by the official material or needed to prevent a likely
misreading. Keep answers direct and scoped.

### Official-source note

State the verification date, document name/number/date and the rule that a later amendment or
replacement prevails.

Keep the AP Teacher Desk independence statement.

## Editorial output after the article

Return these sections outside the public body:

1. **Source traceability:** each material claim and its official source.
2. **Expiry/update rule:** exact date or event that requires review.
3. **Do not publish:** unsupported claims, copied tables and missing links.
4. **Quality checklist:** source verification, Telugu accuracy, no transcribed tables,
   Related Orders and lifecycle stage.

Do not recommend publication while any required checklist item fails.
