# LAUNCH-CONTENT-BATCH-1: batch manifest

Prepared: 26 November 2026; review corrections and consolidated status check applied 26 November 2026 (03:11–03:20 UTC)
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
| 1 | `dsc-2026-notification-apply-online.md` (PR #11, unchanged) | DSC regular SA/SGT | Action post | TIME_SENSITIVE | Portal; Notification No.01 PDF (unchanged file) | `notifications` | Notification No.01/DSC-TRC-1/2026 | Apply closes 30 Nov 2026; still open on 26 Nov | GO 52: **now drafted (#6)**; link at entry | pending batch review | Ready; status check passed 26 Nov |
| 2 | `dsc-2026-syllabus-exam-pattern.md` | DSC syllabus/pattern | Document guide | READY | Revised syllabus; Spl Edn revised syllabus; General Posts IB | `notifications` (`documentType: other`) | none (multi-document) | Recheck on new syllabus/CBT schedule | Pending (#1, #6) | pending batch review | Ready |
| 3 | `dsc-2026-vacancies-official-guide.md` | DSC vacancies | Document guide (no figures) | READY | Notifications No.01/02/03; brief notifications | `notifications` (`documentType: other`) | none (multi-document) | Recheck on corrigendum | Pending (#1, #4, #5) | pending batch review | Ready |
| 4 | `dsc-2026-special-education-notification.md` | DSC Special Education | Action post | TIME_SENSITIVE | Notification No.02 PDF; Spl Edn IB; portal | `notifications` | Notification No.02/DSC-TRC-1/2026 | Apply closes 30 Nov 2026 | GO 51: pending, not blocking | pending batch review | Ready; status check passed 26 Nov |
| 5 | `dsc-2026-societies-notification.md` | DSC Societies | Action post | TIME_SENSITIVE | Notification No.03 (rev) PDF; Societies IB; portal | `notifications` | Notification No.03/DSC-TRC-1/2026 | Apply closes 30 Nov 2026 | GO 50: pending, not blocking | pending batch review | Ready; status check passed 26 Nov |
| 6 | `go-52-aptrt-2026-selection-rules.md` | DSC rules | GO reference | READY | GOIR G.O.Ms.No.52 | `govt-orders` | G.O.Ms.No.52 | Standing | Target of #1's background link | pending batch review | Ready |
| 7 | `go-22-teacher-transfer-rules-2025.md` | Transfers | GO reference | READY | GOIR G.O.Ms.No.22; GOIR amendment search | `govt-orders` | G.O.Ms.No.22 | Standing; recheck GOIR before entry | GO 21 background: confirm CMS post ID | pending batch review | Ready |
| 8 | `ap-special-tet-august-2026-results.md` | AP TET (Special, in-service) | Result post | TIME_SENSITIVE | Special APTET notification 24.08.2026; results press note | `notifications` | `null` (official number stated in body) | Results live via login; no expiry date | GO 36 (2025) background: confirm CMS post | pending batch review | Ready; status check passed 26 Nov |
| 9 | `go-120-da-41-86-percent.md` | DA | GO reference | READY | GOIR G.O.Ms.No.120 | `govt-orders` | G.O.Ms.No.120 | Arrears due 2028; review on new DA order | GO 119 (#10) background | pending batch review | Ready |
| 10 | `go-119-da-40-04-percent.md` | DA | GO reference | READY | GOIR G.O.Ms.No.119 | `govt-orders` | G.O.Ms.No.119 | Arrears due 2027 | Linked from #9 | pending batch review | Ready |
| 11 | `go-158-cps-ops-option-guidelines.md` | Pension (CPS→OPS) | GO explainer | TIME_SENSITIVE | GOIR G.O.Ms.No.158 and 53 | `govt-orders` | G.O.Ms.No.158 | Option closes 31 Dec 2026; `actionDeadline` 2026-12-31 | Implements GO 53 (#12) | pending batch review | Ready; status check passed 26 Nov |
| 12 | `go-53-cps-ops-one-time-option.md` | Pension (CPS→OPS) | GO reference | READY | GOIR G.O.Ms.No.53 (Finance) | `govt-orders` | G.O.Ms.No.53 | Standing | Linked from #11 | pending batch review | Ready |
| 13 | `go-35-government-schools-adhoc-rules-2026.md` | Service Rules | GO document guide | READY | GOIR G.O.Ms.No.35 and 36 | `govt-orders` | G.O.Ms.No.35 | Standing | GO 11 (2009) superseded, not in CMS | pending batch review | Ready |
| 14 | `go-36-mpp-zpp-teachers-adhoc-rules-2026.md` | Service Rules | GO document guide | READY | GOIR G.O.Ms.No.36 (2026) | `govt-orders` | G.O.Ms.No.36 | Standing | GO 12 (2009) superseded, not in CMS | pending batch review | Ready |

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

## Founder decisions (resolved 26 November 2026)

1. **Multi-document guides (#2, #3):** category `notifications`, `documentType` stays `other`. Applied.
2. **Special TET reference (#8):** `goReference` stays `null`; the exact number appears in the article body. Applied. No validator change.
3. **CPS→OPS `actionDeadline` (#11):** `2026-12-31`. Applied.
4. **Telugu:** all items, 1–14, are `pending batch review` until a fluent human reviews them. No Telugu in this batch is recorded as approved.
5. **Superseded PR:** #13 (25 Nov DSC pre-entry recheck) was closed as superseded by the consolidated check below.

**Still open:** one founder approval for the CMS draft import of all 14 posts. Nothing has been written to the CMS.

## PR #14 final-review corrections (applied 26 November 2026)

1. Telugu item 1 is changed to `pending batch review` in the DSC draft, the Telugu review file and this manifest. All claims of founder or fluent Telugu approval are removed.
2. The Special TET results draft (#8) no longer carries the press-note WhatsApp number or the participation/qualification statistics in its summary, body or traceability notes. The official candidate login is kept. Pack facts F10/F11 are marked not for publication.
3. The GO 158 English abstract (#11) now says accepted employees are admitted to the applicable provident-fund account, such as GPF or ZPPF, as applicable.
4. The GO 35 draft (#13) no longer maps GO 37–48 to managements or posts, because those orders were not individually read. It names only GO 36 (read and verified) and says that separate related service-rule orders exist, pending individual verification.

## Disputed or unclear official wording (kept out of posts)

- Special Education notification para 20 gives the qualification cut-off as 04.11.2026 while the
  notification is dated 05.11.2026 (Societies uses 05.11.2026).
- The Special TET notification para 2 mentions teachers "appointed prior to 2011", but paras 3 and 5 define eligibility without that date.
- The Special TET notification says the exam runs "11.10.2026 onwards"; the results press note records it as held 11–15 October. The post uses the press note.
- The Special TET results press note has no date of its own; the date 16.11.2026 comes from the portal menu label.
- GOIR numbering restarts each year: School Education also has a G.O.Ms.No.22 of 2026 (19.09.2026, DEO qualifications) and a G.O.Ms.No.53 of 2026 (17.11.2026, APES amendments). Every title and source field in this batch states the year and department.

## Consolidated official-status check (26 November 2026, 03:11–03:20 UTC)

| Check | Method | Result | Effect |
| --- | --- | --- | --- |
| DSC application window (#1, #4, #5) | Rendered tet2dsc.apcfss.in in a browser; re-read the app bundle | "DSC Application" Start 11.11.2026, End 30.11.2026; notice "AP-DSC-2026 Registrations Are Opened!" Same bundle (`main.9d9ef1e6.js`); document menus identical to the drafting read | Stay TIME_SENSITIVE with apply links |
| DSC extension or corrigendum | Rendered page text and bundle search | None | No change |
| Special TET results (#8) | Rendered page | Notice "SPECIAL TET FOR IN SERVICE TEACHERS-2026 Results Are Now Released!"; "Special TET For In Service Teachers Login" present | `statusBadge: results` confirmed |
| Regular AP TET | Portal TET menus | No new regular notification | Hub stays blocked |
| CPS→OPS deadline (#11, #12) | GOIR Finance: all MS 09.11–26.11.2026; keyword "Pension" MS+RT 09.11–26.11.2026 | Nothing after G.O.Ms.No.158 on the option | 31.12.2026 deadline stands |
| Newer DA order (#9, #10) | GOIR Finance keyword "Dearness", MS+RT 11.09–26.11.2026 | Only G.O.Ms.No.119–122 | GO 120 remains the latest DA order |
| Amendments to GO 22, 35, 36, 52 (#6, #7, #13, #14) | GOIR School Education, all MS+RT 04.11–26.11.2026 (9 orders); earlier register read for 2025–2026 | Only G.O.Ms.No.53 (17.11.2026), which amends the AP Educational Service Rules (G.O.Ms.No.505 of 1998), not these orders | No change |
| Cited PDFs unchanged | MD5 of 18 cited PDFs (10 portal, 8 GOIR) re-downloaded vs the drafting copies | 0 of 18 changed | Drafts still match the sources |

**Repeat this check on import day** if import happens on a later date. In particular, if import
happens on or after 1 December 2026 and no extension is verified, convert #1, #4 and #5 to
REFERENCE_ONLY using each draft's expiry rule, and never show the apply link.
