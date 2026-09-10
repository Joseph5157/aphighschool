# AI UI/content slop audit — `SLOP-AUDIT-1`

Audit date: 9 September 2026

Branch: `ai-slop-audit`

Baseline: clean `main` = `origin/main` at `1a32e629ec65e954a5f767637d7edfb8559404e3`

## Gate boundary

This is an audit-only gate. No application code was changed. The audit read, in order,
`PRODUCT.md`, `DESIGN.md`, `docs/ui/DESIGN_SYSTEM.md`, and
`docs/context/UI_SYSTEM_CLOSURE.md` before reviewing the current source or rendered product.

The standard used here is product purpose, not visual plainness. The intended “government
gazette that a teacher can read on a phone” direction is distinctive and appropriate. Navy
letterhead panels, warm paper, hairline rules, document references, lifecycle state, and
carefully labelled dates are not classified as slop simply because they are stylised or dense.

## Evidence and method

- Inspected current public source under `app/(public)` and its shared components.
- Ran the current app against the healthy local PostgreSQL database and inspected it with real
  Chromium browser automation at 1440 × 1000 and 390 × 844.
- Visually captured `/`, `/orders`, `/posts/apscert-fa1-question-papers-answer-keys-2026`, and
  `/tools`; also inspected the rendered DOM for `/category/govt-orders`, `/search`,
  `/tools/da-arrears`, `/tools/tax-calculator`, `/pensioners`, `/service-desk`, `/topics`, and a
  genuinely unmatched 404 URL.
- Counted visible sub-12px text, emoji, bordered/nested panels, pill-shaped elements, shadows,
  and gradients as diagnostic signals. These counts include nested DOM elements and are not
  treated as findings by themselves; the visual and product-purpose review decides the result.
- Loading states were source-audited. Empty and 404 states were both source-audited, and the 404
  was rendered in the browser.

## Overall verdict

The core document product is sound and recognisable. Its slop is concentrated around the core:
large “suite” mastheads, dashboard-like sidebars, nested card kits, repeated privacy and helper
claims, emoji-as-icons, tiny mono labels, and several parallel navigation/discovery systems.
The mobile homepage is the most consequential mismatch: its featured card fills the first
viewport, so the dense document index promised by the product is not visible.

The highest-value cleanup direction is subtraction: preserve document state, provenance,
Telugu summaries, source links, and Related Orders; remove or flatten the promotional and
recirculation furniture wrapped around them.

## Findings

### A01 — The homepage feature card defeats the mobile density goal

- **Route/component:** `/`; `app/(public)/page.tsx:96-97, 139-143` and
  `app/(public)/_components/HeroCard.tsx:50-137`.
- **Exact evidence:** The first database result is automatically promoted to `heroPost`, not
  selected by an editorial “featured/urgent” decision. `HeroCard` adds a 2px inline
  `linear-gradient`, `rounded-2xl`, `shadow-md`, 24–32px padding, up to four badge/reference
  marks, three full Telugu bullets, and a footer. At 390 × 844 the card occupies the remainder
  of the first viewport and continues below the fixed bottom navigation; zero ordinary document
  rows are visible. The design-system target is at least three document rows below the header.
- **Why it feels generated/unnecessary:** It is a classic “make the first item a hero” landing
  page pattern applied without a product state that justifies prominence. The gradient frame is
  the only rendered content gradient found in the core routes and has no document meaning.
- **User value, if any:** It makes the newest document prominent and exposes its Telugu summary.
- **Classification:** **REPLACE**
- **Confidence:** **HIGH**
- **Proposed direction:** Use the same dense document-row language as the feed. If editorial
  prominence is genuinely needed later, require an explicit field and use a compact priority
  treatment that still leaves multiple documents visible on a phone.

### A02 — The homepage desktop rails duplicate primary destinations and over-cardify navigation

- **Route/component:** `/`; `DesktopLeftNav.tsx:20-84`, `DesktopSidebar.tsx:25-107`, and the
  three-column shell at `page.tsx:112-167`.
- **Exact evidence:** The left rail is a bordered outer Card containing five separately bordered,
  rounded category rows, a pill showing the number of categories, five per-category count pills,
  and an “Explore All Categories” action. The right rail repeats four tools already reachable
  through the global Utility Tools destination; each row has an emoji tile, subtitle and badge,
  followed by another “Explore All Utility Tools” action. A second Card contains seven hashtag
  quick-search pills. The rendered 1440px homepage gives only 50% width to the actual feed.
