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

- Current phase: Phase 20 — **program CLOSED**
- Active gate: none. Last gate: `UI-SYSTEM-CLOSE` (CLOSED)
- Scope in the final gate: program-closure per Phase 20 — gate accounting, original-checklist
  disposition, delivered-outcomes summary, known-limitations preservation, Impeccable/21st.dev
  disposition, fresh final verification, repository documentation update, and a
  merge-readiness verdict. No new features, redesigns, or speculative cleanup.
- UI redesign performed: no
- Application behaviour changed: no — `UI-SYSTEM-CLOSE` made no application code changes.
  Fresh `tsc`/full Vitest (64 files, 441/441, matching every gate since `UI-ACCEPTANCE-1`)/
  `next build` (87.3 kB shared bundle, unchanged) all clean; a Playwright browser pass
  re-confirmed the mobile drawer's full cycle (with a real click), the skip link, zero
  console errors across four routes including a dark-mode returning-visitor navigation, and
  the unchanged dynamic-route soft-404 behavior. One pre-existing uncommitted `.gitignore`
  change (protecting the untracked, never-committed local `.mcp.json`) was committed
  separately and explicitly before closure work began.
- Full closure record: `docs/context/UI_SYSTEM_CLOSURE.md`. Merge-readiness verdict:
  **READY FOR MERGE** (assessment only — not merged into `main`, per the master plan's
  standing boundary). `UI-DEVICE-1` remains BLOCKED, not converted to PASS.
