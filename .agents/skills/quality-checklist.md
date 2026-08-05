---
name: quality-checklist
description: Walk through the Section 4.1 Quality-First checklist before a post is treated as publish-ready.
---

Before confirming any post (new or edited) is ready to publish, verify and report on each
of these explicitly — don't just say "looks good":

1. **Source verification** — is there a `goReference` and `sourceUrl`? Has
   `verifiedAgainstGoir` been considered (checked against goir.ap.gov.in where available)?
2. **Telugu accuracy** — does `titleTe` / `summaryTe` read as formal/administrative Telugu,
   not colloquial? Flag any term you're unsure of rather than silently approving it.
3. **No transcribed tables/numeric data** — confirm `summaryTe` and `englishAbstract`
   describe eligibility/data in prose, and don't reproduce a PTR table, pay scale table,
   or similar tabular data as text. That data belongs in the PDF only.
4. **Related Orders** — for a post that amends, supersedes, or follows from a prior order,
   is at least one Related Order linked? If none makes sense, say so explicitly rather
   than leaving it silently empty.
5. **Lifecycle stage correctness** — does `statusBadge` match reality (e.g. don't leave
   something as `apply_link` past its `actionDeadline`)?

Report each item as a short checklist in your response. If any item fails, say so plainly
and don't recommend publishing until it's resolved — this is a judgment aid, not a gate
that blocks code from compiling.