- **Why it feels generated/unnecessary:** This is a uniform SaaS dashboard card kit standing in
  for hierarchy. Counts of 0, 2, 3, or 4 add little decision value, while nested borders and pills
  make ordinary navigation look like analytics.
- **User value, if any:** Direct category and tool shortcuts can reduce travel for repeat users.
- **Classification:** **SIMPLIFY**
- **Confidence:** **HIGH**
- **Proposed direction:** Keep at most one quiet, flat desktop index rail based on observed user
  tasks. Remove zero counts, the outer-card/inner-card nesting, descriptive microcopy, and the
  duplicated “explore all” actions. Let the central document list own the page.

### A03 — Emoji are used as a parallel icon system across the public product

- **Route/component:** Public shell and multiple routes, especially `layout.tsx:99-143`,
  `DesktopLeftNav.tsx:27-29`, `DesktopSidebar.tsx:7-11, 33-55`,
  `OrdersFilterTabs.tsx:9-16, 46-62`, `TopicTagBar.tsx:8-15, 39`,
  `tools/page.tsx:18-84`, and document-detail widgets.
- **Exact evidence:** Browser output showed house, clipboard, calculator, beach, pensioner,
  search, lightning and other emoji in the drawer; the orders page rendered 18 emoji at desktop
  and 11 at mobile; the tools index rendered 15 at desktop; the tax calculator rendered emoji
  for tabs, seven printable documents, print actions and FAQ headings. Detail pages add pin,
  page, bell, and phone-style symbols. The source explicitly maps document types and tools to
  emoji strings.
- **Why it feels generated/unnecessary:** The symbols vary by OS, mix visual styles and meanings,
  cannot inherit the palette reliably, and make an accuracy-first government-reference product
  feel playful. Several are arbitrary: a beach represents leave, an elderly-person glyph
  represents all pensioners, and lightning represents calculators.
- **User value, if any:** They provide quick recognition when the mapping is obvious.
- **Classification:** **REPLACE**
- **Confidence:** **HIGH**
- **Proposed direction:** Create one restrained inline-SVG set using `currentColor`, or remove an
  icon when the adjacent label already does the work. Preserve letter/code marks only where they
  are meaningful document abbreviations, not decorative substitutes.

### A04 — Sub-12px typography is systemic and is most severe on index/discovery surfaces

- **Route/component:** Site shell, `/orders`, category pages, `/search`, `/tools`, pension pages,
  calculator result panels, and document details.
- **Exact evidence:** Real-browser counts at 390px found 35 visible sub-12px elements on
  `/orders`, 17 on `/category/govt-orders`, 57 on `/tools`, and smaller clusters elsewhere.
  Examples include 9px dates in `orders/page.tsx:179`, 9px tool-flow chips in
  `tools/page.tsx:163`, a 9.5px Search heading in `SearchUI.tsx:222`, 10px fact labels in
  `ActionSummary.tsx:21`, and 10px masthead/footer labels across routes. These violate the
  design system’s 12px absolute floor. The 9–11px print-form typography inside tax form
  reproductions is a separate, intentional print-density case and should not be swept into the
  same classification without print review.
- **Why it feels generated/unnecessary:** Tiny uppercase/mono copy is repeatedly used to make
  already dense cards look “technical.” It creates metadata texture rather than readable
  hierarchy, especially for mid-range Android users in the stated corridor use case.
- **User value, if any:** Compact metadata can improve scanning, and official printable forms may
  legitimately need denser type.
- **Classification:** **REPLACE**
- **Confidence:** **HIGH**
- **Proposed direction:** Enforce 12px for screen UI, remove low-value labels before increasing
  their size, and separately render-review the print-only official-form layouts so screen cleanup
  does not damage printable documents.

### A05 — Mono uppercase section labels have spread beyond data and genuine section indexing

- **Route/component:** Cross-route; examples include homepage recent feed (`page.tsx:151`),
  orders Recent Documents (`orders/page.tsx:163`), Search discovery headings
  (`SearchUI.tsx:222, 243, 281`), detail At a Glance (`ActionSummary.tsx:37`), and tools/sidebar
  headings (`ToolsSidebar.tsx:25, 59`).
