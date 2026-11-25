# Draft: AP DSC 2026 (APTRT-2026) notification and online application

| Draft metadata | Value |
| --- | --- |
| Research pack | `docs/content/research/dsc-2026.md` |
| Template | `docs/content/POST_TEMPLATE.md` (merged in PR #10, `fc29e57`) |
| Post model | Action post: application window open on drafting day |
| Drafted on | 25 November 2026 |
| Same-day official check | 25 November 2026; pre-entry recheck 25 November 2026, 20:51 IST (see below) |
| CMS state | Not entered. Repository draft only; `isDraft: true` when entered |

This file is not production content. Entering it in the CMS, and publishing it, are separate
human steps after the quality review.

## Same-day official status check (25 November 2026)

| Check | Result | Source |
| --- | --- | --- |
| Application window | Portal shows "DSC Application", Start Date 11.11.2026, End Date 30.11.2026; notice "AP-DSC-2026 Registrations Are Opened!" | O1 portal, rendered in a browser |
| Extension or corrigendum | None listed in the portal Notification, Information Bulletin, Syllabus, GO's or Press Note menus | O1 |
| Detailed exam schedule | Portal "Schedule" menu shows "Coming Soon..." | O1 |
| Regular notification PDF (O2) | HTTP 200, PDF; paragraphs 2 and 7 confirm 11.11.2026–30.11.2026 and Rs.1000 per post | O2 |
| Information Bulletin PDF (O3) | HTTP 200, PDF; paragraphs 4–5 confirm per-post fee and single application for several posts | O3 |
| Revised syllabus PDFs (O4, O5) | HTTP 200, PDF; still the two entries in the portal Syllabus menu | O4, O5 |
| Societies bulletin (O6) | HTTP 200, PDF | O6 |

Result: applications are open, so this is drafted as an action post. If the post is entered
on a later day, repeat this check first.

**Pre-entry recheck, 25 November 2026, 20:51 IST:** portal still shows "DSC Application",
Start Date 11.11.2026, End Date 30.11.2026, and "AP-DSC-2026 Registrations Are Opened!". The
Notification, Information Bulletin and Press Note menus list the same documents as earlier, with
no extension or corrigendum. The O2, O3 and O4 PDFs return HTTP 200 with unchanged file sizes.
Status unchanged: action post confirmed.

## CMS fields

| CMS field | Value |
| --- | --- |
| `slug` | `ap-dsc-2026-notification-apply-online` |
| `titleEn` | AP DSC 2026 (APTRT-2026): SA and SGT notification and online application |
| `titleTe` | ఏపీ డీఎస్సీ 2026 (ఏపీ టీఆర్‌టీ–2026): ఎస్‌ఏ, ఎస్‌జీటీ పోస్టుల నోటిఫికేషన్ – ఆన్‌లైన్ దరఖాస్తు వివరాలు |
| `summaryTe` | See "summaryTe lines" below (6 lines) |
| `englishAbstract` | See "englishAbstract" below |
| `documentType` | `notification` |
| `orderState` | `current` |
| `categoryId` | Existing category with slug `notifications` (CMS picker label "Notifications"). Resolve the `id` in the target CMS at entry time; it differs between databases, so no ID is written here. If that category is missing, leave `null` and stop; do not create one |
| `documentDate` | `2026-11-05` (Notification No.01/DSC-TRC-1/2026, Dated: 05.11.2026) |
| `statusBadge` | `apply_link` |
| `tags` | `DSC` |
| `goReference` | `Notification No.01/DSC-TRC-1/2026` (admin label "Document reference"; accepted since PR #12) |
| `sourceDept` | School Education Department, Government of Andhra Pradesh (Director of School Education) |
| `sourceUrl` | `https://tet2dsc.apcfss.in/` |
| `pdfUrl` | `https://tet2dsc.apcfss.in/DSC2026/notifications/School%20Education%20Notification.pdf` |
| `actionUrl` | `https://tet2dsc.apcfss.in/` |
| `actionDeadline` | `2026-11-30` (inclusive IST date since PR #12: open through 30 Nov, closed from 00:00 IST on 1 Dec) |
| `verifiedAgainstGoir` | `false` (source is the official DSC portal, not a GOIR URL) |
| `relatedOrders` | None linked; GO 52 intentionally pending (not a publication blocker). See "Related Orders" below |
| `isDraft` | `true` |

### summaryTe lines

1. ఆంధ్రప్రదేశ్ పాఠశాల విద్యాశాఖ ప్రభుత్వ, జిల్లా పరిషత్, మండల పరిషత్, మున్సిపల్ మరియు మున్సిపల్ కార్పొరేషన్ పాఠశాలల్లో స్కూల్ అసిస్టెంట్ (ఎస్‌ఏ), సెకండరీ గ్రేడ్ టీచర్ (ఎస్‌జీటీ) పోస్టుల భర్తీ కోసం డీఎస్సీ–2026 నోటిఫికేషన్‌ను (నం.01/DSC-TRC-1/2026, తేదీ 05.11.2026) విడుదల చేసింది.
2. ఆన్‌లైన్ దరఖాస్తుల సమర్పణకు, ఫీజు చెల్లింపుకు చివరి తేదీ 30.11.2026. దరఖాస్తులను అధికారిక పోర్టల్ tet2dsc.apcfss.in ద్వారా మాత్రమే సమర్పించాలి.
3. ప్రతి పోస్టుకు దరఖాస్తు ఫీజు ₹1,000. ఒకటి కంటే ఎక్కువ పోస్టులకు ఒకే దరఖాస్తులో ఎంపిక చేసి, ప్రతి పోస్టుకు వేర్వేరుగా ఫీజు చెల్లించాలి.
4. తాత్కాలిక షెడ్యూల్ ప్రకారం కంప్యూటర్ ఆధారిత పరీక్షలు (సీబీటీ) 20.12.2026 నుంచి 13.01.2027 వరకు నిర్వహించనున్నారు. పూర్తి పరీక్ష షెడ్యూల్‌ను అధికారిక వెబ్‌సైట్‌లో ప్రకటిస్తారు.
5. స్పెషల్ ఎడ్యుకేషన్ పోస్టులు, సొసైటీ పాఠశాలల పోస్టులకు వేర్వేరు నోటిఫికేషన్లు, అర్హత నిబంధనలు ఉన్నాయి. అభ్యర్థులు తమకు సంబంధించిన అధికారిక సమాచార బులెటిన్‌ను తప్పనిసరిగా చూడాలి.
6. జిల్లా, సబ్జెక్టు, మేనేజ్‌మెంట్, కేటగిరీ వారీ ఖాళీల వివరాలు అధికారిక నోటిఫికేషన్ పీడీఎఫ్‌లో ఉన్నాయి.

### englishAbstract

The School Education Department's DSC-2026 notification (No.01/DSC-TRC-1/2026, dated
05.11.2026) invites online applications through the Andhra Pradesh Teacher Recruitment Test
(APTRT-2026) for School Assistant and Secondary Grade Teacher posts in Government, Zilla
Parishad, Mandal Parishad, Municipality and Municipal Corporation schools. Applications and fee
payment run on the official portal from 11 to 30 November 2026, at ₹1,000 per post. Special
Education and Societies posts are notified separately with their own qualifications.
District- and subject-wise vacancies are in the official notification PDF.

## SEO fields

- SEO title: AP DSC 2026 (APTRT-2026) notification: SA, SGT online application
- Meta description: DSC-2026 notification No.01/DSC-TRC-1/2026 for School Assistant and
  Secondary Grade Teacher posts in AP: application window, fee per post, official portal and
  documents.
- Search aliases (from the research pack): AP DSC 2026 notification, APTRT 2026 application,
  AP DSC syllabus, ఏపీ డీఎస్సీ 2026 నోటిఫికేషన్, డీఎస్సీ అప్లికేషన్, డీఎస్సీ సిలబస్.
  Search-vocabulary changes stay subject to the terminology approval process; nothing here
  edits `lib/terminology.ts`.

## Article body (`content` HTML)

```html
<h2>Current status</h2>
<p>Online applications are open on the official portal until 30 November 2026. No extension has been announced.</p>

<h2>At a glance</h2>
<ul>
  <li>Document: DSC-2026 Regular Teacher Posts Notification No.01/DSC-TRC-1/2026, dated 05.11.2026, issued by the Director of School Education.</li>
  <li>Recruitment test: Andhra Pradesh Teacher Recruitment Test (APTRT-2026), also referred to as DSC-2026.</li>
  <li>Posts: School Assistant (Languages, Non-Languages, Physical Education) and Secondary Grade Teacher.</li>
  <li>Application and fee payment: 11 to 30 November 2026, online only.</li>
  <li>Application fee: ₹1,000 for each post applied for.</li>
  <li>Computer Based Test: tentatively scheduled between 20 December 2026 and 13 January 2027.</li>
</ul>

<h2>Who this notification covers</h2>
<p>This notification covers School Assistant and Secondary Grade Teacher posts in Government, Zilla Parishad, Mandal Parishad, Municipality and Municipal Corporation schools.</p>
<p>Special Education posts and Societies (residential) posts are notified separately and have their own qualifications and test structure. Check the notification and Information Bulletin for the stream you are applying to; the rules of one stream do not apply to another.</p>

<h2>How to apply</h2>
<ol>
  <li>Read the official Information Bulletin for your stream and confirm you meet the qualifications before paying the fee.</li>
  <li>Apply on the official portal, tet2dsc.apcfss.in, before 30 November 2026.</li>
  <li>To apply for more than one post, submit a single application covering all the posts you choose, and pay a separate fee for each additional post.</li>
</ol>
<p><strong>Already in service?</strong> If you work in Government service, an autonomous body, a local body or a Government-aided institution, including on a temporary, work-charged, contract or outsourcing basis, the notification requires you to inform your Head of Office or Department in writing that you are applying.</p>

<h2>Vacancies</h2>
<p>Vacancies vary by district, subject, management and category. The official figures are in the notification PDF and the portal's Vacancy Abstract; refer to them directly rather than to copied lists.</p>

<h2>Syllabus and exam</h2>
<p>The revised official syllabus for DSC-2026 is on the portal, with a separate revised syllabus for Special Education posts. Use the section for your exact post and subject.</p>
<p>The Computer Based Test is tentatively scheduled between 20 December 2026 and 13 January 2027. The detailed session schedule will be published on the official website, and sessions may change with the number of applicants.</p>

<h2>Official documents and actions</h2>
<ul>
  <li><a href="https://tet2dsc.apcfss.in/">Apply on official portal</a></li>
  <li><a href="https://tet2dsc.apcfss.in/DSC2026/notifications/School%20Education%20Notification.pdf">Download official notification (05.11.2026)</a></li>
  <li><a href="https://tet2dsc.apcfss.in/DSC2026/info_bulletian/School%20Education%20General%20Posts%20Inforamtion%20Bulletin.pdf">Download Information Bulletin: School Education General Posts</a></li>
  <li><a href="https://tet2dsc.apcfss.in/DSC2026/DSC_2026%20Suggestive%20Syllabus%20new1.pdf">Download revised syllabus</a></li>
</ul>

<h2>Frequently asked questions</h2>
<h3>Do I need a separate application for each post?</h3>
<p>No. Submit one application covering every post you choose, and pay ₹1,000 for each post.</p>
<h3>Do the regular SA/SGT rules apply to Special Education or Societies posts?</h3>
<p>No. Those posts have separate notifications, Information Bulletins and qualifications.</p>
<h3>Are the exam dates final?</h3>
<p>No. The notification gives a tentative window from 20 December 2026 to 13 January 2027. Follow the official website for the detailed schedule.</p>

<h2>Official-source note</h2>
<p>Verified on 25 November 2026 against the official AP TET–DSC portal and DSC-2026 Notification No.01/DSC-TRC-1/2026, dated 05.11.2026. Any later corrigendum, extension or replacement notice from the School Education Department prevails over this summary.</p>
<p>AP Teacher Desk is an independent information site and is not affiliated with the Government of Andhra Pradesh.</p>
```

## Related Orders

G.O.Ms.No.52, School Education (Ser.I) Department, dated 04.11.2026 is the order this
notification implements (cited in O2 paragraphs 1 and 11). No portal post for GO 52 exists yet,
so the relationship is **intentionally pending** and, by founder decision (25 Nov 2026), does not
block publication of this time-sensitive post.

Follow-up: prepare a separate GO 52 reference post from its own research pack, then link it to
this post as background during CMS review. Do not create the relationship automatically. GO 50 (Societies) and GO 51 (Special Education) govern other streams and are not
Related Orders for this regular-posts notification.

## Remaining steps before publication

1. Repeat the same-day official portal check immediately before CMS entry; if the window has
   closed without a verified extension, convert this to a clearly labelled reference post
   instead (see "Expiry and update rule").

The earlier CMS blockers are resolved by PR #12: the document reference field accepts the
notification number, and the deadline is treated as an inclusive IST date.

## Source traceability

| Claim | Source |
| --- | --- |
| Notification number, date, issuer, SA/SGT posts and managements | O2 header, paragraphs 1–2, signature |
| Application window 11.11.2026–30.11.2026 | O1 (rendered 25 Nov 2026), O2 paragraphs 2 and 7, O3 paragraph 4 |
| ₹1,000 per post | O2 paragraph 7, O3 paragraph 4 |
| Single application for several posts, fee per additional post | O3 paragraph 5 |
| Serving employees must inform their Head of Office/Department in writing | O2 paragraph 5 (pack F8) |
| Read the bulletin before paying the fee | O2 paragraph 4 |
| CBT tentatively 20.12.2026–13.01.2027; sessions may change | O2 paragraph 17 and tentative schedule |
| Detailed schedule to follow on the website | O2 paragraph 17; O1 "Schedule: Coming Soon..." |
| Separate Special Education and Societies streams | O1 notification menu, O5, O6 |
| Revised syllabus and Special Education syllabus | O1 syllabus menu, O4, O5 |
| Vacancies in the notification PDF and Vacancy Abstract | O2 paragraph 3, O1 Vacancy Abstract menu |
| GO 52 is the implemented order | O2 paragraphs 1, 11, 31 |

## Expiry and update rule

- **30 November 2026, after the window closes:** unless the portal shows a verified extension,
  set `statusBadge` to `expired`, remove `actionUrl` and the "Apply on official portal" link, and
  change "Current status" to say applications have closed.
- **Immediately:** on any corrigendum, extension, replacement notification or syllabus PDF.
- **When the detailed CBT schedule, hall tickets, keys or results are released:** update the
  lifecycle stage only after the exact official action is live.

## Do not publish

- Vacancy, reservation, district or subject tables copied from the notification
- Age limits, qualifications or the tentative mock-test and hall-ticket dates. They are not in the
  research pack's verified fact ledger, and the extracted schedule table did not keep its row
  layout, so those dates could not be safely matched to their events
- One combined eligibility claim for regular, Special Education and Societies posts
- A total-vacancy figure
- The apply action after 30 November 2026 without a verified extension
- Hall-ticket, key or result links before the official action is live

## Quality checklist

1. **Source verification: pass.** `goReference` holds the notification's own number;
   `sourceUrl` and `pdfUrl` are exact official links, checked on 25 November 2026.
   `verifiedAgainstGoir` is `false` because this is a portal notification, not a GOIR order.
2. **Telugu accuracy: pass.** `titleTe` and `summaryTe` were approved exactly as written by
   fluent human review on 25 November 2026. Terminology decisions: "ఏపీ టీఆర్‌టీ" with a space;
   "స్కూల్ అసిస్టెంట్" kept as the familiar official cadre wording; "సీబీటీ" accepted;
   "సొసైటీ పాఠశాలల పోస్టులు" instead of "సొసైటీల పోస్టులు".
3. **No transcribed tables: pass.** The summary, abstract and body describe vacancies and
   eligibility in prose and link the official PDFs. No numeric table is reproduced.
4. **Related Orders: intentionally pending, not blocking.** GO 52 is the implemented order; no
   portal post exists for it yet. A separate GO 52 reference post is the documented follow-up.
5. **Lifecycle stage: pass.** `documentType` `notification` with `statusBadge` `apply_link`
   matches the open window. Since PR #12 the 30 November deadline keeps the post open through
   the whole IST day and closes it from 00:00 IST on 1 December; switch `statusBadge` to
   `expired` and remove the apply link then, unless an extension is verified.

**Recommendation:** ready for CMS entry as a draft (`isDraft: true`) after a final same-day
official portal check. Publish manually only after that check passes.
