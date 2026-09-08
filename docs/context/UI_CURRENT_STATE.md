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

- Current phase: Phase 2
- Active gate: `UI-DESIGN-1` (CLOSED)
- Scope in this gate: design definition and documentation only
- UI redesign performed: no
- Application or production behavior changed: no
- Next planned gate: `UI-SYSTEM-1`

### Gate history

| Gate | Status | Outcome |
|---|---|---|
| `UI-BASELINE-0` | CLOSED | Branch, baseline, roadmap and state tracking established. |
| `UI-AUDIT-1` | CLOSED | `docs/ui/UI_AUDIT.md` created; 36 findings, all components classified. |
| `UI-DESIGN-1` | CLOSED | `PRODUCT.md`, `DESIGN.md`, `docs/ui/DESIGN_SYSTEM.md` created; P0s specified for `UI-SYSTEM-1`. |

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
- Existing shared primitives include Accordion, Badge, Breadcrumb, Button, Card, Field,
  Input, NativeSelect, Pagination, Separator, Sheet, Sidebar, Table, and Tabs.
- Shared domain/navigation components include PostCard, OrderStateBadge, HeroCard,
  TopicTagBar, UpcomingActionDates, ThemeToggle, DesktopNav, BottomNav, and sidebar
  variants.
- Route-specific client components are colocated in route `_components` directories.
- Post detail uses route-local templates for notifications and GO/memo documents, plus
  route-local lifecycle, navigation, summary, table-of-contents, and related-content
  components.
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
- A shared sidebar provider implements viewport detection at 768px, a mobile off-canvas
  drawer, a desktop collapsible sidebar, an overlay, and a keyboard toggle shortcut.
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
- `DESIGN_SYSTEM.md` is a specification, not a description of current behaviour. Where it and
  the code disagree today, the code is the defect and `UI_AUDIT.md` records it.

## Validation evidence

| Gate | TypeScript | `git diff --check` | Test suite | Browser |
|---|---|---|---|---|
| `UI-BASELINE-0` | pass | clean | not required (docs only) | unavailable |
| `UI-AUDIT-1` | pass (`npx tsc --noEmit`, exit 0) | clean | not required (docs only) | unavailable |
| `UI-DESIGN-1` | pass (`npx tsc --noEmit`, exit 0) | clean | not required (docs only) | unavailable |

## Gate transition rule

Update `UI_ACTIVE_GATE.md` only when work on the next gate actually begins. Each closed
gate's evidence remains recoverable from this document, from `docs/ui/UI_AUDIT.md`, and from
Git history.

`UI-SYSTEM-1` is next per the master plan. Its scope is the design-system foundations only —
tokens, scales, focus treatment, and the guard tests — not component migration
(`UI-SYSTEM-2`), responsive repair (`UI-RESPONSIVE-1`), or navigation behaviour
(`UI-MOBILE-NAV-1`).

`DESIGN_SYSTEM.md` §15 carries the ordered implementation checklist for that gate. Its first
item is the dead-class guard test, deliberately: audit findings F2 and F3 both reached
production through a green suite, so the guard is what keeps every later item true. Each
checklist item needs a test that can fail for the right reason — a passing suite is not
evidence a token behaves correctly, since the `accent` defect survived an existing
colour-token test that only checked *defined* tokens compile and never that *used* classes
resolve.