- **Exact evidence:** Rendered headings include `RECENT DOCUMENTS`, `QUICK SEARCHES`, `FIND BY
  TASK`, `FINANCIAL RATES SUMMARY`, `DDO BILL SUBMISSION GUIDE`, and `CATEGORY STACKS`, in
  addition to legitimate GO numbers, dates and states. Many are 9.5–12px mono uppercase.
- **Why it feels generated/unnecessary:** The same “tiny tracked eyebrow” device is applied to
  almost every region, including ordinary headings and promotional widgets. It stops signalling
  document data and becomes generic dashboard decoration.
- **User value, if any:** A single restrained label can help separate genuine regions in a dense
  gazette layout.
- **Classification:** **SIMPLIFY**
- **Confidence:** **HIGH**
- **Proposed direction:** Reserve mono for dates, GO/reference numbers, status and calculator
  figures. Keep at most one uppercase label per real region; use the normal heading face for
  section identity.

### A06 — The orders hub offers too many parallel paths to the same documents

- **Route/component:** `/orders`; `orders/page.tsx:95-204`, `OrdersFilterTabs.tsx:55-153`, and
  `OrdersSidebar.tsx:21-76`.
- **Exact evidence:** Before reaching category content, the page presents breadcrumb, two-tier
  gazette masthead, published count, bilingual heading, explanatory sentence, search button,
  topic bar, a horizontally scrolling Recent Documents widget, six document-type tabs, and a
  quick-search sidebar. Category cards then contain header, icon, document-count pill, up to
  three mini result rows with reference badges, and a footer CTA. The desktop render had 54
  bordered elements, 19 nested bordered panels, 13 pill-shaped text elements and 37 visible
  sub-12px text elements.
- **Why it feels generated/unnecessary:** It behaves like a dashboard assembled from multiple
  discovery widgets rather than one document index. The recent strip repeats homepage/search
  recency; the masthead search action and sidebar chips repeat Search; tabs repeat the category
  cards directly underneath them.
- **User value, if any:** Document-type browsing and a direct GO search are real tasks. The GOIR
  explanation is useful trust context for first-time readers.
- **Classification:** **SIMPLIFY**
- **Confidence:** **HIGH**
- **Proposed direction:** Choose one dominant model: a compact category/type index leading to
  dense document lists. Remove the Recent Documents strip and either the tabs or the category
  grid. Move the GOIR explanation to quiet help text near provenance, and expose one search
  action rather than several search systems.

### A07 — Category filters are hardcoded, duplicated in presentation, and excessive for tiny lists

- **Route/component:** `/category/[slug]`; `CategoryLogList.tsx:90-190`.
- **Exact evidence:** Filters are always `All`, `Open`, `Closed`, `2026`, `2025`, plus every tag
  (`line 121`). The rendered Government Orders category contains only three documents but shows
  eight filter pills: All, Open, Closed, 2026, 2025, PTR, Seniority Points, Transfers. It then
  repeats “3 documents” and “Newest first.” The years will age without data-derived maintenance.
- **Why it feels generated/unnecessary:** Faceted-search chrome appears because category pages
  conventionally have filters, not because this list needs them. A fixed pair of years is a
  conspicuous generated shortcut rather than a durable information model.
- **User value, if any:** Open/Closed and topic filters become useful when a category contains
  enough documents to scan poorly.
- **Classification:** **SIMPLIFY**
- **Confidence:** **HIGH**
- **Proposed direction:** Derive available years and states from the actual result set, show only
  facets with meaningful choices, and suppress the filter bar below a list-size threshold. Keep
  document state visible on every row regardless.

### A08 — Empty Search is a second portal/dashboard rather than a focused search surface

- **Route/component:** `/search`; `SearchUI.tsx:149-303`.
- **Exact evidence:** The empty route shows seven document-type pills, a Quick Searches section
  with three emoji pills, five Recent Document cards with type pills and dates, then six “Find by
  Task” cards. Rendered mobile output contained 18 pill-shaped DOM elements before a query. “Find
  by Task” links back to tools, orders and pension guidance already represented by primary
  navigation and the Service Desk.
