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

- Current phase: Phase 1
- Active gate: `UI-AUDIT-1` (CLOSED)
- Gate commit SHA: `e1ec932c7ff411c81e72e9fcb89db7df55a53b8f` (audit starting point)
- Scope in this gate: read-only audit of the public application and documentation only
- UI redesign performed: no
- Application or production behavior changed: no
- Next planned gate: `UI-DESIGN-1`

### Gate history

| Gate | Status | Outcome |
|---|---|---|
| `UI-BASELINE-0` | CLOSED | Branch, baseline, roadmap and state tracking established. |
| `UI-AUDIT-1` | CLOSED | `docs/ui/UI_AUDIT.md` created; 36 findings, all components classified. |

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

## Known limitations

- Browser acceptance tooling is not currently runnable in this environment.
- Therefore no browser-rendered, responsive viewport, interaction, screenshot, or
  real-device evidence is claimed for `UI-BASELINE-0` or `UI-AUDIT-1`.
- `UI_AUDIT.md` lists eight items that genuinely require a rendered browser or a real
  device; they are recorded as unverified rather than assumed to pass. Notably: actual
  horizontal-scroll behaviour at 320–430px, the visual result of the stacked bottom bars,
  the 768–1023px navigation band, iOS focus zoom and safe-area clipping, and colour-contrast
  ratios for the `inkSoft` family in both themes.
- The full Vitest suite was not run for `UI-AUDIT-1` because the gate changed no application
  code. `npx tsc --noEmit` passes. `UI-REGRESSION-1` owns full regression verification.

## Validation evidence

| Gate | TypeScript | `git diff --check` | Test suite | Browser |
|---|---|---|---|---|
| `UI-BASELINE-0` | pass | clean | not required (docs only) | unavailable |
| `UI-AUDIT-1` | pass (`npx tsc --noEmit`, exit 0) | clean | not required (docs only) | unavailable |

## Gate transition rule

Update `UI_ACTIVE_GATE.md` only when work on the next gate actually begins. Each closed
gate's evidence remains recoverable from this document, from `docs/ui/UI_AUDIT.md`, and from
Git history.

`UI-DESIGN-1` is next per the master plan and should proceed as planned. Note that P0
findings 1–4 above are correctness defects rather than design questions: they will need
fixing regardless of which visual direction `UI-DESIGN-1` selects, and findings 2–4 are
token/foundation-layer problems that later gates would otherwise build on top of.
