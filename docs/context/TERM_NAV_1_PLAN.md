# TERM-NAV-1 — Teacher terminology and navigation audit

Date: 24 November 2026  
Status: **AUDIT COMPLETE — IMPLEMENTATION NOT STARTED**  
Branch: `audit/term-nav-1`  
Application changes in this gate: **none**

## 1. Purpose

AP Teacher Desk should use the words Andhra Pradesh teachers already use when they look for
orders, service guidance and calculators. The goal is not to imitate another website. It is to
reduce the translation a teacher must do between their real question and the portal's labels.

This audit separates four vocabularies that the current interface sometimes mixes:

1. **Navigation destinations** — Home, Search, Tools and Pension.
2. **Official document types** — GO, Proceedings, Memo, Circular and Notification.
3. **Teacher topics** — Transfers, Service Rules, Leave Rules, PRC, DA, DSC and so on.
4. **Actions** — Apply Online, Open PDF, Check Status, Download Hall Ticket and View Results.

These are different dimensions. A Proceedings document can concern Transfers and contain an
Apply Online action. They must not be collapsed into one category system.

## 2. Product boundary

Competitor and union websites are useful as **terminology and coverage evidence**. They are not
authoritative sources for AP Teacher Desk content.

Allowed uses:

- identify the phrases teachers repeatedly encounter;
- find abbreviations and spelling variants teachers search for;
- discover missing subject areas;
- compare how documents are grouped and labelled;
- identify a candidate document for later official-source verification.

Not allowed:

- copying competitor articles, images, summaries or page layouts;
- hotlinking competitor assets;
- treating a competitor page as proof that an order is current;
- automatically publishing material collected from another portal;
- replacing the official PDF or department page with a competitor link.

Source priority remains:

1. official GO, Gazette, Proceedings, Memo, Circular or Notification;
2. official AP department/agency portal;
3. competitor, association or union page for discovery only.

## 3. Evidence reviewed

### AP teacher portals and associations

- Amaravathi Teacher — uses `AP Teachers Latest Updates`, `Teachers GOs`, `G.O.Ms.No.`,
  `Rc.No.` and `Download Proceedings`; current posts prominently use Transfers, Service Rules,
  SA/SGT/HM, seniority and recruitment vocabulary.
- APTeachers.in — primary group labels include `GOs`, `Proceedings`, `Leave Rules`, `EHS
  Health` and `Service Rules`; detailed sections use PRC, DA, GPF/ZPPF, APGLI, CPS/PRAN, CCE,
  Transfers and Rationalization.
- TeachersBadi — consistently combines the document identifier with the teacher task, for
  example `GO.38 AP Teachers Transfers Guidelines & Norms` and `Rc.25 ... Transfers /
  Rationalisation`.
- State Teachers Union AP — uses `A.P. GOs & Circular Memos`, `Proceedings`, `Teacher Transfer
  Online Application`, `DA`, `Child Care Leave`, `Medical Reimbursement` and named software.
- APUTF — separates `Latest GOs`, `Proceedings & Memos`, `Service Rules`, `Promotions &
  Seniority`, and `Rationalisation & Transfers`.

### Official AP sources

- Department of School Education uses `Teachers Transfers`, `APTET`, `Important Links`,
  `Proceeding/RC Type`, `Online Application` and `Web Counselling`.
- Official documents use precise identifiers including `G.O.Ms.No.`, `Memo No.`, `Circular
  Memo No.` and `Rc.No.`.
- Official transfer rules repeatedly use Headmaster Gr.II, School Assistant, Secondary Grade
  Teacher, ZPP/MPP, entitlement points, preferential category, vacancies and counselling.

### Public evidence links

- <https://amaravathiteacher.com/category/latest-g-os/>
- <https://amaravathiteacher.com/category/teachers-gos/>
- <https://www.apteachers.in/>
- <https://teachersbadi.in/go38-ap-teachers-transfers-rules-2012-guidelines/>
- <https://www.stuap.in/>
- <https://www.aputf.org/gos/proceedings-memos/>
- <https://www.aputf.org/gos/chapter-3/>
- <https://www.aputf.org/gos/chapter-4/>
- <https://www.aputf.org/gos/chapter-6/>
- <https://cse.ap.gov.in/>
- <https://cse.ap.gov.in/DSE/>