- **Why it feels generated/unnecessary:** It turns the absence of a query into an opportunity to
  fill space with widgets. The repeated uppercase micro-headings and card groups are a familiar
  AI dashboard composition, while the actual job is entering a GO number, Telugu phrase or tag.
- **User value, if any:** Recent documents and a few verified suggested queries can help users who
  arrive without the right term.
- **Classification:** **SIMPLIFY**
- **Confidence:** **MEDIUM**
- **Proposed direction:** Keep the search field, type control, and one compact suggestion/recent
  section. Remove “Find by Task” from Search, use plain text links rather than pill-inside-button
  constructions, and reveal result-specific tags only after a query.

### A09 — Document state is essential, but its separate full-width card duplicates the masthead

- **Route/component:** `/posts/[slug]`; `DocumentTemplate.tsx:78-142`,
  `OrderStateBadge.tsx:20-27`, and `ActionSummary.tsx:62-82`.
- **Exact evidence:** A full-width bordered `Document Status` panel containing `CURRENT` and “This
  order is in force” appears between breadcrumb and a second large bordered masthead. The masthead
  then shows category, GO reference, department and date; the At a Glance card repeats reference,
  department, date and GOIR verification again. On the inspected article, status, masthead and
  summary are three consecutive large cards before the order text.
- **Why it feels generated/unnecessary:** The content is high value, but each concern has been
  given its own card instead of composing a single document header. Repeating metadata creates an
  aura of completeness without adding information.
- **User value, if any:** Very high: state is the most important fact, and summary/facts/action
  links are central to the product.
- **Classification:** **SIMPLIFY**
- **Confidence:** **HIGH**
- **Proposed direction:** Keep state first and unmistakable, but integrate it into the document
  masthead or a compact attached status row. In At a Glance, retain Telugu summary, action/source
  links and facts not already visible; remove repeated facts and “Author-provided summary and
  document facts.”

### A10 — Detail-page helper labels and a two-item table of contents add machinery without aid

- **Route/component:** `/posts/[slug]`; `DocumentTemplate.tsx:148-158` and
  `TableOfContents.tsx:15-128`.
- **Exact evidence:** The order-text panel is labelled both `Full Order Text & Clauses` and
  `Structured Document`; the second phrase says nothing actionable. For the inspected document,
  the mobile TOC rendered `Page Index / విషయ సూచిక (2 sections)` as a collapsible bordered widget.
  Its component includes generated IDs, IntersectionObserver scroll-spy, active state, separate
  mobile/desktop presentations, and 11px nested labels even when only two headings exist.
- **Why it feels generated/unnecessary:** “Structured Document” is generic filler, and a full
  scroll-spy component for two short sections is interface ceremony. It is a one-use abstraction
  whose complexity is not conditional on enough content to justify it.
- **User value, if any:** A TOC is useful on genuinely long orders with many sections.
- **Classification:** **SIMPLIFY**
- **Confidence:** **HIGH**
- **Proposed direction:** Remove the redundant micro-label. Render a plain TOC only above a
  meaningful heading-count/content-length threshold; otherwise let normal document flow work.

### A11 — Generic “latest updates” and chronological prev/next compete with Related Orders

- **Route/component:** `/posts/[slug]`; `posts/[slug]/page.tsx:104-196`,
  `PostNavCards.tsx:17-50`, and `CategoryStacksGrid.tsx:25-71`.
- **Exact evidence:** Every detail request performs separate previous, next, site-wide latest, and
  tools-category queries. The page then renders Previous/Next Post cards followed by `🔔 తాజా
  అప్‌డేట్‌లు — Latest Updates & Softwares`, a `Category Stacks` micro-label, more cards, `View
  More`, and lists of posts. Browser inspection found the same APTET destination twice on the
  inspected detail route. These generic feeds appear after the explicitly curated Related Orders.
- **Why it feels generated/unnecessary:** It is recirculation/engagement furniture on a reference
  product whose stated goal is not time-on-site. Chronological adjacency and “latest” are weaker
  relationships than the founder-approved background/amending order graph, yet receive comparable
  space. “Softwares” and “Category Stacks” read like template vocabulary, not product language.