- Next planned gate: none. The program is closed; see `UI_SYSTEM_CLOSURE.md` §7 for
  recommended follow-up work, none of which is a live gate.

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
| `UI-404-1` | CLOSED | Custom `app/(public)/not-found.tsx` and root `app/not-found.tsx` added with real recovery links. Pre-existing dynamic-route soft-404 (200 instead of 404) found, root-cause-eliminated down to "correlates with real route-group scale, no single file responsible" — left undone and precisely documented per explicit instruction (no Next.js upgrade, no unexplained workaround). 424 tests pass. |
| `UI-PERF-1` | CLOSED | No images anywhere in the app — the checklist's image items re-confirmed not applicable, not re-litigated. Found and fixed the real "frontend weight" work instead: `category/[slug]`'s posts query was unbounded *and* unselected (fetching every post's full `content` field for an entire category, on every view); the homepage's query fetched a `relatedFrom` relation neither `HeroCard` nor `PostCard` renders at all. Both narrowed to exactly the fields their consumers read. Unused-but-zero-cost `Pagination.tsx` recorded, not deleted (already tree-shaken, out of this gate's scope). 426 tests pass. |
| `UI-A11Y-1` | CLOSED | Re-audited all 17 accessibility-tagged audit items against current source rather than trusting old gate-history claims; 13 were already fixed by earlier gates (confirmed, not re-fixed). Fixed the 4 that were still genuinely open: three routes with no `h1` (a label span promoted in place) plus a fourth's duplicate `h1` demoted to `h2`; a missing skip-to-content link; `TableHead`'s missing `scope="col"` default; `Breadcrumb`'s current-page marker announcing a fake disabled link instead of just `aria-current`, plus a missing `title` for its truncated text. Contrast recorded as target-specified-but-unmeasured (no tooling), same disposition as every prior browser-dependent claim in this program. 436 tests pass. |
| `UI-IMPECCABLE-1` | CLOSED | Impeccable confirmed unavailable (checked, not assumed); manual structured review against `DESIGN_SYSTEM.md` instead, no browser tooling so no visual-acceptance claims made. Revisited `UI-PATTERNS-1`'s deferred `PageHeader` decision: preserved the four masthead variants (they carry real differences in page purpose), fixed only two unexplained token-drift cases — category/orders' `h1` switched from a raw size to the shared `.text-display` token. Fixed three calculator routes' `h1` styled with `font-mono` (`DESIGN_SYSTEM.md` §1: "Mono is not for... headings") onto `.text-card-title`. Deliberately left emoji iconography and ~100 sub-12px sizes untouched — both real, both explicitly owned by later gates that can actually render. 437 tests pass. |
| `UI-21DEV-1` | CLOSED | 21st.dev MCP found configured (`.mcp.json`, via `/plugin`) but not connected this session — checked via `ToolSearch`, not assumed; no component searched, compared, or imported, recorded rather than implied. Reviewed all nine named candidates (search, filters, empty states, dialogs, mobile nav, tables, callouts, 404, pagination) against current source; eight already adequate, pagination re-confirmed zero consumers (not reconsidered, per instruction). One real defect found inside "dialogs": `Dialog.tsx`'s title `h2` used `font-mono`, the same `DESIGN_SYSTEM.md` §1 violation `UI-IMPECCABLE-1` fixed on three route `h1`s — fixed the same way (dropped the mono face only). Deliberately did NOT widen the fix to ~12 other section-label headings still using `font-mono` elsewhere — those plausibly fall under `DESIGN.md`'s permitted "uppercase tracked labels," a larger, more ambiguous question than a selective-enhancement gate should decide blind. 438 tests pass. |
| `UI-ACCEPTANCE-1` | CLOSED | First gate with real browser rendering (Playwright MCP, confirmed connected via an actual navigation, not just configured). Tested all 9 named routes across all 8 named viewports; measured (not assumed) 4 real defects and fixed all 4: `HeroCard`'s date/CTA footer overflowed its own row at 320px (measured 65px past its flex parent) — added `flex-wrap`; a real React hydration-mismatch console error for returning dark-mode visitors — `suppressHydrationWarning` on `<html>`; `text-inkSoft/50\|60\|70` measured as low as 2.41:1 against the required 4.5:1 body-text contrast — bumped to `/80` (verified safe in both themes) across ~26 real informational-text sites, decorative/disabled/graphical-icon usages correctly left alone; `ThumbZoneBar` had no desktop-hiding class unlike sibling `BottomNav` — added `lg:hidden`, confirmed redundant with `ActionSummary`'s always-present links first. Also verified working (not just present in source): drawer open/Escape/focus-return/route-close, single nav breakpoint at 1024px in both CSS and JS, `BottomBarSlot` yield behavior, `Table`'s `UI-A11Y-1` fixes live, the loading skeleton actually engaging, empty states, 404, skip link end-to-end, dark mode. Decided (not re-deferred reflexively): sticky `top-[76px]` gap KEEP (harmless, measured), masthead border-opacity split KEEP (real but imperceptible), mono section-labels KEEP (per `UI-21DEV-1`'s already-made call, reconfirmed rendered), emoji iconography DEFER (unchanged), sub-12px text DEFER (stronger evidence now — confirmed legible but a real `DESIGN.md` 11px-floor violation; full fix is its own gate-sized sweep). 441 tests pass. |
| `UI-DEVICE-1` | **BLOCKED** | Explicitly framed by the user as distinct from `UI-ACCEPTANCE-1` — must catch touch behaviour, real mobile browser chrome, virtual keyboard behaviour, real safe-area/scrolling experience, and perceived usability, none of which desktop/emulated testing can prove. Checked thoroughly for real device access: `claude-in-chrome`'s `list_connected_browsers` returned empty (no paired Chrome anywhere, and mobile Chrome/Safari can't run extensions regardless); `.mcp.json` has only the `magic`/21st.dev server, no device-lab MCP; no `adb`; no `xcrun` (impossible on this Windows machine). Unlike `UI-IMPECCABLE-1`/`UI-21DEV-1`, no meaningful substitute existed — a source-level or emulated stand-in would have been exactly the kind of unverifiable claim this program refuses to make. Asked the user directly rather than guessing; the user chose to close it BLOCKED. No application code changed. |
| `UI-REGRESSION-1` | CLOSED | Full regression pass, not new exploration: fresh `tsc`/full Vitest (441/441, exactly matching `UI-ACCEPTANCE-1`'s count)/`next build` all clean. Browser re-verification confirmed all four `UI-ACCEPTANCE-1` fixes still hold, including dark mode + `ThumbZoneBar`-hidden-on-desktop tested together for the first time; console-error-free across Home/Category/Search/tax-calculator in both themes; the mobile drawer's full cycle and skip link both re-confirmed with a real click. One apparent focus-return failure was investigated and resolved as a test-methodology artifact (a programmatic `.click()` doesn't shift real focus), not a product defect — recorded as a reusable lesson. Zero regressions found; zero code changes made. |
| `UI-SYSTEM-CLOSE` | **CLOSED — program closed** | Final program-closure gate. Verified all 21 gate dispositions (`UI-DEVICE-1` left BLOCKED, not converted); checked the original 17-item production-readiness checklist item by item against current source and live commands rather than trusted history. Fresh full verification: `tsc` clean; 64 files/441 tests pass with Docker Postgres confirmed healthy (DB-backed tests included, not skipped); Tailwind compiled clean; `next build` succeeded with an unchanged 87.3 kB shared bundle; a real Playwright pass re-confirmed the mobile drawer's full cycle (open → dialog/scroll-lock → Escape → inert/focus-return, with a real click), the skip link, zero console errors across `/`, a post detail page (dark mode + returning-visitor localStorage scenario), a category page, and search, plus the unchanged (neither newly broken nor silently fixed) dynamic-route soft-404 behavior via `curl`. Confirmed `main`/`origin/main` unchanged at the program's own starting SHA. Handled a pre-existing uncommitted `.gitignore` change (protecting the untracked, never-committed local `.mcp.json`) as its own separate, explicit commit before closure work, per direct instruction not to bury it. Also found, via a repository-wide grep, that two of `PRODUCT.md`'s "Open product questions" (the WhatsApp banner, Telangana-in-metadata) are already resolved in code but the document text wasn't updated — recorded as a documentation-lag limitation, not fixed (out of this gate's document-update scope). No application code changed. Full record: `docs/context/UI_SYSTEM_CLOSURE.md`. Verdict: READY FOR MERGE (not merged, per standing boundary). |

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
- **Impeccable was not available**, checked twice now — at `UI-DESIGN-1` and again at
  `UI-IMPECCABLE-1` (`ToolSearch` plus a `PATH`/`npm ls` sweep, both empty). Both gates
  self-applied the critique against `DESIGN.md`/`DESIGN_SYSTEM.md` instead, without
  installing substitute tooling. A future gate that wants an actual Impeccable-run critique
  should re-check availability rather than assume either prior "unavailable" result is still
  current — the environment may change.
- **21st.dev MCP is configured but not connected.** `.mcp.json` gained a `magic`
  (`@21st-dev/magic`) server entry via `/plugin` partway through this program, but
  `UI-21DEV-1` found it not actually loaded in that session (`ToolSearch` empty; a newly
  added MCP server needs a session restart to load, which didn't happen mid-gate). No
  component was searched, compared, or imported as a result — every reviewed candidate
  happened to already be adequate anyway, so this was moot for `UI-21DEV-1` specifically, but
  a future gate wanting an actual tool-assisted external-component pass (for the still-open
  emoji-iconography item, in particular) should start a fresh session and confirm via
  `ToolSearch` first, rather than assume either this or the Impeccable result still holds.
- **~12 existing `h2`/`h3` "section label" headings still use `font-mono`** (e.g. "Recent
  Documents," "Teacher Calculators," sidebar subsection titles — found incidentally in
  `UI-21DEV-1` while reviewing `Dialog.tsx`'s own mono-heading defect). Deliberately left
  unflagged as a defect: `DESIGN.md`'s "constrain, do not ban" section permits "uppercase
  tracked labels... legitimate for genuine section labels," and every one of these dozen
  reads as exactly that, not a page/dialog-identity heading like the four already-fixed
  cases (three route `h1`s in `UI-A11Y-1`/`UI-IMPECCABLE-1`, `Dialog`'s title in
  `UI-21DEV-1`). Whether any of the dozen should also lose `font-mono` is a real but
  materially bigger and more ambiguous design question than a selective-enhancement gate
  should decide without rendering — recorded for whichever future gate wants to take it on,
  not silently fixed and not silently ignored.
- **Colour contrast: measured and fixed where it mattered most, not exhaustively swept.**
  `UI-ACCEPTANCE-1` got real browser tooling and used it to measure the `inkSoft` family
  (`DESIGN_SYSTEM.md` §14's own named highest-risk item) directly from computed styles in
  both themes: full-opacity `inkSoft` on `paper`/dark-`paper` comfortably passes (7.79:1 /
  8.32:1), but `inkSoft` at 50/60/70% opacity failed the 4.5:1 body-text requirement (as low
  as 2.41:1) across roughly 26 real informational-text sites — fixed by raising all of them
  to `/80` (verified to clear 4.5:1 in both themes from every starting opacity), leaving
  decorative/`aria-hidden`/disabled-state/graphical-icon usages alone since WCAG doesn't
  require it there. Not measured: every other token pairing in the app — this was a targeted
  fix of the one item `DESIGN_SYSTEM.md` named as highest-risk, not a full contrast audit of
  the whole palette. A future gate wanting full coverage should treat this as a start, not a
  finish.
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
- **`UI-IMPECCABLE-1` re-confirmed both items above are real and deliberately still open**,
  not overlooked: both need rendered verification to fix safely (icon replacement needs
  drawn/selected SVGs checked for alignment; ~100 size bumps risk wrapping regressions), which
  this gate's no-browser-tooling constraint ruled out. Neither is silently dropped — no new
  owner gate is assigned beyond what `DESIGN_SYSTEM.md` §15 already names
  (`UI-A11Y-1`/`UI-ACCEPTANCE-1` for sizes; `UI-21DEV-1` or a dedicated pass for icons).
  A third, smaller item was found this gate: page-header masthead borders split between
  `border-mastheadText/40` (`pensioners`, `tools`, `office-pipeline`) and `/35`
  (`service-desk`, `topics`) with no stated reason — a 5-percentage-point opacity difference
  too small to judge from source alone, deferred to `UI-ACCEPTANCE-1` rather than guessed at.
  **Resolved (KEEP) in `UI-ACCEPTANCE-1`:** measured both values directly from computed
  styles (`rgba(...,0.4)` vs `rgba(...,0.35)`) and screenshotted both — a real, numeric
  difference that is visually imperceptible in an actual render. Not changed, per that gate's
  instruction not to alter something that "merely differs stylistically" absent a
  demonstrated problem. Sub-12px sizes and emoji iconography were both re-checked in
  `UI-ACCEPTANCE-1` too and remain open — see that gate's outcome summary below for the
  updated, rendering-backed evidence (sub-12px text is now confirmed legible but a real
  `DESIGN.md` 11px-floor violation at some sites; a full fix is judged its own gate-sized
  sweep, not something to fold in here).
- The sidebar drawer's own behaviour — Escape, focus trap, scroll lock, closed-state
  inertness — is unchanged and remains `UI-MOBILE-NAV-1`. `Dialog` now demonstrates the
  contract that gate has to meet.
- **21st.dev was not available**, so the external-component rule was never exercised. No
  external component was imported and no second visual language was introduced.
- **Dynamic-route soft 404, found and precisely diagnosed in `UI-404-1`, not fixed.**
  `/posts/[slug]` and `/category/[slug]` return HTTP 200 (not 404) when `notFound()` fires
  for an unknown slug, and the resulting page carries two conflicting `robots` meta tags
  (`index, follow` and `noindex`). Isolated via `next build`/`next start`/`curl` testing to
  "correlates with the real `app/(public)` route group's scale," with `revalidate`,
  `generateStaticParams`, `loading.tsx`, `force-dynamic`, and the shared nav components each
  individually ruled out as the sole cause — see `UI-404-1`'s closure record in
  `docs/context/UI_ACTIVE_GATE.md` (or Git history at that gate's closure commit) for the
  full elimination trail. Explicitly **not** fixed this gate: no Next.js version change, no
  unexplained application-code workaround, per direct instruction. Owned by a dedicated
  future investigation or an explicitly-approved Next.js upgrade — not implicitly any later
  gate's job merely because it touches `app/(public)`.
- **`UI-DEVICE-1` is BLOCKED, not skipped or silently deferred.** No real device access
  exists in this environment (checked, not assumed — see the gate's own record in
  `UI_ACTIVE_GATE.md` and the gate-history table above for the full list of what was
  checked). Everything the master plan assigned this gate — touch behaviour, real mobile
  browser chrome, virtual keyboard behaviour, safe-area/scrolling as actually experienced on
  hardware, perceived usability — remains unverified by any real device. `UI-ACCEPTANCE-1`'s
  desktop-emulated viewport testing is not a substitute and was not treated as one. This
  stays open until either real device access becomes available in a future session (a
  physical device, a device-lab account, or similar) or the user explicitly decides
  otherwise; it is not implicitly satisfied by any other gate's work.

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
| `UI-404-1` | pass (`npx tsc --noEmit`, exit 0) | clean | **62 files, 424 tests pass** | not a full browser check; `next build` + `next start` + `curl -D -` (status + headers) verified all three representative cases (unmatched URL, invalid post slug, invalid category slug) for status code, not-found content, `robots` meta, and recovery links — table in `UI_ACTIVE_GATE.md`; `next` version unchanged (`14.2.35`) |
| `UI-PERF-1` | pass (`npx tsc --noEmit`, exit 0) | clean | **63 files, 426 tests pass**; both new/changed guards mutation-tested via `git stash` against the pre-fix source (both failed as expected, then passed clean after restore) | not a full browser check; `next build` succeeded with an unchanged bundle-size report (expected — server-side `select` changes don't affect client JS size); `next start` + `curl` smoke-tested `/`, `/orders`, and an invalid category slug for absence of 500s/error-boundary text |
| `UI-A11Y-1` | pass (`npx tsc --noEmit`, exit 0) | clean | **64 files, 436 tests pass**; all 4 new/changed guards mutation-tested (two `git stash` passes, since the heading-structure guards live in an untracked file a single stash doesn't move) — all failed against pre-fix source, all pass restored | not a full browser check (contrast unmeasured, recorded as a known limitation); `next build` succeeded, bundle-size unchanged; `next start` + `curl` against the three previously-headless routes confirmed exactly one real server-rendered `<h1>` on each, and confirmed the skip link + its target both appear in real rendered HTML |
| `UI-IMPECCABLE-1` | pass (`npx tsc --noEmit`, exit 0) | clean | **64 files, 437 tests pass** (incl. `test/tailwind-classes.test.ts`'s compiled-CSS validation); the new `font-mono`-heading guard mutation-tested via a scoped `git stash push` — failed against pre-fix source (all three offending routes listed), restored passing | not a full browser check, no visual-acceptance claim made (explicit constraint — no rendering tool exists); `next build` succeeded, bundle-size unchanged; `next start` + `curl` against `/tools/prc-calculator` and `/orders` confirmed the fixed classes in real rendered HTML and in the compiled, non-purged CSS |
| `UI-21DEV-1` | pass (`npx tsc --noEmit`, exit 0) | clean (an unrelated pre-existing `.gitignore` change from `/plugin` excluded, left for the user) | **64 files, 438 tests pass**; the new `Dialog` guard mutation-tested via a scoped `git stash push` of `Dialog.tsx` alone — failed against pre-fix source, restored passing | not a browser check; `next build` succeeded, bundle-size unchanged (one className edit); `Dialog` is conditionally client-rendered so no static HTML exists to `curl` — the RTL component test renders the real component with real props instead, the correct tool for this case |
| `UI-ACCEPTANCE-1` | pass (`npx tsc --noEmit`, exit 0) | clean (same unrelated `.gitignore` change still excluded) | **64 files, 441 tests pass**; the 3 new structurally-tested guards mutation-tested via a scoped `git stash push` of the 3 relevant source files — all 3 failed against pre-fix source, restored passing | **first real browser check in this program** — Playwright MCP, confirmed connected via an actual navigation; all 9 named routes × all 8 named viewports tested; `next build` succeeded before and after fixes, bundle-size unchanged; a second `next build` + `next start` pass with real published test data confirmed correct status codes and no server errors across routes |
| `UI-DEVICE-1` | not required — no application code changed | clean (same unrelated `.gitignore` change still excluded) | not required — no application code changed | **BLOCKED**: no real device access exists (see gate history row / outcome summary below for the full check) |
| `UI-REGRESSION-1` | pass (`npx tsc --noEmit`, exit 0), re-run fresh | clean (same unrelated `.gitignore` change still excluded) | **64 files, 441 tests pass** — exactly matching `UI-ACCEPTANCE-1`'s count, confirming no drift | full re-verification, not new exploration — Playwright confirmed all four `UI-ACCEPTANCE-1` fixes still hold (including a new combination: dark mode + `ThumbZoneBar` hidden together), zero console errors across four routes in both themes, drawer + skip link re-confirmed with a real click; `next build` succeeded with an identical bundle-size report |
| `UI-SYSTEM-CLOSE` | pass (`npx tsc --noEmit`, exit 0), re-run fresh | clean — the `.gitignore` change was committed on its own (`77921ca`) before this gate's work began, then the tree stayed clean throughout | **64 files, 441 tests pass** — exactly matching every prior count since `UI-ACCEPTANCE-1`; Docker's `portal-cms-db-1` confirmed healthy on 5433 first, so DB-backed tests ran for real; Tailwind compile (`npx tailwindcss ... --minify`) also run directly, exit 0 | full re-verification — Playwright connection confirmed via a real navigation; drawer full cycle with a real click, skip link, zero console errors on `/`, a post detail page (dark mode + `theme` already in `localStorage` before navigating), a category page, and search; `next build` succeeded with an identical 87.3 kB shared-bundle report; `curl` re-confirmed the unchanged dynamic-route soft-404 behavior and the real root/unmatched-URL 404 |

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

## `UI-404-1` outcome summary

Full findings-to-disposition detail, including the complete elimination trail for the
soft-404 diagnosis, lives in `docs/context/UI_ACTIVE_GATE.md`, which stays the recoverable
record for this gate; this is the summary.

### Built

- `app/(public)/_components/NotFoundContent.tsx` — bilingual message plus three recovery
  links (Home, Orders & Circulars, Search), written to assume nothing about its wrapper.
- `app/(public)/not-found.tsx` — the common case (explicit `notFound()` for a removed/renamed
  post or category); gets the full public shell automatically via the shared layout.
- `app/not-found.tsx` (root) — a genuinely unmatched URL; ships its own minimal standalone
  header since the public layout does not wrap this boundary.

### Found, diagnosed, explicitly left unfixed per instruction

`posts/[slug]`/`category/[slug]` return HTTP 200 instead of 404 on an unknown slug. Diagnosed
via an isolated minimal reproduction (a byte-for-byte copy of the real layout/error/not-found
files in a fresh route group correctly returns 404; the identical construct inside the real,
18-route `app/(public)` group returns 200), with `revalidate`, `generateStaticParams`,
`loading.tsx`, `force-dynamic`, and the shared nav components each individually tested and
ruled out. The user explicitly directed: no Next.js version change in this gate, and no
unexplained application-code workaround — document as a known framework/streaming limitation
instead. Both followed exactly. Recorded as a dedicated, standing entry in Known limitations
above (not folded into any later gate's implicit scope) and precisely detailed in
`UI_ACTIVE_GATE.md`, including a compounding wrinkle found during closure verification: the
soft-404 pages carry two conflicting `robots` meta tags (`index, follow` and `noindex`).

### Closure verification, exactly as instructed

A dedicated `next build` + `next start` + `curl -D -` pass against real dev data, run
immediately before closing this gate (not reused from earlier development testing),
covering all three representative cases with status code, not-found content, `robots` head
metadata, and recovery links each explicitly recorded — table in `UI_ACTIVE_GATE.md`. No
claim of a 404 status is made anywhere for the two known-soft-404 cases.

## `UI-PERF-1` outcome summary

Full findings-to-disposition detail lives in `docs/context/UI_ACTIVE_GATE.md`, which stays
the recoverable record for this gate; this is the summary.

### Images, dimensions, layout shift, lazy loading

Re-confirmed not applicable, not re-decided: no `<img>`, `next/image`, or `<Image>` usage
exists anywhere under `app/`; `public/` holds only `.gitkeep`. `UI_AUDIT.md` rows 5 and 20
already closed this at `UI-AUDIT-1` — this gate re-verified by grep rather than trusting a
seven-gate-old finding unchecked.

### Unnecessary frontend weight — the gate's real work

Two Prisma queries were over-fetching data their consuming components never render:

- **`category/[slug]/page.tsx`.** No `select` on the posts relation meant every published
  post in a category — unbounded, growing for the life of the product — had its full row
  fetched, `content` (the full document body/tables) included, even though `CategoryLogList`
  reads 14 named fields and none of the rest. Fixed with an explicit `select` matching
  exactly what the component consumes.
- **`app/(public)/page.tsx` (home page).** The `homepage-feed` query fetched
  `relatedFrom: { include: { relatedPost: true } }` for its 6 posts — a fully unrendered
  relation (`HeroCard`'s prop type declares it but never uses it in JSX; `PostCard` doesn't
  declare it at all), which also over-fetched each related post's own full row. Removed
  entirely, and the top-level fields narrowed to what `HeroCard`/`PostCard` actually read.

Everything else checked — `orders/page.tsx`, the rest of `posts/[slug]/page.tsx`'s
supplementary queries, `lib/posts/query.ts`'s search/recent-document queries, the font
loading strategy, the compiled Tailwind output size, `next-auth`'s bundle scoping, and every
route's First Load JS — was already correctly bounded/selected/scoped, confirmed via a real
`next build`'s own size report rather than assumed from source.

### Unused assets

`Pagination.tsx` has zero consumers (already noted at `UI-PATTERNS-1`: "Still zero consumers.
No usage invented.") but contributes zero bytes to any bundle since nothing imports it —
recorded as this checklist item's answer, not deleted, since removing a working, tested,
zero-cost primitive is a product call this performance-scoped gate doesn't license on its
own.

### Guards added

`test/query-weight.test.ts` (2, new) — source-guards that both queries stay field-selected
and never regain `content`/`relatedFrom`. `test/draft-leaks.test.ts`'s homepage-`relatedFrom`
guard was rewritten (not deleted) to assert the relation is absent entirely, since there is no
longer anything there to leak a draft through. Both mutation-tested via `git stash` against
the pre-fix source — confirmed failing, then restored and passing.

## `UI-A11Y-1` outcome summary

Full findings-to-disposition detail lives in `docs/context/UI_ACTIVE_GATE.md`, which stays
the recoverable record for this gate; this is the summary.

### Re-audited before fixing anything

17 accessibility-tagged items from `UI-AUDIT-1` (F4, F6, F7, F12, F13, F14, F15, F17, F26,
F27, F28, F31, F32, plus alt text, contrast, reduced motion, and other dialog/menu widgets)
were re-checked against **current source**, not against what earlier gate-history entries in
this document claimed. 13 were genuinely already fixed by `UI-SYSTEM-1`, `UI-SYSTEM-2`, and
`UI-MOBILE-NAV-1` — confirmed directly in the relevant files rather than trusted secondhand.
4 were still open.

### Closed

- **F12 — heading structure.** `CommutationTrackerUI`, `PensionCalculatorUI`,
  `PrcCalculatorUI` had no `h1` at all (a `Badge` + unheaded `<span>` was each route's only
  "header"); promoted that span to `h1` in place, no visual change. `TaxCalculatorUI` had two
  `h1`s across mutually-exclusive tab states (never simultaneously in the DOM, but still an
  inconsistent per-route heading identity); its printable-receipt section's heading demoted
  to `h2`, matching every sibling calculator's own print-view convention.
- **F17 (remainder) — skip-to-content link.** Added as the first element in
  `app/(public)/layout.tsx`, before the drawer/header/nav, targeting a new
  `id="main-content"` on the existing `<main>`.
- **F26 (remainder) — `<th>` scope.** `TableHead` now defaults to `scope="col"`
  (overridable), closing the one piece of the audit's table-semantics finding
  `UI-RESPONSIVE-1` didn't already cover.
- **F27 — breadcrumb semantics.** `BreadcrumbPage` no longer claims `role="link"
  aria-disabled="true"` (announcing a broken link) alongside its correct `aria-current="page"`;
  the truncated current-page text now carries a `title` with the full label.

### Re-confirmed, not re-fixed

F4 (focus indicator), F6 (iOS zoom), F7 (touch targets), F13 (field/error association), F14
(`Sheet` deleted, `Dialog` carries the full modal contract), F15 (accordion uses `hidden`),
F17's `aria-current`/`aria-label` half, F28 (shortcut guard), F31 (12px label floor), F32
(`ThemeToggle` details), alt text (none needed — no images anywhere), reduced motion
(substantive `prefers-reduced-motion` handling), and `Tabs.tsx` (already a correct WAI-ARIA
pattern) were all verified directly in source and left untouched.

### Contrast — specified, still not measured

`DESIGN_SYSTEM.md` §14 already states the target (4.5:1 body, 3:1 large text/UI boundaries,
both themes). This gate could not measure actual ratios — no browser or contrast tool exists
in this environment, the same limitation every browser-dependent claim in this program has
recorded. Not silently dropped: recorded as a carried-forward known limitation, owned by
whichever gate first has working browser/device tooling.

### Guards added

`test/heading-structure.test.tsx` (5, new file) — one real `h1` per fixed route, and the
tax-calculator's receipt tab confirmed not to introduce a second one. `test/
primitives.test.tsx` (+4) — `TableHead`'s scope default and override, `BreadcrumbPage`'s
`aria-current`/absence of the fake-link pair, and its `title` attribute. `test/a11y.test.ts`
(+1) — the skip-link source guard. All four mutation-tested in two `git stash` passes (a
second pass was needed because the heading-structure guards live in a file `git stash` alone
doesn't move until it's tracked) — all failed against pre-fix source, all restored passing.

## `UI-IMPECCABLE-1` outcome summary

Full findings-to-disposition detail lives in `docs/context/UI_ACTIVE_GATE.md`, which stays
the recoverable record for this gate; this is the summary.

### Impeccable checked, confirmed unavailable

`ToolSearch` and a `PATH`/`npm ls` sweep both came back empty. Per explicit instruction, no
substitute design tooling was installed — the same structured review ran manually against
`DESIGN_SYSTEM.md`, and the substitution is recorded rather than left implicit. Second time
this program has checked and gotten the same answer (`UI-DESIGN-1` first).

### The deferred `PageHeader` decision — resolved

`UI-PATTERNS-1` left this open ("picking one look is a visual decision for
`UI-IMPECCABLE-1`"). Found four masthead variants across 9 files, not the two originally
named — and decided **against** forcing one component: the ribbon variant (orders/category)
carries real document-index/count information the bordered variants (pensioners, tools,
service-desk, topics, office-pipeline) don't need, and the home page isn't a listing at all.
Collapsing four different purposes behind one props-switch was rejected for the same reason
`UI-PATTERNS-1` already rejected it. What WAS fixed: two unexplained token-drift cases inside
that variation — category/orders' `h1` used a raw `text-2xl md:text-3xl` size instead of the
`.text-display` token five sibling headers already use correctly.

### Fixed

- **Three calculator `h1`s styled as metadata.** `CommutationTrackerUI`,
  `PensionCalculatorUI`, `PrcCalculatorUI` — their `h1` (promoted from a label span in
  `UI-A11Y-1`) kept `font-mono text-xs`, directly violating `DESIGN_SYSTEM.md` §1 ("Mono is
  not for body copy, headings, or navigation labels"). Switched to `.text-card-title`
  (smallest defined heading token) rather than the larger `.text-display` tool-page headers
  use, to preserve these three routes' existing compact single-row density without an
  unverifiable-unrendered restructure.
- **Category/orders `h1` size drift**, covered above.

### Deliberately not touched, with reasoning shown

Emoji iconography and ~100 sub-12px route-local text sizes are both real, `DESIGN_SYSTEM.md`-
cited defects — but both need rendered verification (icon legibility/alignment; wrapping risk
from bumping ~100 sizes) that this no-browser-tooling environment cannot provide, and
`DESIGN_SYSTEM.md` §15 already assigns their ownership elsewhere. A smaller masthead-border
opacity split (`/40` vs `/35`) was found and deferred to `UI-ACCEPTANCE-1` for the same
reason — not a guess this gate was positioned to make safely.

### Guards added

One test added to `test/typography.test.ts`: a repo-wide scan that no `<h1>` in
`app/(public)` carries `font-mono`. Mutation-tested via a scoped `git stash push` of the
three fixes — failed against pre-fix source (all three offending files listed), restored
passing.

## `UI-21DEV-1` outcome summary

Full findings-to-disposition detail lives in `docs/context/UI_ACTIVE_GATE.md`, which stays
the recoverable record for this gate; this is the summary.

### 21st.dev checked, found configured but not connected

`.mcp.json` has a `magic` (`@21st-dev/magic`) entry from `/plugin` earlier this session, but
`ToolSearch` found no matching tool — a newly added MCP server needs a session restart to
load, which didn't happen mid-gate. Per instruction, this didn't block the gate: no
substitute tooling installed, no component searched/compared/imported, and that fact is
recorded rather than glossed over.

### All nine named candidates reviewed against current source

Search, filters, empty states, dialogs, mobile navigation, tables, callouts, 404, and
pagination — eight were already adequate for the product's actual audience (a teacher on a
mid-range phone, density-first), making 21st.dev's unavailability moot for those regardless.
Pagination's zero-consumer status was re-confirmed, not reconsidered, per the gate's own
instruction to only revisit it if it now has a genuine consumer.

### Fixed

`Dialog.tsx`'s title `h2` (the dialog's accessible name) used `font-mono` — the identical
`DESIGN_SYSTEM.md` §1 violation `UI-IMPECCABLE-1` fixed on three route `h1`s one gate ago.
Found by reading the file directly while reviewing "dialogs," not by trusting the "full
contract, untouched" summary at face value for every detail. Fixed the same way: dropped
`font-mono` only, no size change, since it's an in-context title rather than a page heading.

### Deliberately not widened

A tree-wide check found ~12 other `h2`/`h3` "section label" headings ("Recent Documents,"
"Teacher Calculators," sidebar subsection titles) still using `font-mono`. Unlike the four
already-fixed cases (a route's sole `h1`, a dialog's sole title), these plausibly fall under
`DESIGN.md`'s explicitly *permitted* "uppercase tracked labels... legitimate for genuine
section labels" — a real but much larger, more ambiguous design question than this gate
should decide without rendering to check the effect on density and hierarchy. Recorded in
Known limitations above, not fixed and not silently dropped.

### Deferred items re-checked, none resolvable here

Emoji iconography, ~100 sub-12px sizes, and the masthead border-opacity split all still need
rendering to fix responsibly — none resolved this gate, consistent with the instruction to
only revisit deferred items if they can be resolved *without* browser guessing.

### Guards added

One test added to `test/dialog.test.tsx`: the title heading never carries `font-mono`.
Mutation-tested via a scoped `git stash push` of `Dialog.tsx` alone — failed against pre-fix
source, restored passing.

## `UI-ACCEPTANCE-1` outcome summary

Full findings-to-disposition detail lives in `docs/context/UI_ACTIVE_GATE.md`, which stays
the recoverable record for this gate; this is the summary.

### Browser tooling confirmed connected, not just configured

Following the stated preference order, Playwright's MCP tools loaded via `ToolSearch` and — critically,
learning from `UI-IMPECCABLE-1` and `UI-21DEV-1` both finding a configured-but-disconnected
tool — an actual `browser_navigate` call confirmed a real Chromium instance responds. This
was the first gate in the program with genuine rendered evidence rather than source-level
inference for anything.

### Four real, measured defects found and fixed

- **`HeroCard`'s date/CTA footer**, `flex items-center justify-between` with no wrap,
  overflowed its own row by 65px at 320px (measured via `getBoundingClientRect`, not
  estimated) — fixed with `flex-wrap gap-x-3 gap-y-1`, the same pattern already used
  elsewhere in the codebase.
- **A real hydration-mismatch console error** for any returning visitor with dark mode
  already saved: the inline theme script sets `dark` on `<html>` before React hydrates,
  which the server-rendered markup can't know about. `suppressHydrationWarning` on `<html>`
  — React's own documented pattern for exactly this case.
- **`text-inkSoft` at 50/60/70% opacity failed 4.5:1 body-text contrast** — measured directly
  from computed styles at as low as 2.41:1. `DESIGN_SYSTEM.md` §14 had named this the
  highest-risk unmeasured item for two prior gates; computed the minimum opacity (80%) that
  clears 4.5:1 from every starting point in both themes, and applied it across ~26 real
  informational-text sites, deliberately leaving `aria-hidden` decorative glyphs, disabled
  controls, and one graphical (non-text) icon usage untouched since WCAG doesn't require it
  there.
- **`ThumbZoneBar` had no desktop-hiding class**, unlike its sibling `BottomNav` — a mobile
  action-bar pattern floated at the bottom of full-width desktop layouts. Confirmed
  `ActionSummary` already renders the identical links inline in the page body at every width
  before hiding it, so nothing was lost; added `lg:hidden`, matching `BottomNav`'s own
  convention exactly.

All four re-tested live after fixing, not just assumed fixed from the diff.

### Extensive verification of already-built mechanisms, not just new fixes

Confirmed working in a real browser, not just present in source: the mobile drawer's full
open/focus-trap/Escape/focus-return/route-close cycle; the single 1024px navigation
breakpoint in both CSS and the JS-driven sidebar; `BottomBarSlot`'s yield behavior; `Table`'s
`role="region"`/`scope="col"` fixes from `UI-A11Y-1`; the loading skeleton actually engaging
mid-transition (not just existing as a file); empty states; 404 (both the real case and the
unchanged known-limitation soft-404 case); the skip link's full keyboard path, including
actually landing on `#main-content`; dark mode's toggle mechanics and the masthead correctly
not inverting.

### Deferred items — decided, not reflexively re-deferred

Sticky `top-[76px]` gap: **KEEP** (harmless ~7px gap, confirmed via screenshot, not a
collision). Masthead border-opacity split: **KEEP** (real, measured, but visually
imperceptible — not changed for a stylistic-only difference with no demonstrated problem).
Mono section-labels: **KEEP** (per `UI-21DEV-1`'s already-made call; visually reconfirmed
legible and appropriately de-emphasized). Sub-12px route-local text: **DEFER**, with
materially stronger evidence than any prior gate could offer — spot-checked instances are
legible and don't break layout, but genuinely violate `DESIGN.md`'s explicit "never below
11px" floor for uppercase labels (found instances at 9px and 10px); the full ~100-instance/
42-file fix needs per-site wrapping verification that is itself gate-sized work, not
something to fold into an already-large acceptance pass. Emoji iconography: **DEFER**,
unchanged — confirmed still present in a real drawer screenshot, still needs actual icon
design work this gate isn't positioned to originate.

### Guards added

Three new tests: `HeroCard`'s footer-wrap structural precondition and `ThumbZoneBar`'s
`lg:hidden` (both in `test/responsive-layout.test.tsx`), and `<html>`'s
`suppressHydrationWarning` (`test/dark-mode.test.ts`). All three mutation-tested via a scoped
`git stash push` of the three relevant source files — all failed against pre-fix source,
restored passing. The contrast fix has no separate automated guard; its correctness is the
reproducible browser measurement recorded in `UI_ACTIVE_GATE.md`, re-checkable the same way.

## `UI-DEVICE-1` outcome summary — BLOCKED

Full record lives in `docs/context/UI_ACTIVE_GATE.md`, which stays the recoverable record for
this gate; this is the summary.

### The gate's purpose ruled out its own obvious fallback

Given before any checking began: this gate is not a repeat of `UI-ACCEPTANCE-1` — it exists
specifically to catch touch behaviour, real mobile browser chrome, virtual keyboard
behaviour, safe-area/scrolling as actually experienced on hardware, and perceived usability.
Unlike `UI-IMPECCABLE-1`/`UI-21DEV-1`, where "do the same review manually" was a real
fallback when a named tool turned out unavailable, none of what this gate is *for* can be
produced by source reading or Playwright's desktop viewport emulation — that distinction was
the user's own framing, and it correctly ruled out substituting emulated work and presenting
it as this gate's output.

### What was checked

`claude-in-chrome`'s `list_connected_browsers` returned an empty list — no Chrome instance is
paired to this account on any device (and mobile Chrome/Safari can't run extensions at all,
so this path was structurally incapable of reaching a real phone even paired). `.mcp.json`
has only the `magic`/21st.dev server; no device-lab MCP (BrowserStack, Sauce Labs, etc.)
exists. No `adb`. No `xcrun` (impossible on this Windows environment regardless). No new
tooling was installed to work around the gap.

### Decision

Asked the user directly which of four paths to take (close BLOCKED; the user tests manually
and reports back; the user has a device-cloud account to configure; something else). The
user chose: close as BLOCKED. No application code was touched.

## `UI-REGRESSION-1` outcome summary

Full record lives in `docs/context/UI_ACTIVE_GATE.md`, which stays the recoverable record for
this gate; this is the summary.

### Static verification, fresh

`npx tsc --noEmit` clean. Full Vitest suite: 64 files, 441 tests pass — exactly matching the
count at `UI-ACCEPTANCE-1`'s closure, confirming zero drift across the intervening
`UI-21DEV-1` (`Dialog.tsx` only) and `UI-DEVICE-1` (docs-only) commits. A clean
`rm -rf .next && next build` succeeded with an identical bundle-size report.

### Browser re-verification, targeted not exploratory

Re-published representative test data and, using the same Playwright tooling confirmed
working in `UI-ACCEPTANCE-1`, re-confirmed all four of that gate's fixes still hold:
`HeroCard`'s `flex-wrap`, the dark-mode `suppressHydrationWarning` fix (tested with the exact
returning-visitor scenario the original defect needed — `theme: dark` already in
`localStorage` before navigating), `text-inkSoft/80`'s continued presence, and
`ThumbZoneBar`'s `lg:hidden`. One combination not explicitly tested before — dark mode and
`ThumbZoneBar`-hidden-on-desktop simultaneously — was checked and found conflict-free.
Console errors: zero across four representative routes in both themes. The mobile drawer's
full cycle and the skip link were both re-confirmed working end to end.

### A test-methodology lesson, not a product defect

An initial check appeared to show the drawer's focus-return breaking (focus landed on the
skip link instead of the trigger after Escape). Investigated rather than reported as-is: the
cause was that a programmatic `element.click()` via `browser_evaluate` doesn't move real
browser focus the way an actual click does, so the drawer correctly captured the
still-genuinely-focused skip link as its return target — accurate behavior given that input,
not a bug. Re-tested with a real `browser_click` and focus returned to the trigger correctly.
Worth carrying forward: use a real click, not a programmatic one, whenever the thing under
test is focus state itself.

### Result

Zero regressions found. Zero code changes made.

## Program closure

`UI-SYSTEM-CLOSE` closed the program (Phase 20, the master plan's final step). There is no
next gate. `docs/context/UI_ACTIVE_GATE.md` is now a closure pointer rather than a live phase
tracker, and the full closure record — gate accounting, checklist disposition, delivered
outcomes, known limitations, Impeccable/21st.dev disposition, final verification evidence, and
the merge-readiness verdict — lives in `docs/context/UI_SYSTEM_CLOSURE.md`. `UI-DEVICE-1`
remains BLOCKED, not closed with device-verified evidence — it stays open for whenever real
device access becomes available, rather than being implicitly satisfied by `UI-REGRESSION-1`,
`UI-SYSTEM-CLOSE`, or any other gate's work. A future session that wants to reopen this program
(e.g. to act on `UI_SYSTEM_CLOSURE.md`'s recommended follow-up work) should treat that as a new,
explicitly authorized phase rather than resuming Phase 19/20 in place.

## Gate transition rule (historical — the program is closed)

Update `UI_ACTIVE_GATE.md` only when work on the next gate actually begins. Each closed
gate's evidence remains recoverable from this document, from `docs/ui/UI_AUDIT.md`, and from
Git history.

Sixteen practices are worth carrying forward.

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

**When a diagnosis's leading suspect turns out wrong, isolate before proposing again — and
know when to stop.** `UI-404-1`'s first theory (ISR/`revalidate`) and second theory
(`usePathname()` without a Suspense boundary) were both plausible, both matched real
published Next.js issue reports, and both were empirically wrong for this codebase — each
only found wrong by actually testing the specific fix, not by re-reasoning from the same
symptom.

A minimal, isolated reproduction (copy the suspect files into a throwaway route,
strip everything else out) settled definitively what broader speculation could not, and also
found the boundary of what's worth chasing: once individual elimination showed the cause
correlates with route-group scale rather than any single file, further guessing stopped being
productive, and the honest move was reporting the elimination trail back rather than trying a
fourth unverified theory.

**An unselected Prisma `include` is invisible to `tsc` and easy to miss by reading a
component's render output — check what the query actually returns, not just what the JSX
uses.** `UI-PERF-1`'s two defects (`category/[slug]`'s unbounded `content` fetch, the
homepage's entirely-dead `relatedFrom`) both type-checked cleanly and rendered correctly
before the fix — TypeScript's structural typing doesn't complain about extra fetched fields a
component's prop type simply doesn't mention, and a passing render tells you nothing about
what else silently rode along in the RSC payload. The check that actually finds this class of
defect is comparing a query's `select`/`include` shape against the full read-surface of every
component it feeds — not just the one obviously "main" consumer, since a related-data include
can be dead in one consumer and load-bearing in a sibling that looks superficially identical
(`posts/[slug]/page.tsx`'s own `relatedFrom` fetch was already correct, right next to the
homepage's dead one).

**A gate-history claim that a finding is "closed" is a claim about the state of the repo when
that entry was written — re-verify against current source before either re-fixing it or
trusting it's still true.** `UI-A11Y-1` opened with 17 accessibility-tagged findings and
found 13 already fixed by earlier gates whose own summaries never mentioned them by F-number
(they were incidental to what those gates were actually working on) — re-fixing any of those
13 would have been wasted, contradictory work. The remaining 4 were genuinely open despite
`UI_AUDIT.md`'s original disposition column pointing at this gate for all of them, which by
itself gave no signal about which four. The only reliable method was reading the actual
current file at the actual current line for every single item before deciding what this
gate's real scope was — a fork was used for exactly this read-heavy, decision-light pass, so
the 26-tool-call investigation didn't have to sit in the coordinating context before the
scoping decision that mattered.

**A "pick one pattern" instruction is not a mandate to pick one — the five-question test
exists to let "preserve the variation" be the answer.** `UI-IMPECCABLE-1` inherited a
`PageHeader` decision `UI-PATTERNS-1` explicitly deferred rather than made, and the easy,
visible-looking move would have been building one component and migrating four pages onto
it. That would have failed question 3 (does it improve comprehension) for the two pages —
orders/category — that carry information (document scope, live count) the other three
genuinely don't have a use for; forcing them into one shape would have hidden that
difference behind uniformity rather than resolved anything. The actual defect hiding inside
the "four different patterns" framing was much smaller and much safer to fix: two page
headers used a hand-picked font size instead of the shared token every sibling already used.
Separating "this variation is meaningful, leave it" from "this specific detail drifted with
no reason, fix it" is the whole value the five-question test adds over either reflexively
unifying everything or reflexively leaving everything alone.

**A found-and-fixed defect's exact boundary is itself a decision — fix what's verified, name
what isn't, and don't silently expand or silently drop the difference.** `UI-21DEV-1` found
`Dialog.tsx`'s title heading violating the same mono-heading rule `UI-IMPECCABLE-1` had just
fixed on three route `h1`s, and fixed it the same way. A tree-wide grep for the same pattern
then surfaced roughly a dozen more instances — and the easy paths were either fixing all of
them (silently expanding a one-line incidental finding into a repo-wide sweep this gate never
scoped or verified rendered) or fixing only the one found and staying quiet about the rest
(silently dropping a real, now-known pattern instead of recording it for whoever decides it
next). Neither was taken: the dozen were read closely enough to notice they plausibly fall
under a different, explicitly *permitted* rule (`DESIGN.md`'s "uppercase tracked labels...
legitimate for genuine section labels") rather than the banned one, which is itself a
judgment call worth stating rather than assuming — and that judgment, plus the exact count
and shape of what was left alone, went into `UI_CURRENT_STATE.md`'s Known limitations rather
than either the diff or silence.

**Structural/source-level confidence and rendered confidence catch genuinely different bugs
— neither substitutes for the other, and the gap runs both ways.** `UI-ACCEPTANCE-1`'s four
real defects were all invisible to everything this program had run before: `tsc`, the full
Vitest suite (jsdom doesn't lay out, so nothing there proves an element does or doesn't
overflow its row), and a design-system source read all passed clean on `HeroCard`'s footer,
the theme script, `inkSoft`'s opacity values, and `ThumbZoneBar`'s missing breakpoint class —
because each was a fact about *rendering*, not about the code's shape. But the reverse also
held: this gate's actual measurements (`getBoundingClientRect`, computed contrast ratios, a
caught-mid-transition loading skeleton) are things no amount of careful source reading could
have produced with real numbers instead of a guess. Once real rendering became available, the
newly-possible check was to *measure*, not to *look* — a screenshot alone would have missed
the 65px `HeroCard` overflow (it read as basically fine looking at it) and the 2.41:1 contrast
failure (subtle enough that eyeballing a screenshot is exactly how it survived several prior
gates already tagged "needs rendering"). The lesson isn't "browser testing matters" in the
abstract — it's that once you have it, reach for `evaluate`-driven measurement over visual
inspection wherever a number actually exists to check, the same way earlier gates learned to
compile Tailwind and diff emitted classes instead of reading class names and assuming.

**Not every tool gap has a substitute worth doing — recognize when the honest answer is
BLOCKED, not a downgraded version of the work.** Every prior tool-unavailability in this
program (Impeccable, 21st.dev) had a real fallback: the manual review was still genuine,
useful work product, just without the named tool's assist. `UI-DEVICE-1` was different
because the user defined its purpose specifically as *the things a fallback can't reach* —
touch behaviour, real mobile chrome, a real virtual keyboard, real safe-area/scrolling feel,
perceived usability. Reaching for the usual move (re-read the source, run Playwright again
with a phone-sized viewport, call it close enough) would have produced something that looked
like gate output but proved nothing the gate exists to prove — the exact shape of an
unverifiable claim this program has refused to make at every other gate. The tell was in the
user's own framing before any checking started ("the goal is not to repeat Playwright
acceptance"), which pre-ruled-out the fallback that would otherwise have felt natural to
reach for. Checking tooling honestly, finding nothing, and asking rather than quietly
downgrading the gate's scope to fit what was available is what kept the record trustworthy.

**A regression pass earns its keep by testing combinations, not by re-running what a single
gate already covered in isolation.** `UI-REGRESSION-1` didn't re-do `UI-ACCEPTANCE-1`'s
9-route × 8-viewport sweep — that would have been expensive and low-yield, since nothing had
changed in between. What it found worth doing instead was checking states that no single
gate had reason to combine: dark mode active *at the same time as* the desktop-hidden
`ThumbZoneBar` fix, a fresh navigation with `theme: dark` already sitting in `localStorage`
(the exact returning-visitor shape the hydration bug needed, not just "toggle it and see").
Each gate in this program tested its own slice well; a regression pass's distinct job is the
seams between slices, which is a different question than "does each piece still work
alone" and needs deliberately constructing states individual gates wouldn't have reason to.

**When a test result contradicts what should be true, check the test before recording a
defect.** `UI-REGRESSION-1`'s apparent focus-return failure was investigated rather than
written up as a regression, and the cause turned out to be the test harness (a programmatic
`.click()` never moved real focus in the first place), not the product. Recording it as a
defect would have been a false report; silently discarding it without understanding why
would have thrown away the actual lesson (real clicks for focus-state tests). Both the
investigation and its correct, narrow conclusion belonged in the record.
