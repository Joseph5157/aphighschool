# UI System & Production Readiness — Current State

## Baseline identity

- Program start date: 2026-09-08
- Starting SHA: `03642c62ba099f0f413b81caee6bbfd1341e21b3`
- FRESHNESS-1 closure SHA: `03642c62ba099f0f413b81caee6bbfd1341e21b3`
- Branch: `ui-system-production-readiness`
- Branch point: verified clean `main`; local `main`, `origin/main`, and live remote
  `refs/heads/main` all matched the starting SHA before branch creation.
- FRESHNESS-1 status: CLOSED

## Current UI program state

- Current phase: Phase 11
- Active gate: `UI-LINKS-1` (CLOSED)
- Scope in this gate: internal, external, and document link audit on `app/(public)`;
  `mailto:`/`tel:` where genuine contact info exists (still none — recorded, not invented)
- UI redesign performed: no
- Application behaviour changed: yes — three dead external government-portal domains fixed
  (two repointed to a verified live replacement, one removed with no guessable substitute);
  two `http://` EHS links upgraded to `https`; every post-detail page's "Category Stacks"
  widget fixed (it 404'd on "View More" via two invented category slugs, showed the same six
  posts twice reversed instead of a real per-category query, and marked items "NEW" by array
  position rather than any real date — the badge was removed rather than given an invented
  threshold); a third instance of the recurring hardcoded/unverified quick-search-chips defect
  (`OrdersSidebar`, missed by both prior gates' audits) fixed the same way as the other three.
  Information architecture, routes and page composition unchanged.
- Next planned gate: `UI-404-1`

### Gate history

| Gate | Status | Outcome |
|---|---|---|
| `UI-BASELINE-0` | CLOSED | Branch, baseline, roadmap and state tracking established. |
| `UI-AUDIT-1` | CLOSED | `docs/ui/UI_AUDIT.md` created; 36 findings, all components classified. |
| `UI-DESIGN-1` | CLOSED | `PRODUCT.md`, `DESIGN.md`, `docs/ui/DESIGN_SYSTEM.md` created; P0s specified for `UI-SYSTEM-1`. |
| `UI-SYSTEM-1` | CLOSED | Foundations implemented; audit P0s F2/F3/F4 fixed and guarded. 288 tests pass. |
| `UI-SYSTEM-2` | CLOSED | Primitives standardised; carried-forward defects closed; Dialog/IconButton/Textarea/Checkbox added. 318 tests pass. |
| `UI-RESPONSIVE-1` | CLOSED | Audit F1 closed via BottomBarSlot; overflow and gutter repair; 768–1023 band guarded. 330 tests pass. |
| `UI-MOBILE-NAV-1` | CLOSED | Audit F5 and F28 closed; drawer given the full modal contract. 347 tests pass. |
| `UI-PATTERNS-1` | CLOSED | Templates merged; GOIR/date/callout patterns standardised; a lifecycle bug fixed. 365 tests pass. |
| `UI-STATES-1` | CLOSED | Five `loading.tsx` routes added with `Skeleton`; seven ad hoc empty-state divs standardised onto `EmptyState`; search's debounce pending gap closed. 389 tests pass. |
| `UI-CONTENT-1` | CLOSED | WhatsApp banner (F16) deleted; AP-only scope lock (F25) fixed in five places behind a new repo-wide guard; quick-search/topic chips (F30) made self-verifying against real content; tools-index step claims and a PRC HRA calculation bug fixed. 402 tests pass. |
| `UI-SEO-1` | CLOSED | Real title template; canonical, OpenGraph/Twitter, favicon, robots.txt, sitemap.xml added; three over-length titles/descriptions shortened; F9's localhost-fallback deduplicated with a production warning; a second F30-shaped chip defect and an "Offline Ready" unsupported claim found and fixed outside the original audit. Verified with an actual `next build` + `curl`, not source reading alone. 410 tests pass. |
| `UI-LINKS-1` | CLOSED | Three dead external government-portal domains found by live fetch (two fixed, one removed — no guessable replacement existed); post-detail "Category Stacks" widget's fabricated category links, duplicate-data bug, and positional "NEW" badge all fixed; a third, previously-missed instance of the hardcoded-chips defect (`OrdersSidebar`) fixed. `link-crawl.test.ts`'s literal-string-only coverage gap identified and documented (not widened — manual audit is the right tool for dynamic hrefs). 420 tests pass. |

## Repository observations

These observations are an inventory snapshot, not the full UI audit. KEEP / REFINE /
MERGE / REPLACE / DELETE decisions are intentionally deferred to `UI-AUDIT-1`.

### Framework

- Next.js `14.2.35` with the App Router, React `18.3.1`, and TypeScript in strict,
  no-emit mode.
- The root `app/layout.tsx` loads Space Grotesk, Noto Sans Telugu, and IBM Plex Mono via
  `next/font/google`.
- Public routes are grouped under `app/(public)`; the admin CMS and NextAuth API routes
  live under `app/admin` and `app/api`.
- `next.config.js` currently enables React Strict Mode and has no additional image or
  route configuration.

### Styling

- Tailwind CSS `3.4.4` with PostCSS and Autoprefixer.
- Tailwind scans `app/**/*.{js,ts,jsx,tsx}`, uses class-based dark mode, and maps project
  color/font utilities to CSS variables.
- `app/globals.css` defines the light/dark color variables, font utilities, typography
  hierarchy, focus-visible defaults, reduced-motion handling, print rules, and article
  prose styles.
- The established project palette uses named tokens including `ink`, `inkSoft`,
  `turmeric`, `turmericDeep`, `tamarind`, `kumkum`, `paper`, `paperRaised`, `hair`, and
  masthead-specific tokens.

### Component architecture

- Shared public primitives and navigation components live in
  `app/(public)/_components`.
- Shared primitives: Accordion, Badge, Breadcrumb, Button, Callout, Card, Checkbox, Dialog,
  EmptyState, Field, IconButton, Input, NativeSelect, Pagination, Separator, Sidebar, Skeleton,
  Table, Tabs, Textarea. *(Sheet was deleted in `UI-SYSTEM-1` as unused; the Phase 0 list above
  predates `UI-SYSTEM-2`, `UI-PATTERNS-1` and `UI-STATES-1`.)*
- Shared trust/document patterns: `GoirBadge`, `DocumentDate`, `OrderStateBadge`,
  `lifecyclePill`.
- Shared domain/navigation components include PostCard, OrderStateBadge, HeroCard,
  TopicTagBar, UpcomingActionDates, ThemeToggle, DesktopNav, BottomNav, and sidebar
  variants.
- Route-specific client components are colocated in route `_components` directories.
- Post detail uses ONE route-local shell, `DocumentTemplate`, for every document kind, plus
  route-local lifecycle, navigation, summary, table-of-contents, and related-content
  components. *(The two per-kind templates were merged in `UI-PATTERNS-1`.)*
- Admin components are separately colocated under `app/admin/_components` and
  `app/admin/posts/_components`.

### Public route structure

- `/`
- `/orders`
- `/category/[slug]`
- `/posts/[slug]`
- `/search`
- `/topics`
- `/service-desk`
- `/tools`
- `/tools/cfms-checker`
- `/tools/da-arrears`
- `/tools/gpf-apgli`
- `/tools/leave-encashment`
- `/tools/prc-calculator`
- `/tools/tax-calculator`
- `/pensioners`
- `/pensioners/commutation-tracker`
- `/pensioners/office-pipeline`
- `/pensioners/pension-calculator`

### Responsive and mobile infrastructure

- Layout and component responsiveness primarily use Tailwind's `sm`, `md`, `lg`, and
  `xl` breakpoint utilities, responsive grids, responsive padding, max-width containers,
  `min-w-0`, wrapping, and overflow utilities.
- The public shell has a fixed bottom tab bar below `lg` and a desktop link navigation at
  `lg` and above.
- A shared sidebar provider implements viewport detection at `NAV_BREAKPOINT` (1024px, the
  single navigation breakpoint), a mobile off-canvas drawer with the full modal contract, a
  desktop collapsible sidebar, a scrim, and a keyboard toggle shortcut. *(The 768px figure
  recorded at Phase 0 was corrected in `UI-SYSTEM-1`.)*
- Global CSS provides `prefers-reduced-motion` handling; shared focus-visible styling is
  present.
- Browser and viewport acceptance results are not recorded here because browser tooling
  is unavailable in the current environment. Actual overflow, navigation, and
  device-width behavior remains to be audited.

### Test infrastructure

- Vitest `2.1.9` is configured with the React plugin, jsdom by default,
  `@testing-library/react`, `@testing-library/user-event`, and
  `@testing-library/jest-dom`.
- The suite includes unit, component-rendering, static source guard, route/link,
  accessibility, auth, validation, calculator, lifecycle, freshness, and
  database-backed tests.
- DB-backed test files share a PostgreSQL test database; Vitest file parallelism is
  disabled to protect database resets from cross-file races.
- The package scripts expose `npm test` for the full Vitest suite. TypeScript validation
  is performed with `npx tsc --noEmit`; the production build script runs Prisma client
  generation before `next build`.
- The authoritative starting state reports the full Vitest suite, TypeScript, and
  `git diff --check` passing at the FRESHNESS-1 closure SHA.

### Metadata and SEO

- Root and public layouts export Next.js Metadata API values; the public layout defines
  `metadataBase`, a default title, a title template, a default description, and viewport
  theme colors.
- Most public static routes export route-specific titles and descriptions. The home page
  currently exports a route title, while dynamic category and post routes use
  `generateMetadata`.
- No canonical, Open Graph, Twitter, robots, sitemap, manifest, or icon metadata was
  found during the Phase 0 inventory.
- No favicon or App Router icon file was found.

### Image handling

- No `next/image`, JSX `<img>`, or JSX `<Image>` usage was found under `app` during the
  Phase 0 inventory.
- `public/` currently contains only `.gitkeep`.
- No `images` configuration is present in `next.config.js`.
- The interface currently uses inline SVG icons and CSS-rendered visual elements in the
  inspected shared navigation components.

### Not-found and error handling

- Dynamic category and public post routes call Next.js `notFound()` when a record is not
  available; the admin post editor does the same for a missing post.
- No custom `app/not-found.tsx` or route-group `not-found.tsx` exists, so not-found
  rendering falls back to Next.js behavior.
- `app/(public)/error.tsx` provides a public route-group error boundary with a retry
  action.
- `UI-STATES-1` added `loading.tsx` for the five DB-backed public routes: `/`, `/orders`,
  `/category/[slug]`, `/posts/[slug]`, `/search`. No other public route queries Prisma.

### Documentation and context conventions

- Binding project constraints are held in the repository-root `AGENTS.md`.
- Operational documentation currently lives in `docs/` as focused Markdown files with
  descriptive headings and checklists; longer design specifications live under
  `docs/superpowers/specs/`.
- Agent workflow references live under `.agents/skills/`.
- This program introduces `docs/context/` for its master plan, active-gate pointer, and
  recoverable current-state snapshot without overwriting existing context files.

## `UI-AUDIT-1` outcome summary

The full audit is `docs/ui/UI_AUDIT.md`; this is the recoverable summary.

### Method

Styling claims were verified by compiling the project's own Tailwind configuration
(`npx tailwindcss -i app/globals.css -o <scratch>`) and diffing every class used in
`app/**/*.tsx` against the selectors actually emitted. Reading class names alone would not
have settled the three P0 findings below.

### P0 findings (carry into implementation gates)

1. **Stacked bottom bars.** `ThumbZoneBar` (`fixed bottom-0 z-50`, no responsive hiding) and
   `BottomNav` (`fixed bottom-0 z-50 lg:hidden`) both occupy the bottom strip on post detail
   pages below 1024px; the shell reserves only `pb-[64px]` for one. → `UI-RESPONSIVE-1`.
2. **Seven utility classes never compile.** `shadow-2xs` (21), `no-scrollbar` (7),
   `shadow-xs` (7), `animate-fadeIn` (3), `backdrop-blur-xs` (2), `animate-slideUp` (1),
   `py-0.2` (1) — Tailwind v4 names and undefined utilities against `tailwindcss ^3.4.4`.
   → `UI-SYSTEM-1`.
3. **`accent` colour is undefined**, so active-state styling is dropped entirely in
   `Sidebar` (user-facing) and `Pagination` (latent, component unused). → `UI-SYSTEM-1`.
4. **Form controls have no visible focus indicator.** `Input` and `NativeSelect` apply bare
   `outline-none`, which overrides the `@layer base` focus-visible outline at equal
   specificity, and their `focus:ring-tamarind/20` sets a ring colour with no ring width, so
   the ring never paints. → `UI-SYSTEM-1` / `UI-A11Y-1`.
5. **Mobile drawer is incomplete** — no Escape, focus trap, scroll lock, or closed-state
   inertness; the closed drawer stays in the tab order. → `UI-MOBILE-NAV-1`.

### Checklist items closed as not applicable, with reason

- Image compression/optimization: no `next/image`, no `<img>`, and no image assets exist;
  `public/` holds only `.gitkeep`.
- Clickable email and phone: no genuine contact details exist anywhere in the public UI, and
  none may be invented.
- Success messages: the public surface is read-only plus client-side calculators; the only
  action is `window.print()`, which the browser confirms.

### Test coverage gaps the audit exposed

- `test/a11y.test.ts` guards `focus:outline-none` but not the bare `outline-none` that
  actually causes the P0 focus defect, and matches per-file rather than per-element.
- `test/tailwind-colors.test.ts` proves defined tokens compile, never that used classes
  resolve, so `bg-accent` and all seven dead classes pass unnoticed.
- No test compiles the stylesheet and asserts that every class used in `app/` exists in the
  output. Adding that guard is the highest-value test work in `UI-SYSTEM-1`.

## `UI-DESIGN-1` outcome summary

Design direction and specification are recorded in `PRODUCT.md`, `DESIGN.md` and
`docs/ui/DESIGN_SYSTEM.md`. This is the recoverable summary.

### Direction

**"A government gazette that a teacher can read on a phone in a corridor."** The existing
identity — navy masthead that deliberately does not invert, warm paper grounds, turmeric /
tamarind / kumkum accents, IBM Plex Mono reserved for data — was **codified, not replaced**.
Every P0 and P1 audit finding is a correctness defect rather than evidence that the aesthetic
is failing, and the master plan forbids redesigning information architecture at this gate.

### Decisions that change current behaviour

- **`accent` is retired, never defined.** `AGENTS.md` fixes a closed token set, and navigation
  position is chrome that must not borrow a document-status colour. Active navigation becomes
  `paperRaised` fill + `ink` 700 text + a 3px `turmeric` structural rule, plus
  `aria-current="page"`.
- **`superseded` moves from `tamarind` to `kumkum`.** A replaced order currently renders in
  the same green family as one in force, which is the most consequential visual defect in the
  product. `lifecyclePill.ts` already names this as the intended fix.
- **`Badge` `success` / `warning` move off raw `emerald-*` / `amber-*`** onto project tokens.
  Those variants violate `AGENTS.md`, do not participate in the dark-mode flip, and style the
  two most trust-bearing markers in the product ("GOIR Verified" and "Current").
- **One focus treatment**, context-aware: `ink` on light, `turmeric` in dark and on masthead
  panels. Bare `outline-none` is banned; ring width and ring colour must always travel
  together.
- **One navigation breakpoint (`lg`, 1024px)** for both the CSS and the JS viewport check.
- **Shadows are minimal**; bordered surfaces plus a `paper`→`paperRaised` step are the default
  elevation, with a documented z-index scale that puts the scrim above fixed bars.
- **Typography floors:** 12px absolute minimum, 16px minimum for mobile form controls. The
  `--label-*` custom properties are replaced by a single scale.

### Trust semantics restated as design rules (unchanged in substance)

- Dates always carry their `dateLabel()` value; a bare date is never rendered, and
  "Added to portal" is never presented as an issue date.
- "GOIR Verified" renders only where recorded, styled as metadata rather than a promotional
  badge. **There is no "unverified" state** — absence renders nothing.
- The independence disclaimer stays on document surfaces; no government insignia; every post
  keeps a route to its source document; nothing is invented to fill space.

### Open product questions recorded in `PRODUCT.md`

Contact/legal surface (blocks the clickable email and phone checklist items), the Telangana
references in three tool metadata descriptions against the AP-only scope lock, the WhatsApp
banner that violates a standing `AGENTS.md` hard rule, and final domain/branding.

## `UI-SYSTEM-1` outcome summary

### Audit findings closed

- **F2 — seven non-compiling utilities.** `shadow-2xs` (23), `shadow-xs` (9), `no-scrollbar`
  (7), `animate-fadeIn` (3), `backdrop-blur-xs` (2), `animate-slideUp` (1), `py-0.2` (1). The
  dead shadows were deleted rather than replaced: they never painted, so removal is visually a
  no-op and matches bordered-surfaces-by-default. `no-scrollbar` and a `fadeIn` keyframe are
  now properly defined; `backdrop-blur-xs` → `backdrop-blur-sm`; `py-0.2` → `py-0.5`.
- **F3 — undefined `accent`.** Retired, not defined. Active navigation is now a
  `paperRaised` fill, `ink` 700 text and a 3px `turmeric` rule, plus `aria-current="page"` on
  the sidebar, submenu, bottom nav and desktop nav. Pagination's current page inverts to
  `ink`/`paperRaised`.
- **F4 — no visible focus on form controls.** One treatment in `app/globals.css`, moved out of
  `@layer base` and onto element selectors so a utility cannot outrank it, with `--focus-ring`
  resolving to `ink` on light, `turmeric` in dark and `turmeric` on `.on-masthead` panels
  (applied to all 13 letterhead sites). `outline-none` removed from `Input` and
  `NativeSelect`.
- **F19 — scrim below the bottom bar.** z-index scale applied: bottom bar 45, scrim 50,
  drawer 60.
- **F18 — split navigation breakpoint.** `lib/breakpoints.ts` exports `NAV_BREAKPOINT`
  (1024); the sidebar's JS check no longer disagrees with the `lg:` CSS.
- **F22 — raw palette in primitives.** Badge `success`/`warning` and Button `danger` moved
  onto project tokens; `red-500` → `kumkum` in `Input`, `NativeSelect`, `Field`.
- **F14 (part) — `Sheet` deleted.** Zero imports, zero test references, audit disposition
  DELETE.
- **F34 — perpetual motion.** The pulsing dot on the active bottom-nav item is gone.

### Trust-bearing change

`superseded` moved from `tamarind` to the new `kumkum` Badge variant. An order that a later
order has replaced no longer renders in the same green family as one in force. `OrderStateBadge`
already pairs every state with a plain-language sentence, so the status is not carried by
colour alone.

### Guards added

| Test | Covers |
|---|---|
| `test/tailwind-classes.test.ts` | Every utility used in `app/**` compiles; project classes exist; no `accent` |
| `test/focus-visible.test.ts` | Cascade order and specificity of the focus rule; no unreplaced `outline-none`; no ring colour without ring width |
| `test/order-state-colour.test.tsx` | `superseded` ≠ in-force family; states stay distinct; badge palette is token-only; badge type ≥ 12px |
| `test/class-source.ts` | Shared file-level source scanner used by both style guards |

All were mutation-tested. One had to be rewritten: reinserting `shadow-2xs` into `Card.tsx`
**passed** the first version, because the scanner read line by line and a class string written
as a multi-line template literal has only one backtick on its opening line. Whole-file scanning
closed it.

## `UI-SYSTEM-2` outcome summary

### Carried-forward items closed

- **Touch targets.** `Button` (`md` 44px / `lg` 48px; `sm` keeps its 36px painted box and
  reaches 44px through a transparent `::after` overlay, so density is unchanged), pagination
  links, and the form controls.
- **`Field` association.** `Field` generates an id and clones its child to thread `id`,
  `aria-describedby`, `aria-invalid` and `aria-required` — fixing `TaxCalculatorUI`'s `NumF`
  wrapper at all 33 sites without editing any of them.
- **Sub-12px type in shared primitives.** None remains.
- **Duplicate primitives.** `Accordion` now reuses `Badge`'s own variant union instead of a
  hand-copied one that had drifted into duplicate members.
- **The gap `Sheet` left.** `Dialog` replaces the admin form's hand-rolled modal.

### Primitives added — each with an existing consumer

| Primitive | Consumer it was built for |
|---|---|
| `Dialog` | The admin JSON-paste modal: no role, name, Escape, focus trap, focus return or scroll lock |
| `IconButton` | Five icon-only controls that each solved name, target and focus differently or not at all |
| `Textarea` | Three raw `<textarea>` elements inheriting none of the form-control rules |
| `Checkbox` | Two raw checkboxes, one of them the `verifiedAgainstGoir` trust flag |

Five more were deliberately **not** built (`Skeleton`, `Toast`, `Dropdown`, `Tooltip`,
`Radio`); `DESIGN_SYSTEM.md` §15 records the condition that would justify each.

### Trust semantics

`verifiedAgainstGoir` is now set through a labelled `Checkbox` with its warning text linked
by `aria-describedby`, rather than an unstyled raw input. Conditional GOIR presentation,
`dateLabel()` freshness and the lifecycle mapping are unchanged; `goir-provenance`,
`freshness-trust`, `freshness-rendered` and `dark-mode` all pass.

### Badge variants

`success` and `warning` were removed after their 14 call sites moved to `tamarind` and
`turmeric`; `dark` became `ink`. Variants now name the token, not a judgement — "GOIR
Verified" is provenance, not a quality rating. TypeScript found every stale call site.

### Guards added

`test/primitives.test.tsx` (22) and `test/dialog.test.tsx` (9). Mutation-tested: removing
Escape, removing the focus trap, and reverting `Field`'s cloning each fail on-topic.

`test/a11y.test.ts`'s file-level focus-outline check was **removed**, not merely superseded:
it was already weaker than `test/focus-visible.test.ts` and its last act was to fail on
`Textarea.tsx` for a comment explaining the defect.

## `UI-RESPONSIVE-1` outcome summary

### Audit F1 — closed

`ThumbZoneBar` (page) and `BottomNav` (layout) both mounted `fixed bottom-0` below `lg`.
Neither could hide the other in CSS because neither knows the other exists, so the fix is a
mechanism: `BottomBarSlot`. A page-level bar claims the slot on mount and the site-wide nav
yields while it is held; the sticky header keeps navigation reachable. Stacking was rejected —
two bars would take roughly 110px of a 640px phone viewport on the most-read page.

Both bars also moved to `z-45` (below the `z-50` scrim) and gained
`env(safe-area-inset-bottom)`. The shell's unconditional `pb-[64px]` became
`pb-[calc(76px+env(safe-area-inset-bottom))] lg:pb-8`, so desktop pages no longer carry dead
space under them.

### Overflow repair

| Defect | Fix |
|---|---|
| Tax calculator: five `grid-cols-3` input rows, unshrinkable at 320px | `grid-cols-1 sm:grid-cols-3` |
| Tax calculator: `grid-cols-5` quarterly TDS block | Kept tabular; scrolls in its own focusable region with `min-w-[34rem]` |
| Grid-cell inputs overriding their track | `w-full min-w-0` |
| A wide table scrolling the whole article | `.prose-gazette table` now `display: block; overflow-x: auto` so the table scrolls itself |
| `Table`'s scroll region unreachable by keyboard | `tabIndex={0}` + `role="region"` + name |
| Search result metadata row not wrapping | `flex-wrap` + `min-w-0` |
| Post templates double-padded against the shell gutter | Template `px-2 sm:px-4` removed |
| Tax calculator sticky bars at `top-3`/`top-4` sliding under the `z-40` sticky header | `top-[76px]` |

### Not a defect after all

The audit listed long URLs as an overflow risk. **No raw URL renders as visible text
anywhere** — every source and PDF link carries a written label. Recorded rather than "fixed".

### A UI-SYSTEM-2 claim corrected

That gate reported no sub-12px type left in `app/(public)/_components`. Its sweep matched
sizes by integer, so `PostCard`'s `text-[8.5px]` — the smallest text in the product — survived
two gates unseen. Fixed, and the guard in `test/primitives.test.tsx` is now decimal-aware.

### Guards added

`test/responsive-layout.test.tsx` (11): one fixed bottom bar per route and the nav bar's
return, bar layer and safe area, no shell-level `overflow-x-hidden`, no `w-screen` or
oversized fixed width, the single `lg` navigation breakpoint in both CSS and JS, and
keyboard-reachable wide scroll regions. Mutation-tested — reverting `BottomNav`'s yield
restores the F1 collision and fails the guard.

## `UI-MOBILE-NAV-1` outcome summary

### Decision: REFINE, as the audit recorded

The two-part model — a bottom tab bar for the five most-used destinations below `lg`, plus an
off-canvas drawer for the full menu — is sound and unchanged. Nothing was replaced and no
second navigation system was introduced. The drawer's *behaviour* was rebuilt; its structure,
contents and destinations are untouched.

### Audit F5 closed

| Behaviour | Before | Now |
|---|---|---|
| Closed-state inertness | `-translate-x-full` only — links stayed focusable and screen-reader reachable | `visibility: hidden` + `inert` attribute |
| Escape | none | closes |
| Focus trap | none | Tab cycles inside the panel |
| Focus in / return | none | moves to the first item, returns to the trigger |
| Body scroll lock | none | locked while open, restored on close |
| Semantics | bare `<aside>` | `role="dialog"`, `aria-modal`, `aria-label="Site navigation"` |
| Scrim | unlabelled click target | `aria-hidden`; Escape is the keyboard route out |
| Route change | only the drawer's own links closed it | any navigation closes it |
| Viewport crossing | open state persisted | reset when crossing to desktop |
| Touch targets | ~30–36px rows | 44px |

### Audit F28 closed

`Ctrl/Cmd+B` no longer fires while the user is typing in an input, textarea, select or
contenteditable, and `preventDefault()` is called only when the shortcut is actually handled —
so the browser's own bookmark shortcut works again in text fields. The listener also registers
once instead of being rebuilt on every open/close.

### Why `visibility` rather than unmounting

Unmounting is what `Dialog` does and is simpler, but it would discard the drawer's slide —
motion answering a user action, which `DESIGN.md` §7 wants kept. `visibility: hidden` is out of
the tab order and the accessibility tree yet still transitions, so transitioning it alongside
`transform` flips it exactly at the end of the closing slide.

### Guards added

`test/mobile-nav.test.tsx` (17) — one test per behaviour the gate names.

**A mutation battery of eight ran against them. Seven were caught; one survived.** The
viewport-transition test asserted the drawer was gone at desktop width, which is always true
because `Sidebar` renders the desktop aside instead — so removing the state reset did not fail
it. Rewritten as a round trip (open on a phone → desktop → back), it now catches it. Same shape
as the `Field` defect in `UI-SYSTEM-2`: observing the right thing at the wrong moment.

The dead-class scanner also produced a **false alarm** here and was hardened rather than
silenced: it split template literals on `${...}` with a pattern that stopped at the first `}`,
so a hole containing a nested template literal ended mid-expression and the remainder was
tokenised as class text. It now counts braces.

## `UI-PATTERNS-1` outcome summary

### Merged

| Pattern | Before | After |
|---|---|---|
| Document templates | `GoMemoTemplate` + `NotificationTemplate`, 95% identical | One `DocumentTemplate`; the three real differences survive as data |
| GOIR marker | 10 hand-guarded call sites | `GoirBadge` — no unverified state is expressible |
| Document date | 10 hand-assembled label+date pairs | `DocumentDate` — label and date inseparable |
| Tinted panels | 6 sites each picking a colour | `Callout` with meaning-named tones |

### Kept apart, deliberately

- **The two filter strips.** `OrdersFilterTabs` switches between panels of categories;
  `CategoryLogList` filters one list in place with a roving-tabindex strip. Different
  problems.
- **`ActionSummary`'s GOIR row and the admin marker.** A `FactRow` in a definition list and an
  operator marker; both still guarded, neither with an unverified branch.
- **Search and list cards.** Surface-specific by design; their metadata is now shared, which
  is where the drift risk was.
- **`PageHeader`.** Four pages, two hero shapes differing in five ways. Reconciling them
  behind a props-switch would freeze the inconsistency while looking resolved; picking one
  look is a visual decision for `UI-IMPECCABLE-1`.
- **`Pagination`.** Still zero consumers. No usage invented.

### A lifecycle bug the merge exposed

`lib/posts/lifecycle.ts` states an action deadline is orthogonal to the lifecycle *kind*, and
`isLifecycleClosed()` already treats a passed deadline as closing either kind — but only the
notification template rendered it. **A GO with an application window was filtered as closed
while its own page showed no deadline at all.** The merged shell shows it for both, so the
page and the filter now agree.

### A miscoloured warning the tone model exposed

`GpfApgliUI` told a user their APGLI premium was *below* the required minimum, painted
`tamarind` — the in-force colour — with a ⚠️ emoji carrying the meaning the colour
contradicted. Now `tone="warning"`, and the emoji is gone.

### Guards

`test/patterns.test.tsx` (18), covering GOIR in both directions, `Issued` vs
`Added to portal`, callout tone mapping, and both lifecycle kinds through the merged shell.
Six mutations run — **all six caught, zero survivors**.

Three older source-text assertions were updated rather than deleted: they pinned the *old
implementation* (`post.verifiedAgainstGoir && <Badge`) of a rule the new structure enforces
more strongly, so they now assert the new mechanism.

## `UI-STATES-1` outcome summary

Full route/workflow classification (loading/empty/error/success × every public route) lives in
`docs/context/UI_ACTIVE_GATE.md`, which stays the recoverable record for this gate; this is the
summary.

### Loading — five `loading.tsx` routes added

`/`, `/orders`, `/category/[slug]`, `/posts/[slug]`, `/search` are the only public routes that
query Prisma (confirmed by grep this gate); each now has a route-level `loading.tsx` built from
the new `Skeleton` primitive. Static chrome that needs no data (`DesktopLeftNav`,
`DesktopSidebar`, `OrdersSidebar`) renders for real inside the loading state rather than being
skeletoned too, so only the genuinely async part of the page shows a placeholder.

### The search debounce needed a mechanism, not just a skeleton

`UI_AUDIT.md`/this document flagged `SearchUI`'s 400ms debounce as having "no pending affordance
at all." A naive `search/loading.tsx` would have fired on every keystroke's `router.push` (a
searchParams-only navigation still re-invokes the page and hits the nearest `loading.tsx`),
blanking the input mid-type. Wrapping the debounced `router.push` calls in `startTransition`
keeps the previous results mounted instead; `SearchUI` derives its own pending state as
`value.trim() !== query.trim()` (no second state variable to keep in sync with a completion
signal `router.push` doesn't provide) and shows an inline "Searching…" `role="status"` text.
`search/loading.tsx` still exists, covering the one case `startTransition` does not: a fresh
hard navigation into the route.

### Empty states — one primitive replacing seven hand-written divs

`EmptyState` (with a `compact` variant for the two in-card instances) replaced independently
hand-written "nothing here" panels in: the home feed, `CategoryLogList`'s filtered/empty log
(which a genuinely empty category also hits), both of `OrdersFilterTabs`'s empty branches, and
two in `SearchUI` (no-matches, and the previously-silent "Recent Documents" section on both
`/search` and `/orders`). The no-matches state also gained a next step (a link to `/orders`).

Decorative surfaces that already degrade silently — `PostNavCards`, `CategoryStacksGrid`,
`UpcomingActionDates` — were left alone: converting a bonus surface's "nothing to show" into a
visible panel would add weight `DESIGN.md`'s restraint rule does not ask for, and
`lib/db-safe.ts`'s `optionalQuery` doc comment already names silent degradation as the correct
contract for exactly this kind of surface.

### Error and success — mostly already adequate, confirmed rather than rebuilt

`app/(public)/error.tsx` (bilingual, specific, retry action, no internals exposed) already
covers every `safeQuery` failure across all five DB-backed routes, and `notFound()` is
unchanged everywhere it was already used. Success states remain **not applicable** on the
public surface — re-confirmed this gate that `window.print()` is still the only action and
still browser-confirmed, exactly as `UI-AUDIT-1` closed it. "Invalid user input" for the
tools/pensioners calculators was checked and found to have no genuine consumer: none of them
currently reject or flag input (blank reads as 0), so a validation-error UI would invent a
rejection behaviour the product doesn't have — deferred, recorded in `UI_ACTIVE_GATE.md`.
`app/admin`'s real mutations remain outside this program's scope, per `UI-AUDIT-1`.

### Guards

`test/states.test.tsx` (21) plus 3 added to `test/search-ui.test.tsx`, covering: `Skeleton`'s
and `EmptyState`'s contracts, structural presence of `role="status"` and `Skeleton` in all five
`loading.tsx` files (and absence from four confirmed-static routes), `OrdersFilterTabs`'s and
`CategoryLogList`'s empty branches, the home feed's empty/populated branches via the same
mocked-Prisma render technique as `test/today-attention.test.tsx`, and the search pending
indicator's appear/clear cycle. Eight mutations run — **all eight caught, zero survivors**.

## Known limitations

- Browser acceptance tooling is not currently runnable in this environment.
- Therefore no browser-rendered, responsive viewport, interaction, screenshot, or
  real-device evidence is claimed for `UI-BASELINE-0` or `UI-AUDIT-1`.
- `UI_AUDIT.md` lists eight items that genuinely require a rendered browser or a real
  device; they are recorded as unverified rather than assumed to pass. Notably: actual
  horizontal-scroll behaviour at 320–430px, the visual result of the stacked bottom bars,
  the 768–1023px navigation band, iOS focus zoom and safe-area clipping, and colour-contrast
  ratios for the `inkSoft` family in both themes.
- The full Vitest suite was not run for `UI-AUDIT-1` or `UI-DESIGN-1` because neither gate
  changed application code. `npx tsc --noEmit` passes for both. `UI-REGRESSION-1` owns full
  regression verification.
- **Impeccable was not available** in this environment, so no external design critique was run
  for `UI-DESIGN-1`. The critique recorded in `DESIGN.md` is self-applied against the audit
  findings and the product constraints. `UI-IMPECCABLE-1` remains the gate that would use it,
  and `DESIGN.md` is what it should critique against.
- **No colour-contrast ratios have been measured.** `DESIGN_SYSTEM.md` specifies token pairings
  and roles, but the 4.5:1 / 3:1 requirements are unverified in both themes. `UI-A11Y-1` owns
  verification and may adjust values; the roles should survive any such adjustment.
- `DESIGN_SYSTEM.md` is a specification. `UI-SYSTEM-1` implemented its foundation sections;
  §15 records exactly what is done and what is carried forward. Where the rest of it and the
  code still disagree, the code is the defect and `UI_AUDIT.md` records it.
- **No visual verification was possible for `UI-SYSTEM-1`.** The suite proves the classes
  compile, the cascade resolves, and the mappings are right; it cannot show what the pages
  look like. The changes with a visible effect and no browser check are: badge type 9/10px →
  12px, shared-primitive type 10/11px → 12px, form controls 12px → 16px on mobile with a 44px
  minimum height, the active-navigation rule replacing coloured fills, and the removal of
  shadows that never rendered. `UI-ACCEPTANCE-1` owns confirming these.
- **`UI-RESPONSIVE-1` is the gate least served by the test suite.** jsdom does not lay out, so
  nothing here proves a page does not scroll sideways at 320px. What is proven is structural:
  bar count, absence of `w-screen` and oversized fixed widths, absence of a shell-level
  `overflow-x-hidden`, breakpoint agreement, and keyboard-reachable scroll regions. Every
  claim about actual rendering at 320/360/375/390/430/768/1024/1440 remains unverified and
  belongs to `UI-ACCEPTANCE-1` — in particular the single-column tax-calculator forms, the
  scrolling TDS block, post pages with one bottom bar, and the sticky bars at `top-[76px]`
  now that the header height is assumed rather than measured.
- **No visual verification was possible for `UI-SYSTEM-2` either.** Changes with a visible
  effect and no browser check: `Button` `md`/`lg` and pagination controls are taller, the
  theme toggle is now an inline SVG rather than emoji, the search clear control is a 44px
  button, and the admin modal is rebuilt on `Dialog`. `UI-ACCEPTANCE-1` owns confirming these.
- Still carried forward (see `DESIGN_SYSTEM.md` §15): ~100 sub-12px sizes in route-local
  components, emoji used as iconography outside `ThemeToggle`, and the recurring
  tinted-callout pattern awaiting the semantic decision `UI-PATTERNS-1` owns.
- The sidebar drawer's own behaviour — Escape, focus trap, scroll lock, closed-state
  inertness — is unchanged and remains `UI-MOBILE-NAV-1`. `Dialog` now demonstrates the
  contract that gate has to meet.
- **21st.dev was not available**, so the external-component rule was never exercised. No
  external component was imported and no second visual language was introduced.

## Validation evidence

| Gate | TypeScript | `git diff --check` | Test suite | Browser |
|---|---|---|---|---|
| `UI-BASELINE-0` | pass | clean | not required (docs only) | unavailable |
| `UI-AUDIT-1` | pass (`npx tsc --noEmit`, exit 0) | clean | not required (docs only) | unavailable |
| `UI-DESIGN-1` | pass (`npx tsc --noEmit`, exit 0) | clean | not required (docs only) | unavailable |
| `UI-SYSTEM-1` | pass (`npx tsc --noEmit`, exit 0) | clean | **44 files, 288 tests pass** (incl. DB-backed trust + dark-mode suites) | unavailable |
| `UI-SYSTEM-2` | pass (`npx tsc --noEmit`, exit 0) | clean | **46 files, 318 tests pass**; Tailwind utility validation passes | unavailable |
| `UI-RESPONSIVE-1` | pass (`npx tsc --noEmit`, exit 0) | clean | **47 files, 330 tests pass**; Tailwind utility validation passes | unavailable |
| `UI-MOBILE-NAV-1` | pass (`npx tsc --noEmit`, exit 0) | clean | **48 files, 347 tests pass**; Tailwind utility validation passes | unavailable |
| `UI-PATTERNS-1` | pass (`npx tsc --noEmit`, exit 0) | clean | **49 files, 365 tests pass**; Tailwind utility validation passes | unavailable |
| `UI-STATES-1` | pass (`npx tsc --noEmit`, exit 0) | clean | **50 files, 389 tests pass**; Tailwind utility validation passes | unavailable |
| `UI-CONTENT-1` | pass (`npx tsc --noEmit`, exit 0) | clean (CRLF notices only) | **55 files, 402 tests pass** (DB-backed suite run against a native-Postgres stand-in; see Environment note above) | unavailable |
| `UI-SEO-1` | pass (`npx tsc --noEmit`, exit 0) | clean (CRLF notices only) | **58 files, 410 tests pass** | not a full browser check, but `next build` + `next start` + `curl` verified real rendered `<head>` output (title/description/canonical/OG/Twitter/robots/favicon) across static, dynamic, and query-bearing routes — see gate notes |
| `UI-LINKS-1` | pass (`npx tsc --noEmit`, exit 0) | clean (CRLF notices only) | **61 files, 420 tests pass** | not a full browser check; every hardcoded external URL verified live via `WebFetch`+`curl` (DNS/HTTP status, not source reading); `next build` + `next start` + `curl` confirmed real destinations render on `/pensioners`, `/tools/cfms-checker`, and a post-detail page — see gate notes on why raw body-text `curl` checks are unreliable for element order/count |

## `UI-CONTENT-1` outcome summary

Full findings-to-disposition detail lives in `docs/context/UI_ACTIVE_GATE.md`, which stays
the recoverable record for this gate; this is the summary.

### Closed

- **F16 — WhatsApp banner.** Deleted (`WhatsAppBanner.tsx` and its two usages). `PRODUCT.md`
  named removal as the default outcome; `AGENTS.md`'s hard rules already banned the channel.
- **F25 — AP-only scope lock violated by copy.** Fixed in five places, two more than the
  audit named. A repo-wide guard (`test/scope-lock.test.ts`) now scans all of `app/(public)`
  for the phrase pattern instead of relying on the next grep to catch the next instance.
- **F30 — hardcoded, unverified quick-search and topic-tag chips.** Both are now filtered
  server-side against real content before render (`lib/posts/query.ts`'s `quickSearchChips`
  and `tagsWithPublishedContent`), so a chip can no longer promise a search that returns
  nothing. Self-correcting as content is published or archived — no future manual
  re-verification needed.
- **Tools-index step-flow chips** (found this gate, not in the original audit) — all six tool
  cards claimed an identical "Fill Details → Auto-Calculate → Export PDF" flow; only two
  tools actually implement export, and one tool (CFMS) is a links directory with none of the
  three steps. Each tool's claimed steps now come from its own `steps` array, checked against
  that tool's actual component.
- **`PrcCalculatorUI.tsx` HRA preset bug** (found this gate) — selecting any HRA preset other
  than the default silently had no effect on the fixation result. One-line fix; not a copy
  defect, but left in scope because it directly made the field's own label false.

### Checked and found accurate

Every other tools/pensioners page's descriptive copy was checked against that same file's
own logic (GPF/APGLI rates, EL limits, the 180-month commutation figure, the office-pipeline
step count) and found internally consistent — see `UI_ACTIVE_GATE.md` for the full list.

### Left alone, deliberately

- **Emoji iconography** (`🕐 Recent Documents`, `📜`, etc.) — this is `UI_AUDIT.md` F21, a
  visual-consistency question (two parallel icon systems), not a content-accuracy one. Left
  for whichever visual gate (`UI-IMPECCABLE-1` or `UI-21DEV-1`) owns icon-system decisions.
- **FY 2025-26 tax-year branding** — reads as calendar-stale against today's date, but
  correcting it would mean fabricating a not-yet-verified future Union Budget's tax slabs,
  which `AGENTS.md` forbids outright. Recorded as a known limitation, not fixed with guessed
  numbers.
- **`[DEMO]`-titled seed posts** in the local database — intentional fixtures guarded by
  `test/seed-integrity.test.ts`, not production content.

### Guards added

`test/scope-lock.test.ts`, `test/no-fabricated-channel.test.ts`, `test/tools-index.test.tsx`
(3), `test/prc-calculator-ui.test.tsx`, `test/topic-tag-bar.test.tsx` (3), plus 4 tests added
to `test/search-query.test.ts`. Every one mutation-tested against the defect it exists to
catch — zero survivors.

### Environment note

Docker Desktop's engine was not running this gate, so the Postgres container the DB-backed
suite normally targets (`localhost:5433`) was unreachable. Verified instead against an
equivalent schema on the machine's separately-running native PostgreSQL service; `.env.test`
itself was not changed. A future session should not assume Docker is required to run this
suite in every environment, but should confirm which database is actually reachable before
trusting a "tests pass" claim.

## `UI-SEO-1` outcome summary

Full findings-to-disposition detail lives in `docs/context/UI_ACTIVE_GATE.md`, which stays
the recoverable record for this gate; this is the summary.

### Product constraint

The founder set a rule before this gate started: titles/descriptions must be factual, never
promotional "sell" copy. Applied by removing evaluative words from several descriptions
while keeping true, load-bearing facts (free, 100% client-side, GOIR-verified) — see
`UI_ACTIVE_GATE.md` for the specific before/after wording.

### Closed

- **F23 — inert title template.** Real template now (`"%s — AP Teacher Desk"`); every route's
  own title is bare, except the home page, which sits in the same segment folder as the
  layout defining the template and — per Next.js's actual (undocumented-in-the-obvious-place)
  behaviour — a layout's `title.template` does not reach a `page.tsx` in its own segment, only
  descendants. Only found by building and curling the real output.
- **F24 — three over-length titles**, plus three over-length descriptions found applying the
  same standard. Shortened, reusing existing phrasing rather than inventing new copy.
- **F9 — duplicated localhost-fallback.** One `lib/site.ts` helper now; still falls back
  locally (correct), `console.error`s if the fallback fires in production.
- **Favicon, canonical, OpenGraph/Twitter, robots.txt, sitemap.xml** — all absent, all added.
  The favicon is a static hand-written SVG reusing the site's own existing masthead-navy /
  turmeric "AP" monogram, not new branding. `sitemap.ts` queries live categories and published
  posts and degrades to static routes only on a DB failure rather than 500ing.

### Found and fixed outside the original audit

- **"Offline Ready"** — an unsupported claim (no service worker/manifest/cache strategy
  anywhere) in two places, same defect shape as `UI-CONTENT-1`'s WhatsApp banner (F16), missed
  by that gate's audit because it lives in `DesktopSidebar`/the layout's own sidebar footer.
- **`DesktopSidebar`'s "Quick Searches" widget** — the exact F30 shape (hardcoded, unverified
  `/search?q=` chips, one carrying a stale year) `UI-CONTENT-1` fixed in `SearchUI`/
  `TopicTagBar` but missed here because this component wasn't in that gate's audit. Fixed the
  identical way: verified server-side against real content before render.