- **User value, if any:** Provides lateral navigation when a reader wants another document.
- **Classification:** **REPLACE**
- **Confidence:** **HIGH**
- **Proposed direction:** Let Related Orders be the primary continuation. Offer one quiet link
  back to the current category or Orders index. Remove generic latest/software stacks and
  chronological prev/next unless research shows they answer a real document-reference task.

### A12 — The tools index repeats privacy three times and uses generic “suite” branding

- **Route/component:** `/tools`; `tools/page.tsx:92-127` and `ToolsSidebar.tsx:91-107`.
- **Exact evidence:** The hero contains `Heritage Craft Utility Suite`, `100% Client-Side Privacy`,
  and a full privacy sentence. The next bordered strip repeats `100% Client-Side`, `No Server
  Calls`, `No Financial Data Stored`, and a `Privacy First` pill. The sidebar repeats a third navy
  card with `100% Privacy First`, `Browser Native`, `Client-Side Security Guarantee`, and the same
  local-browser claim. At 390px, the hero and privacy strip consume most of the first viewport
  before the first calculator is established.
- **Why it feels generated/unnecessary:** “Heritage Craft Utility Suite” is ornamental brand copy
  with no user meaning. Repeating the same trust statement as eyebrow, body, strip, pill, and
  guarantee makes it feel promotional rather than precise.
- **User value, if any:** Users entering salary/tax figures should know whether their data leaves
  the device.
- **Classification:** **REMOVE**
- **Confidence:** **HIGH**
- **Proposed direction:** State the client-side privacy fact once, plainly, adjacent to the first
  input or under the page title. Remove “suite,” “privacy first,” “browser native,” and guarantee
  language that merely restates the same implementation fact.

### A13 — The tools sidebar is a low-value fake dashboard with unproven hardcoded authority

- **Route/component:** `/tools`; `ToolsSidebar.tsx:5-107`.
- **Exact evidence:** `FINANCIAL_RATES` hardcodes four values and labels them `Active`, `Fixed`,
  `Updated`, and `Max Limit`; the card is titled `Financial Rates Summary` with the subtitle `AP
  Treasury Approved Standards` and an `FY 2025-26` pill. No source link, effective date, GO
  reference or verification field accompanies those authority-bearing values. A second `DDO Bill
  Submission Guide` simply links back to three tools already in the main grid. The rendered
  desktop page had 83 bordered elements and 48 nested bordered panels.
- **Why it feels generated/unnecessary:** This is the exact “dashboard stats + checklist” pattern
  that fills a sidebar without a user job. It also conflicts with the product promise to never
  overstate what is known: “approved,” “active,” and “updated” appear as confidence decoration.
- **User value, if any:** A genuinely sourced, effective-dated rates reference could be valuable.
- **Classification:** **REMOVE**
- **Confidence:** **HIGH**
- **Proposed direction:** Remove both sidebar widgets. If rates become a product feature, model
  them as sourced records with effective dates and related orders, and present them in the
  relevant calculator rather than as dashboard tiles.

### A14 — Calculator cards carry redundant badges, statuses and fake process chips

- **Route/component:** `/tools`; `tools/page.tsx:18-84, 129-184`.
- **Exact evidence:** Every card has an emoji tile, badge (`FY 2025-26`, `EL / HPL`, `7.1%
  Interest`, etc.), separate status (`Updated Slabs`, `Surrender Calculator`, `Part-Final Loan`),
  bilingual title, paragraph, 2–3 tiny numbered chips (`Fill Details`, `Auto-Calculate`, `Export
  PDF`), and button. Five or six cards repeat the same `Fill Details → Auto-Calculate` sequence.
  The rendered tools route exposed 57 visible sub-12px elements on mobile, mainly these 9px chips.
- **Why it feels generated/unnecessary:** The repeated three-step pattern is self-evident for a
  calculator and visually mimics an onboarding stepper without being interactive or
  differentiating most tools. Badge and status often repeat words already in the title.
- **User value, if any:** Export availability and the applicable financial year are useful
  differentiators.
- **Classification:** **SIMPLIFY**
- **Confidence:** **HIGH**
- **Proposed direction:** Use a compact list/card with title, Telugu title, one sentence and one
  action. Keep only genuinely decision-relevant qualifiers such as applicable FY and export
  availability, expressed as readable metadata rather than pills.

### A15 — The pension hub repeats the same “suite + pipeline + card grid + FAQ + sidebar” template

