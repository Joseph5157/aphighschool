# TERM-TOPICS-1 — proposed retagging list

Date: 24 November 2026
Status: **PROPOSAL ONLY — no production content has been changed.** Every edit below needs
separate, explicit founder approval and is made by hand in the CMS.
Source: read-only audit of production (`default_transaction_read_only = on`), 5 published posts,
0 drafts. Canonical topics and legacy-tag rules: `docs/context/TERM_NAV_1_PLAN.md` §7 and the
`TERM-SEARCH-1` / `TERM-TOPICS-1` implementation records; vocabulary in `lib/terminology.ts`.

## What the site shows from current tags (once this gate ships)

| Topic (plan order) | Published posts | Why |
| --- | --- | --- |
| Teacher Transfers | 1 | canonical tag `Transfers` |
| Rationalisation & Re-apportionment | 1 | legacy tag `PTR` (reviewed allowlist) |
| AP TET | 2 | canonical `TET` (Academic Instructors post) + legacy `APTET` |
| Exams & SCERT | 1 | legacy tag `Answer Key` (reviewed allowlist) |

No other topic has a published post, so no other chip or card appears. DSC shows nothing:
`Recruitment` is not topic evidence.

## A. Replace a legacy tag with its canonical tag (founder-reviewed)

| Post | Current tags | Proposed change | Evidence |
| --- | --- | --- | --- |
| `ap-teachers-transfers-seniority-rules-guidelines` | Transfers, PTR, Seniority Points | replace `PTR` → `Rationalisation` | title names "Re-Apportionment Norms" |
| `aptet-response-sheet-calculator-link-2026` | APTET, Response Sheet, Score Calculator, APCFSS | replace `APTET` → `TET` | the post is about APTET |
| `apscert-fa1-question-papers-answer-keys-2026` | APSCERT, FA-1, Question Papers, Answer Key | replace `Answer Key` → `Exams` | FA-1 question papers and answer keys |

After all three are applied, no published post carries `PTR`, `APTET` or `Answer Key`, and the
`legacyTags` allowlist in `lib/terminology.ts` can be emptied in a follow-up change. Topic counts
do not change: each post moves from a legacy tag to the canonical tag of the same topic.

## B. Remove a canonical tag that is not the post's subject

| Post | Current tags | Proposed change | Reason |
| --- | --- | --- | --- |
| `ap-academic-instructors-recruitment-2026-27` | Academic Instructors, DSE AP, Recruitment, TET | remove `TET` **if** TET is only an eligibility requirement for the posts | A recruitment that requires TET is not TET content; it would otherwise be counted under AP TET. Keep `Recruitment` for literal search. **Do not** assign `DSC`. |

If applied, AP TET drops from 2 published posts to 1.

## C. No change

| Post | Current tags | Decision |
| --- | --- | --- |
| `appsc-departmental-tests-notification-material` | APPSC, Departmental Test, GOT88, EOT97 | Leave without a canonical topic for now. It stays fully searchable but appears in no topic chip or card. |
| `ap-teachers-transfers-seniority-rules-guidelines` | (see A) | `Seniority Points` are transfer seniority points. **Not** classified as `Promotions`. |