These public labels show the vocabulary publishers put in front of teachers. They do not provide
search-volume data and are not a substitute for observing teachers complete real tasks. That is
why `TERM-TEACHER-CHECK-1` remains part of the plan.

### Repository surfaces inspected

- `BottomNav`, `DesktopNav` and the mobile drawer;
- Home document filters and topic chips;
- Orders, Search, Topics, Teacher Service Desk, Tools and Pensioners pages;
- post cards, lifecycle labels, document dates and official-source actions;
- Prisma document types, post status, lifecycle state, categories and tags;
- current search query behaviour and suggested-search safeguards.

## 4. Main findings

### F1 — `Living Documents` is product language, not teacher language

The home heading `Latest Orders & Living Documents` describes the product model, but teachers
do not normally look for a “living document.” They look for a latest GO, Proceedings, Memo,
Notification, transfer update or exam update.

**Decision:** replace the visible phrase with `Latest Teacher Updates`. Keep lifecycle behaviour;
do not remove the underlying current/amended/superseded model.

### F2 — `Orders & Circulars` omits the terms teachers most often distinguish

The route also contains Proceedings, Memos and Notifications. Competitor and official sources
repeatedly expose `GOs` and `Proceedings` as the strongest labels.

**Decision:** use `GOs & Proceedings` as the long navigation label. Use `GOs` in the constrained
mobile bottom bar. The page description must still name all supported document types.

### F3 — standard interface words should not be renamed without a gain

`Home` and `Search` are familiar, unambiguous and already used by competitor sites. Replacing
Home with Latest would make the home icon and label disagree with a standard navigation
expectation.

**Decision:** keep `Home` and `Search` unchanged. Put `Latest Teacher Updates` in the home page
heading, where it describes the content rather than the destination.

### F4 — `Service Desk` sounds like support, but the route is a task directory

The page does not open a ticket or contact support. It routes teachers to pay, leave, CFMS,
GPF/APGLI, pension and official-document tasks.

**Decision:** rename the navigation destination and breadcrumb to `Teacher Services`. Keep its
task-first page heading `What do you need help with?`.

### F5 — generic action labels hide the reason to tap

`Open action link` is technically true but does not tell a teacher whether the link applies,
checks status, opens counselling or shows results. `Open document PDF` similarly misses the
document type already known to the post.

**Decision:** derive PDF labels from `documentType`, but never guess an external action's purpose.
Add an authored action kind before replacing `Open action link`.

### F6 — the document taxonomy is sound; topic coverage is incomplete

The closed `DocType` set already matches real official language: GO, Circular, Memo,
Proceedings and Notification. The topic layer currently exposes only Transfers/PTR, TET, DSC,
PRC/DA, Pension and a few service guides. Teacher portals consistently expose Leave Rules,
Service Rules, Promotions/Seniority, EHS, GPF/APGLI and school administration as first-class
subjects.

**Decision:** preserve `DocType`. Expand canonical topic tags; do not create topic-shaped document
types or duplicate topic categories in `Category`.

### F7 — search currently recognises text, not teacher vocabulary equivalence

A Telugu term, English term and abbreviation are separate literal searches today. For example,
`జీవో`, `GO`, `G.O.` and `Government Order` do not deliberately resolve to one intent. The same
problem affects rationalisation/re-apportionment/PTR and leave abbreviations.

**Decision:** add a controlled alias layer. Store one canonical topic key; expand recognised
queries at search time. Literal search remains available and unknown queries must not be widened.

### F8 — English and Telugu should not be forced into every navigation slot

Five dual-language bottom labels would become long and hard to scan. Telugu is better served by
proper Telugu page headings, topic chips, summaries and aliases than by cramped bilingual chrome.

**Decision:** keep the bottom navigation short and English. Use Telugu alongside English in page
headings and topic discovery. Every canonical term still needs Telugu search aliases.

## 5. Navigation decision

Routes do not change. Only the visible terms change.

### Mobile and tablet bottom navigation