- **Route/component:** `/pensioners`; `pensioners/page.tsx:57-195` and
  `PensionersSidebar.tsx`.
- **Exact evidence:** The page begins with `Emerald Treasury Care Suite`, a separate `AP Revised
  Pension Rules` micro-label, a long “care hub” heading/subtitle, then a bordered six-office
  pipeline preview made of six 10px mini-cards plus `View Detailed Guide`. Four tool cards each
  repeat emoji, badge, status, two titles, description and action. The rendered route had 58
  bordered elements, 28 nested panels, five pills, and 15 sub-12px elements before accounting for
  the full below-fold sidebar/FAQ content.
- **Why it feels generated/unnecessary:** The construction is nearly the same product-marketing
  template as Tools, with invented “Emerald Treasury” naming layered over concrete pension tasks.
  The pipeline is both previewed as six chips and linked as its own detailed guide.
- **User value, if any:** Pension, commutation and office-clearance tasks are valuable and in
  scope for retired AP teachers.
- **Classification:** **SIMPLIFY**
- **Confidence:** **HIGH**
- **Proposed direction:** Rename the page directly for retired AP teachers, remove suite branding
  and the duplicated pipeline preview, and present the four tasks as a compact task list. Keep
  guidance only where it is sourced and necessary to choose a task.

### A16 — Service Desk and Topics duplicate navigation with repeated card labels and explanations

- **Route/component:** `/service-desk` and `/topics`; `service-desk/page.tsx:61-138` and
  `topics/page.tsx:68-137`.
- **Exact evidence:** Service Desk presents “What do you need help with?”, then “Choose a
  service,” then “Six common starting points,” then `Internal portal guide`; each of six cards
  contains a code tile, a numbered category pill, title, explanatory paragraph, arrow, and a
  second button-like `Open guide`. Most destinations are already top-level navigation targets.
  Topics adds an AP School Education badge, explanatory hero, explanatory text under both section
  headings, and repeats `DOCUMENT TOPIC` or `SERVICE GUIDE` on every card; its service-guide cards
  overlap Service Desk.
- **Why it feels generated/unnecessary:** Both routes are reasonable information architectures,
  but together they create two curated directories plus Search “Find by Task” for the same small
  destination set. Inside the cards, labels and CTA styling repeat what the title and whole-card
  link already communicate.
- **User value, if any:** Task-first language can be easier than knowing which department document
  type or calculator to choose; Topics can expose tags that do not belong as categories.
- **Classification:** **NEEDS VISUAL REVIEW**
- **Confidence:** **MEDIUM**
- **Proposed direction:** Choose one task-directory owner after observing real entry paths. In the
  retained route, use flat linked rows, remove repeated kind pills and secondary button chrome,
  and keep one short page explanation. Keep document topics distinct from official document-type
  categories.

### A17 — Loading skeletons faithfully reproduce some of the unnecessary UI

- **Route/component:** Public `loading.tsx` files, especially home (`lines 19-43`), orders
  (`lines 17-36`), Search (`lines 18-35`) and category (`lines 12-25`).
- **Exact evidence:** Home reserves a 256px rounded hero plus four card skeletons and both desktop
  rails. Orders reserves a large masthead, five pill skeletons, four 192px category cards and the
  sidebar. Search and category each reserve six filter pills before content. The skeleton
  primitive itself is visually restrained and has appropriate status labelling.
- **Why it feels generated/unnecessary:** The state component is not independently slop; it
  mirrors the excess of the loaded page and therefore reinforces layout shift toward the same
  hero/card/chip template.
- **User value, if any:** Stable geometry and an immediate loading affordance are valuable on slow
  connections.
- **Classification:** **SIMPLIFY**
- **Confidence:** **MEDIUM**
- **Proposed direction:** After simplifying the loaded routes, reduce skeletons to the minimum
  stable shape of the retained heading, controls and first content rows. Do not create decorative
  placeholder cards for widgets that should be removed.

### A18 — Empty, error and 404 states are restrained and purposeful

- **Route/component:** `EmptyState.tsx`, `app/(public)/error.tsx`, `NotFoundContent.tsx`, and both
  not-found boundaries.
