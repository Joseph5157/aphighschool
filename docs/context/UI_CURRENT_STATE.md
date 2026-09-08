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

- Current phase: Phase 7
- Active gate: `UI-PATTERNS-1` (CLOSED)
- Scope in this gate: repeated application-level patterns only
- UI redesign performed: no
- Application behaviour changed: yes — foundation tokens, focus system, active-navigation
  treatment, state colours. Information architecture, routes and page composition unchanged.
- Next planned gate: `UI-STATES-1`

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
  Field, IconButton, Input, NativeSelect, Pagination, Separator, Sidebar, Table, Tabs,
  Textarea. *(Sheet was deleted in `UI-SYSTEM-1` as unused; the Phase 0 list above predates
  `UI-SYSTEM-2` and `UI-PATTERNS-1`.)*
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
- No route-level `loading.tsx` files were found.

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

## Gate transition rule

Update `UI_ACTIVE_GATE.md` only when work on the next gate actually begins. Each closed
gate's evidence remains recoverable from this document, from `docs/ui/UI_AUDIT.md`, and from
Git history.

`UI-STATES-1` is next per the master plan: deliberate loading, empty, error and success
states.

Groundwork already in place. `UI-AUDIT-1` established that **no route has a `loading.tsx`**,
that the home page is `force-dynamic` and both category and post pages are DB-backed, and that
`SearchUI` navigates on a 400ms debounce with no pending affordance at all. `UI-SYSTEM-2`
deliberately did **not** build `Skeleton`, recording that `UI-STATES-1` introducing
`loading.tsx` is exactly the condition that would justify it — so that is the gate to build it
in, with a real consumer.

Two constraints carry in hard. **Success states must not be invented**: the public surface is
read-only plus client-side calculators, and the only action is `window.print()`, which the
browser confirms — `UI-AUDIT-1` closed that checklist item as correctly not applicable, and it
should stay closed. And **errors must not leak internals**: `app/(public)/error.tsx` is the
model — bilingual, specific, offers a retry, exposes nothing.

Four practices are worth carrying forward.

**Mutate every new guard.** In four of the last five gates a guard passed its first mutation
and had to be rewritten.

**Check the harness too.** This gate's first mutation battery reported six false "survived"
results — an ANSI strip that left the ESC byte, and `String.replace` hitting a doc comment
instead of the code. A mutation harness that under-reports manufactures false confidence in
precisely the tests meant to prevent it.

**Test the screen, not only the mechanism.** A `Field` unit test passed while five real inputs
stayed unlabelled; a drawer test passed while the state reset it covered was gone.

**Merging duplicates surfaces divergence.** Both bugs fixed in this gate — the missing deadline
and the miscoloured warning — were invisible while the code was duplicated, and obvious the
moment it was not.