| Position | Route | Current | Recommended target | Verdict |
| --- | --- | --- | --- | --- |
| 1 | `/` | Home | **Home** | KEEP |
| 2 | `/orders` | Orders | **GOs** | REFINE |
| 3 | `/search` | Search | **Search** | KEEP |
| 4 | `/tools` | Tools | **Tools** | KEEP |
| 5 | `/pensioners` | Pensioners | **Pension** | REFINE |

The accessible name for the compact `GOs` destination should be `GOs, Proceedings and Memos`.

### Desktop navigation and mobile drawer

| Route | Current | Recommended target | Verdict |
| --- | --- | --- | --- |
| `/` | Home | **Home** | KEEP |
| `/orders` | Orders & Circulars | **GOs & Proceedings** | REFINE |
| `/tools` | Utility Tools | **Teacher Tools** | REFINE |
| `/service-desk` | Service Desk | **Teacher Services** | REFINE |
| `/pensioners` | Pensioners Hub | **Pension & Retirement** | REFINE |
| `/search` | Search | **Search** | KEEP |

The order of destinations remains unchanged. Search stays in its existing location; the earlier
navigation audit already found no reason to add another Search control.

### Page-level labels

| Surface | Current | Recommended target |
| --- | --- | --- |
| Home heading | Latest Orders & Living Documents | **Latest Teacher Updates** |
| Home subtitle | Government Orders & Guidance | **GOs, Proceedings, Memos and important deadlines** |
| Home all filter | All Documents | **All Updates** |
| Orders page/breadcrumb | Orders & Circulars Hub | **GOs & Proceedings** |
| Orders Telugu subtitle | ఉత్తర్వులు & సర్క్యులర్లు — వర్గాల వారీగా | **జీవోలు, ప్రొసీడింగ్స్ & మెమోలు** |
| Orders recent section | Latest documents | **Latest Updates** |
| Search heading | Search Portal | **Search GOs & Updates** |
| Topics heading | Browse teacher topics | **Browse by Teacher Topic** |
| Tools breadcrumb | Utility Tools | **Teacher Tools** |
| Pension breadcrumb | Pensioners Hub | **Pension & Retirement** |
| Post fallback link | Browse Orders & Circulars | **Browse GOs & Proceedings** |

## 6. Canonical document terminology

`canonical key` is stored. Display labels and aliases are presentation/search data.

| Canonical key | Primary display | Telugu display | Search aliases |
| --- | --- | --- | --- |
| `go` | GOs | జీవోలు / ప్రభుత్వ ఉత్తర్వులు | GO, G.O., G.O.Ms.No, GO copy, Government Order, ఉత్తర్వులు |
| `proceeding` | Proceedings | ప్రొసీడింగ్స్ | Proceeding, Proceedings, Proc., Rc, Rc.No., కార్యాలయ ఉత్తర్వులు |
| `memo` | Memos | మెమోలు | Memo, Memorandum, Circular Memo, మెమో |
| `circular` | Circulars | సర్క్యులర్లు | Circular, Cir., సర్క్యులర్ |
| `notification` | Notifications | నోటిఫికేషన్లు / ప్రకటనలు | Notification, Notice, ప్రకటన, నోటిఫికేషన్ |

`other` remains an internal fallback and should not become a primary filter label.

## 7. Canonical teacher-topic terminology

