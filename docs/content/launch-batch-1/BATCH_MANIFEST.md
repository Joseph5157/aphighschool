# LAUNCH-CONTENT-BATCH-1: batch manifest

Prepared: 26 November 2026
Branch: `content/launch-batch-1`
Application-code changes: none
Production-content changes: none. Nothing has been entered in or published to the CMS

## Inputs and method

- **Brief:** the founder's launch brief as pasted in the session (competitor list, 15 topics,
  18-post priority order). The linked `AP_TEACHER_DESK_CLAUDE_LAUNCH_BRIEF.md` and
  `AP_Teacher_Desk_CONTENT_KEYWORDS_1.xlsx` are behind a ChatGPT login and could not be opened.
  Keyword wording therefore comes from the brief's topic list, `lib/terminology.ts` and existing
  packs. The workbook's 52 phrases have not been cross-checked.
- **Competitors:** used only as discovery signals, through search-result titles. No competitor
  text, table, image or factual claim was copied. Every fact below was read from an official
  PDF or register.
- **Official verification:** GOIR (goir.ap.gov.in) registers searched in a browser: School
  Education G.O.Ms 01.05.2025–26.11.2026, Finance G.O.Ms 01.07.2026–26.11.2026, plus keyword
  searches. GO PDFs were downloaded from GOIR's own `dgo.ashx` links. The AP TET–DSC portal
  (tet2dsc.apcfss.in) document index was read from its published app bundle, and each PDF was fetched.

## Classification key

`READY` verified official sources support the post · `REFERENCE_ONLY` official event closed,
document still useful · `BLOCKED` required official evidence unavailable · `TIME_SENSITIVE`
application/result/deadline content needing the final pre-import status check.

## Drafted posts (all `isDraft: true`, none entered)