- **`/category/[slug]` title doubling "Orders"** for the "Government Orders" category
  specifically — found by curling a real category page, not visible from source alone.
- **Two `generateMetadata` catch blocks hand-duplicating `"AP Teacher Desk"`** a third time in
  the same file — now return `{}` and correctly inherit the layout default instead.

### Why this gate ran an actual build

Reading source was insufficient — the OpenGraph/title-template segment-adjacency behaviour
above is not something `tsc` or a component-render test can catch, and the favicon approach
that looked correct in source (`next/og`'s `ImageResponse`) crashed only during `next build`'s
static-export prerender step, on a Windows-specific font-loading bug in `@vercel/og`. This
gate ran `next build` + `next start` + `curl` across the home page, several static routes, a
dynamic post, and a dynamic category — not just one representative route — which is also what
caught a stale server process silently serving pre-rebuild output during verification (a
second, unrelated way source-level confidence would have been wrong). Recorded as a practice
worth carrying forward below.

### Guards added

`test/no-offline-claim.test.ts`, `test/desktop-sidebar.test.tsx` (3), `test/category-
metadata.test.ts` (4). Both behavioural fixes (the sidebar conditional, the category title)
were mutation-tested — zero survivors.

## `UI-LINKS-1` outcome summary

Full findings-to-disposition detail lives in `docs/context/UI_ACTIVE_GATE.md`, which stays
the recoverable record for this gate; this is the summary.

### `mailto:`/`tel:`

No genuine contact information exists anywhere in the public UI. Re-confirmed, not
re-invented. Recorded as not-applicable, same as `UI-AUDIT-1`'s original disposition.

### Closed

- **Three dead external government-portal domains**, found by live `WebFetch`/`curl`, not
  source reading — `agap.cas.nic.in` and `agap.ap.nic.in` (AG AP's office; both migrated to
  the verified-live `agaeap.cag.gov.in`) and `esr.ap.gov.in` (e-SR; no working replacement
  found despite a real, recent relaunch — GO 57, 2026-07-20 — so removed rather than guessed).
  Two `http://www.ehs.ap.gov.in` links upgraded to `https` (the only variant that resolves).
- **Post-detail "Category Stacks" widget** — three compounding defects in one small
  component, all found by actually curling a real post page: "View More" 404'd on two
  invented category slugs; the second stack silently reused the first stack's posts reversed
  instead of a real per-category query; a "NEW" badge was assigned by array position, not any
  real date. Fixed: the second stack now queries the real `tools` category and hides itself
  when empty; the first links to `/orders` (its real scope — site-wide, not a category); the
  fabricated "NEW" badge is gone (not replaced with an invented freshness threshold).
- **A third instance of the recurring hardcoded/unverified quick-search-chips defect**
  (`OrdersSidebar`, missed by both `UI-CONTENT-1` and `UI-SEO-1`'s audits) — fixed by reusing
  the same `lib/posts/query.ts` verification functions built once, not reimplemented.

### A real, documented gap in the existing link-crawl guard

`test/link-crawl.test.ts` only matches literal `href="/path"` JSX attributes. Two of this
gate's three internal-link defects were sitting in its exact blind spot (a template-literal
href built from a hardcoded string, and an object-literal `href:` property). Widening the
regex to resolve arbitrary dynamic expressions was considered and rejected — it would need
real expression evaluation, not a smarter regex — so this stays a known limitation the next
audit-shaped gate should manually re-check for, not something automated away here.

### A verification-method lesson, not a code defect

A raw `curl`+`grep` scan of a Next.js App Router response's *body* text over-counts and can
appear to show elements in the wrong order, because the RSC hydration payload embeds the same
rendered content again as escaped JSON inside `<script>` tags. This never affected `UI-SEO-1`
(which only ever checked `<head>` tags, not duplicated by RSC streaming) but cost real time
this gate chasing a phantom ordering bug in `<body>` content. The reliable check for body
content is a component-level React Testing Library render — exactly what this gate's new
tests do — not a raw HTTP text scan. `curl` remains right for `<head>` metadata and for
confirming a string/URL is or isn't present anywhere in a response at all.

## Gate transition rule

Update `UI_ACTIVE_GATE.md` only when work on the next gate actually begins. Each closed
gate's evidence remains recoverable from this document, from `docs/ui/UI_AUDIT.md`, and from
Git history.

`UI-404-1` is next per the master plan: add a useful custom not-found/unavailable experience
with recovery paths (`app/not-found.tsx` doesn't exist yet — `notFound()` calls currently fall
through to the unstyled Next.js default, per `UI_AUDIT.md` F10).

Eight practices are worth carrying forward.

**Mutate every new guard.** In five of the last six gates a guard passed its first mutation and
had to be rewritten or, this gate, needed a genuinely new test to exist at all —
`CategoryLogList`'s empty-filter branch had zero coverage before this gate despite the component
itself being well-tested for its Open/Closed logic.

**Check the harness too.** `UI-PATTERNS-1`'s first mutation battery reported six false "survived"
results — an ANSI strip that left the ESC byte, and `String.replace` hitting a doc comment
instead of the code. A mutation harness that under-reports manufactures false confidence in
precisely the tests meant to prevent it.

**Test the screen, not only the mechanism.** A `Field` unit test passed while five real inputs
stayed unlabelled; a drawer test passed while the state reset it covered was gone.

**Merging duplicates surfaces divergence.** Both bugs fixed in `UI-PATTERNS-1` — the missing
deadline and the miscoloured warning — were invisible while the code was duplicated, and obvious
the moment it was not.

**Derive UI state from props already flowing through a component before adding a new state
variable.** `SearchUI`'s pending indicator (`UI-STATES-1`) is `value.trim() !== query.trim()`,
not a `useState` set by one effect and cleared by another — the two-effect version raced against
an unstable `useSearchParams()` reference in the test mock and, worse, would have raced for the
same underlying reason against real Next.js re-renders. A derived value has no completion
signal to get out of sync with, because it never depended on one.

**A hardcoded claim about content availability rots; a verified-at-request-time one doesn't.**
`UI-CONTENT-1`'s quick-search and topic-tag chips could have been "fixed" by hand-checking six
strings against today's database — a fix that starts going stale the next time a post is
published or archived. Filtering the candidate list against real content on every render
instead means no future gate has to re-verify it.

**For metadata/build-config gates specifically, run the actual build.** `UI-SEO-1` is the
first gate in this program to run `next build` rather than stopping at `tsc --noEmit` and
`vitest`, and it found two defects neither of those could reach: a Next.js segment-adjacency
rule (a layout's `title.template` doesn't format its own segment's `page.tsx`) that only shows
up in rendered `<head>` output, and a Windows-specific crash in `next/og`'s `ImageResponse`
that only fires during the static-export prerender step. `tsc` and component-render tests
check that code runs; they do not check that Next's own metadata resolution or build pipeline
produces what the source implies it will.

**A regex-based guard has a coverage shape, not just a pass/fail — know what it can't see.**
`test/link-crawl.test.ts` only matches literal `href="/path"` JSX attributes; `UI-LINKS-1`
found two real defects living entirely in that gap (a template-literal href built from a
hardcoded string, an object-literal `href:` property). The fix wasn't to make the regex
smarter — that needs real expression evaluation — it was to know the boundary exists and
manually audit the shapes the automated guard structurally cannot reach. The same applies to
`curl`-based body-content checks this same gate: RSC hydration payloads duplicate rendered
text inside `<script>` tags, so a raw text scan over-counts and can misreport order; a
component-level render (React Testing Library) is the reliable tool for body content, `curl`
for `<head>` metadata and presence/absence checks.