| Canonical tag | Primary display | Telugu display | Important aliases |
| --- | --- | --- | --- |
| `Transfers` | Teacher Transfers | ఉపాధ్యాయ బదిలీలు | transfer, బదిలీలు, counselling, web counselling |
| `Rationalisation` | Rationalisation & Re-apportionment | రేషనలైజేషన్ / హేతుబద్ధీకరణ | rationalization, reapportionment, re-apportionment, PTR, surplus teacher |
| `Promotions` | Promotions & Seniority | పదోన్నతులు & సీనియారిటీ | promotion, seniority, panel, vacancy |
| `Service Rules` | Service Rules | సర్వీస్ రూల్స్ / సేవా నిబంధనలు | APSSR, probation, regularisation, cadre |
| `Leave Rules` | Leave Rules | సెలవు నిబంధనలు | EL, HPL, CCL, CL, EOL, surrender leave, earned leave |
| `PRC` | PRC & Pay Fixation | పీఆర్‌సీ & పే ఫిక్సేషన్ | RPS, revised pay scales, fitment, AAS |
| `DA` | DA & Arrears | డీఏ & బకాయిలు | dearness allowance, DA arrears, DR |
| `DSC` | DSC Recruitment | డీఎస్సీ నియామకాలు | TRT, recruitment, SA posts, SGT posts |
| `TET` | AP TET | ఏపీ టెట్ | APTET, teacher eligibility test |
| `Exams` | Exams & SCERT | పరీక్షలు & ఎస్సీఈఆర్టీ | SA1, SA2, FA, CCE, answer key, model paper, LEAP |
| `School Administration` | School Administration | పాఠశాల నిర్వహణ | MDM/PM POSHAN, UDISE, academic calendar, Nadu Nedu, grants |
| `CFMS` | CFMS & Bills | సిఎఫ్‌ఎమ్‌ఎస్ & బిల్లులు | bill status, payslip, DDO, STO, treasury |
| `GPF/APGLI` | GPF, ZPPF & APGLI | జీపీఎఫ్, జడ్పీపీఎఫ్ & ఏపీజీఎల్ఐ | provident fund, annual slip, policy, loan |
| `EHS` | EHS & Medical Reimbursement | ఈహెచ్ఎస్ & వైద్య రీయింబర్స్‌మెంట్ | health card, referral hospital, MR bill |
| `Pension` | Pension & Retirement | పెన్షన్ & పదవీ విరమణ | retirement, gratuity, DCRG, commutation, PPO, AG, DR |

Topic chips must continue to appear only when a published post actually carries the canonical
tag. The existing no-dead-end safeguard stays.

## 8. Role and institution vocabulary

These are search aliases and post metadata, not primary navigation entries.

| Canonical term | Accepted forms |
| --- | --- |
| Secondary Grade Teacher | SGT, ఎస్జీటీ |
| School Assistant | SA, స్కూల్ అసిస్టెంట్ |
| Headmaster Grade II | HM, HM Gr.II, ప్రధానోపాధ్యాయుడు |
| Mandal Educational Officer | MEO, ఎంఈఓ |
| Deputy Educational Officer | DyEO, డిప్యూటీ డీఈఓ |
| District Educational Officer | DEO, డీఈఓ |
| Drawing and Disbursing Officer | DDO, డీడీఓ |
| Regional Joint Director | RJD, ఆర్జేడీ |
| Zilla Parishad / Mandal Parishad | ZP, ZPP, MPP, ZPHS, MPPS, MPUPS |

An acronym must remain visible when it is how teachers search. Expansion may appear in help
text, but the interface should not replace `SGT`, `SA`, `MEO`, `DEO`, `DDO`, `CFMS`, `GPF`,
`APGLI`, `EHS`, `PRC`, `DA`, `TET` or `DSC` with long forms everywhere.

## 9. Lifecycle and action vocabulary

### Document lifecycle

Keep the existing vocabulary for ordinary documents in this gate:

- Current
- Amended
- Superseded
- Archived

This vocabulary is part of AP Teacher Desk's trust model and competitors do not provide a safer
replacement. `Current` must continue to be accompanied on the detail page by the precise
sentence explaining whether the document is in force.

### Recruitment/examination lifecycle

| Current display | Recommended target |
| --- | --- |
| Notified | **Notified** |
| Apply open | **Applications open** |
| Hall ticket | **Hall ticket available** |
| Results | **Results available** |
| Expired | **Closed** |

### Source and action links

Safe to derive from `documentType`:

- `Open GO PDF`
- `Open Proceedings PDF`
- `Open Memo PDF`
- `Open Circular PDF`
- `Open Notification PDF`
- fallback: `Open document PDF`

Must be authored, never inferred from the URL:

- Apply Online
- Open Web Counselling
- Check Application Status
- Download Hall Ticket
- View Answer Key
- View Results
- Open Official Portal

Implementation therefore needs an `actionKind` enum or an explicit validated `actionLabel` in
the CMS. Until that exists, `Open action link` is awkward but safer than a false promise.

Keep these trust labels unchanged:

- Official source
- Issued
- Added to portal
- GOIR Verified

## 10. Search-alias behaviour

### Rules