- **Exact evidence:** The genuine 404 rendered one heading, equivalent English/Telugu explanation,
  and three concrete recovery actions, with no emoji, pills, gradients, dashboard widgets or
  invented support details. `EmptyState` supports a compact unboxed form inside an existing card
  and a single bordered standalone form. The error state distinguishes failure from emptiness and
  provides retry guidance.
- **Why it feels generated/unnecessary:** It does not. This is a useful control case: the states
  say what happened and offer recovery without illustration, apology theatre or filler.
- **User value, if any:** High; users can recover from stale links, empty filters and transient
  failures.
- **Classification:** **KEEP**
- **Confidence:** **HIGH**
- **Proposed direction:** Preserve this restraint. If surrounding pages are flattened, allow the
  standalone empty-state border to flatten with them, but do not add artwork, extra cards or
  support claims.

### A19 — Gazette styling, state badges, provenance, dates and Related Orders are not slop

- **Route/component:** Document cards and detail pages; `Badge.tsx`, `DocumentDate.tsx`,
  `GoirBadge.tsx`, lifecycle components, the masthead portion of `DocumentTemplate.tsx`, and the
  Related Orders block at `DocumentTemplate.tsx:161-187`.
- **Exact evidence:** State uses a word plus semantic colour; dates retain `Issued` versus `Added
  to portal`; GOIR appears only for a recorded positive check; document references and figures use
  mono; Telugu retains first-class type; the detail header looks like a document rather than a
  generic SaaS panel. Related Orders are approved, explicitly queried relationships, not generic
  “you may also like” content.
- **Why it feels generated/unnecessary:** It does not. The typography and rules have direct
  document-reference purposes, and the distinctive gazette character is coherent with the
  subject matter.
- **User value, if any:** Core product value: currentness, provenance, citation, comprehension and
  historical context.
- **Classification:** **KEEP**
- **Confidence:** **HIGH**
- **Proposed direction:** Preserve these semantics while reducing the extra containers around
  them. Do not remove state/provenance to satisfy a crude badge count, and do not replace Related
  Orders with generic recency.

### A20 — Detail source retains dead queries/imports and one unused public abstraction

- **Route/component:** `posts/[slug]/page.tsx` and `app/(public)/_components/Pagination.tsx`.
- **Exact evidence:** `posts/[slug]/page.tsx:104-121` queries three sibling posts into
  `siblingPosts`, but the value is never read. Lines 3–15 import `Link`, `Breadcrumb`,
  `LifecycleStepper`, `ThumbZoneBar`, `PostNavCards`, `CategoryStacksGrid`, `Badge`,
  `OrderStateBadge`, `Button`, `Card`, and date-format helpers that are not used by this file after
  rendering was moved to `DocumentTemplate`. `Pagination.tsx` has no application consumer; only
  its own internal references and a primitive test use it. In contrast, apparent one-use
  components such as `NotFoundContent`, `ThemeToggle`, and `UpcomingActionDates` each own a real
  product/accessibility concern and are not zero-value abstractions.
- **Why it feels generated/unnecessary:** These are remnants of template generation and component
  extraction rather than deliberate current architecture. The dead sibling query imposes runtime
  work, while the unused pagination abstraction expands the component surface without a user.
- **User value, if any:** None in the current application.
- **Classification:** **REMOVE**
- **Confidence:** **HIGH**
- **Proposed direction:** In a later implementation gate, delete the dead query/imports and the
  unused Pagination module if no planned, approved list pagination consumes it. Do not treat every
  single-consumer component as suspect; retain components that isolate real behaviour or meaning.

## Suggested implementation order for a later gate

This section is direction only; nothing below is implemented in `SLOP-AUDIT-1`.

1. Remove generic recirculation and fake-dashboard content: A11, A12, A13.
2. Restore the mobile reference-index promise: A01, then simplify A02 and A06.
3. Consolidate Tools/Pension/Service/Topics discovery: A14–A16.
4. Flatten document-detail duplication while preserving state and Related Orders: A09–A10.
5. Replace emoji and remove low-value micro-labels before applying the 12px floor: A03–A05.
6. Make filters data-driven and proportional to list size: A07–A08.
7. Align loading states and remove dead source only after the visible decisions are made: A17,
   A20.

## Gate result

`SLOP-AUDIT-1` is complete as an audit. It proposes no scope expansion, makes no claim that the
intentional gazette identity is defective, and changes no application code.