| # | Draft file | Topic | Post type | Class | Official sources | Category (slug) | Document reference | Deadline / freshness | Related Orders | Telugu | CMS readiness |
| ---: | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | `dsc-2026-notification-apply-online.md` (PR #11, unchanged) | DSC regular SA/SGT | Action post | TIME_SENSITIVE | Portal; Notification No.01 PDF (unchanged file) | `notifications` | Notification No.01/DSC-TRC-1/2026 | Apply closes 30 Nov 2026; still open on 26 Nov | GO 52: **now drafted (#6)**; link at entry | approved | Ready after pre-import check |
| 2 | `dsc-2026-syllabus-exam-pattern.md` | DSC syllabus/pattern | Document guide | READY | Revised syllabus; Spl Edn revised syllabus; General Posts IB | **decision**: `other` → no category | none (multi-document) | Recheck on new syllabus/CBT schedule | Pending (#1, #6) | pending | Ready after category decision |
| 3 | `dsc-2026-vacancies-official-guide.md` | DSC vacancies | Document guide (no figures) | READY | Notifications No.01/02/03; brief notifications | **decision**: `other` → no category | none (multi-document) | Recheck on corrigendum | Pending (#1, #4, #5) | pending | Ready after category decision |
| 4 | `dsc-2026-special-education-notification.md` | DSC Special Education | Action post | TIME_SENSITIVE | Notification No.02 PDF; Spl Edn IB; portal | `notifications` | Notification No.02/DSC-TRC-1/2026 | Apply closes 30 Nov 2026 | GO 51: pending, not blocking | pending | Ready after pre-import check |
| 5 | `dsc-2026-societies-notification.md` | DSC Societies | Action post | TIME_SENSITIVE | Notification No.03 (rev) PDF; Societies IB; portal | `notifications` | Notification No.03/DSC-TRC-1/2026 | Apply closes 30 Nov 2026 | GO 50: pending, not blocking | pending | Ready after pre-import check |
| 6 | `go-52-aptrt-2026-selection-rules.md` | DSC rules | GO reference | READY | GOIR G.O.Ms.No.52 | `govt-orders` | G.O.Ms.No.52 | Standing | Target of #1's background link | pending | Ready |
| 7 | `go-22-teacher-transfer-rules-2025.md` | Transfers | GO reference | READY | GOIR G.O.Ms.No.22; GOIR amendment search | `govt-orders` | G.O.Ms.No.22 | Standing; recheck GOIR before entry | GO 21 background: confirm CMS post ID | pending | Ready |
| 8 | `ap-special-tet-august-2026-results.md` | AP TET (Special, in-service) | Result post | TIME_SENSITIVE | Special APTET notification 24.08.2026; results press note | `notifications` | **decision**: official number fails validator | Results live via login; no expiry date | GO 36 (2025) background: confirm CMS post | pending | Ready after reference decision |
| 9 | `go-120-da-41-86-percent.md` | DA | GO reference | READY | GOIR G.O.Ms.No.120 | `govt-orders` | G.O.Ms.No.120 | Arrears due 2028; review on new DA order | GO 119 (#10) background | pending | Ready |
| 10 | `go-119-da-40-04-percent.md` | DA | GO reference | READY | GOIR G.O.Ms.No.119 | `govt-orders` | G.O.Ms.No.119 | Arrears due 2027 | Linked from #9 | pending | Ready |
| 11 | `go-158-cps-ops-option-guidelines.md` | Pension (CPS→OPS) | GO explainer | TIME_SENSITIVE | GOIR G.O.Ms.No.158 and 53 | `govt-orders` | G.O.Ms.No.158 | Option closes 31 Dec 2026; **decision** on `actionDeadline` | Implements GO 53 (#12) | pending | Ready after pre-import check |
| 12 | `go-53-cps-ops-one-time-option.md` | Pension (CPS→OPS) | GO reference | READY | GOIR G.O.Ms.No.53 (Finance) | `govt-orders` | G.O.Ms.No.53 | Standing | Linked from #11 | pending | Ready |
| 13 | `go-35-government-schools-adhoc-rules-2026.md` | Service Rules | GO document guide | READY | GOIR G.O.Ms.No.35; GOIR register | `govt-orders` | G.O.Ms.No.35 | Standing | GO 11 (2009) superseded, not in CMS | pending | Ready |
| 14 | `go-36-mpp-zpp-teachers-adhoc-rules-2026.md` | Service Rules | GO document guide | READY | GOIR G.O.Ms.No.36 (2026) | `govt-orders` | G.O.Ms.No.36 | Standing | GO 12 (2009) superseded, not in CMS | pending | Ready |

Recommended CMS entry order (so Related Orders can be linked as each post is entered):
6 → 1 → 4 → 5 → 2 → 3 → 7 → 8 → 10 → 9 → 12 → 11 → 13 → 14.

## Brief priority list: status of all 18 topics

| Brief # | Topic | Result |
| ---: | --- | --- |
| 1 | AP DSC 2026 notification and apply online | Drafted earlier (PR #11); rechecked (#1) |
| 2 | AP DSC syllabus and exam pattern | Drafted (#2) |
| 3 | AP DSC vacancies: official annexure guide | Drafted (#3), prose only |
| 4 | AP DSC Special Education notification | Drafted (#4) |
| 5 | AP DSC Societies recruitment notification | Drafted (#5) |
| 6 | G.O.Ms.No.22 teacher transfer rules | Drafted (#7) |
| 7 | Current AP TET notification hub | Special TET results drafted (#8). A regular current-cycle hub is BLOCKED: no regular notification after June 2026 is listed on the portal |
| 8 | AP School Education Service Rules 2026 | GO 35 and GO 36 drafted (#13, #14); GO 37–48 located on GOIR, not yet read (next batch) |
| 9 | CPS-to-OPS one-time option | Drafted (#11, #12) |
| 10 | TIS update and seniority-list preparation | BLOCKED: no official CSE proceeding located; GOIR does not index CSE proceedings |
| 11 | Latest DA and arrears | Drafted (#9, #10); pensioner DR GOs 121/122 verified, not drafted |
| 12 | Inter-district, mutual and spouse transfers | BLOCKED: no ground-specific official order located in the GOIR School Education register |
| 13 | Leave-sanctioning powers | Not researched this batch |
| 14 | Pension, PPO, gratuity and RBPS/NIDHI | Not researched this batch (beyond CPS→OPS) |
| 15 | CFMS payslip and bill status | Not researched this batch |
| 16 | Separate GPF, ZPPF and APGLI guides | Not researched this batch |
| 17 | Current academic calendar and FA/SA documents | Not researched this batch |
| 18 | Rationalisation, PTR and re-apportionment | GO 21 (13.05.2025) and its amendment GO 33 (31.07.2025) located on GOIR; drafting deferred because both orders are mostly numeric norms that must stay in the PDF |

Event-driven items (hall tickets, keys, results, counselling, calculators) remain on hold until
each official action is live.

## Founder decisions needed before CMS import

1. **Multi-document guides (#2, #3):** `documentType: other` leaves them with no category. Either
   accept uncategorised guides or tie each to Notification No.01 as `notification` posts.
2. **Special TET reference (#8):** the official number "Notification No.01–AP SPL-TET-August-2026"
   fails the document-reference validator (space and en dash). Recommendation: leave
   `goReference` empty and state the number in the body. The alternative is an approved
   normalised form. Changing the validator would be a separate code gate.
3. **CPS→OPS `actionDeadline` (#11):** set 31.12.2026 on a GO post that has no action URL?
   Recommendation: yes, so freshness logic flags it after the deadline.
4. **Batch CMS draft import:** one approval for entering all 14 as drafts. The production-write
   step has not been started.

## Disputed or unclear official wording (kept out of posts)

- Special Education notification para 20 gives the qualification cut-off as 04.11.2026 while the
  notification is dated 05.11.2026 (Societies uses 05.11.2026).
- The Special TET notification para 2 mentions teachers "appointed prior to 2011", but paras 3 and 5 define eligibility without that date.
- The Special TET notification says the exam runs "11.10.2026 onwards"; the results press note records it as held 11–15 October. The post uses the press note.
- The Special TET results press note has no date of its own; the date 16.11.2026 comes from the portal menu label.

## Pre-import consolidated status check (to run once, immediately before CMS import)

- DSC portal: application end date and any extension/corrigendum (#1, #4, #5). If closed,
  convert those three to REFERENCE_ONLY per each draft's expiry rule and never show the apply link.
- GOIR Finance: any extension of the 31.12.2026 CPS→OPS deadline (#11); any newer DA order (#9).
- GOIR School Education: any amendment to GO 22, 35, 36 or 52.
- Portal TET menu: Special TET result access still listed (#8); any new regular TET notification.