1. Normalise case, repeated whitespace and harmless punctuation (`G.O.` → `go`).
2. Recognised document aliases may resolve to a `documentType` filter.
3. Recognised topic aliases resolve to one canonical tag plus literal text matching.
4. Telugu and English aliases resolve to the same canonical intent.
5. Unknown text remains an ordinary literal search; it must never broaden to all posts.
6. A document number remains literal. `GO 22`, `G.O.Ms.No.22` and `Rc.No.25` must continue to
   search reference fields, not be reduced to only their document type.
7. Suggested searches and topic chips continue to be hidden when they lead to no published
   content.

### Examples

| User types | Search intent |
| --- | --- |
| `జీవో` / `GO` / `G.O.` | document type: GO |
| `ప్రొసీడింగ్స్` / `Proceedings` | document type: Proceedings |
| `బదిలీలు` / `transfers` | topic: Transfers |
| `PTR` / `reapportionment` / `rationalization` | topic: Rationalisation |
| `EL` / `earned leave` / `ఆర్జిత సెలవు` | topic: Leave Rules plus literal match |
| `SGT promotions` | literal/role: SGT plus topic: Promotions |
| `G.O.Ms.No.22` | literal reference search; do not discard `22` |

## 11. Proposed implementation sequence

Do not combine all terminology work into one large PR.

### `TERM-LABELS-1` — visible navigation and headings

- implement the recommended navigation/page-label table after founder approval;
- retain routes and navigation order;
- update metadata, breadcrumbs, empty states and tests that assert the old labels;
- verify 320, 360, 390, 768, 1024 and 1440 widths in light/dark mode;
- specifically guard the five bottom labels against overlap and truncation.

### `TERM-SEARCH-1` — canonical aliases

- add one typed terminology module;
- normalise known aliases without weakening literal search;
- add English, Telugu, abbreviation and punctuation tests;
- preserve the existing published-content checks for suggestions and topic chips.

### `TERM-TOPICS-1` — topic coverage and content tagging

- add the recommended topic set to discovery surfaces after founder approval;
- audit existing posts and assign canonical tags manually;
- do not display a topic with zero published posts;
- do not invent new categories for topics.

### `TERM-ACTIONS-1` — precise action CTAs

- add an authored `actionKind`/validated action label to the CMS;
- migrate existing action links conservatively;
- derive document-PDF labels from `documentType`;
- never infer action meaning from a URL or post title.

### `TERM-TEACHER-CHECK-1` — real-language acceptance

Ask 5–8 AP teachers to complete these tasks on a phone without coaching:

1. find the latest transfer GO;
2. find an Rc.No. Proceedings;
3. find earned-leave rules;
4. find the PRC calculator;
5. find pension commutation restoration;
6. search in Telugu for a GO;
7. identify whether an order is current or superseded.

Record the words they say before they tap. Change terminology only when repeated evidence beats
the canonical map above.

## 12. Acceptance criteria for implementation

- No route or source-trust behaviour changes accidentally.
- `Home` and `Search` remain stable across all navigation surfaces.
- `GOs`, `Proceedings`, `Memos`, `Circulars` and `Notifications` are used consistently.
- Mobile bottom navigation stays five items, one line each, with 44×44 minimum targets.
- Telugu aliases return the same relevant records as their English equivalents.
- A GO/Rc/Memo reference number remains searchable in its original form.
- Topic and suggestion links never lead to an unsupported empty result.
- Action labels describe the real action and are backed by authored data.
- Competitor material is never auto-published or presented as an official source.
- Existing lifecycle, provenance, dark mode, typography and responsive tests remain green.

## 13. Audit verdict

**READY FOR FOUNDER APPROVAL, NOT READY FOR BLIND BULK RENAMING.**

The current architecture does not need a navigation redesign. It needs a controlled vocabulary
layer and a small set of targeted label changes. The five-destination mobile model, document
type enum, search route, lifecycle model and provenance pattern should remain. The highest-value
changes are:

1. replace internal/product phrases such as `Living Documents` and `Service Desk`;
2. make `GOs` and `Proceedings` the visible document vocabulary;
3. add teacher-topic coverage without mixing it with document types;
4. make Telugu/English/abbreviation searches equivalent;
5. replace generic action links only after the action meaning is explicitly stored.

