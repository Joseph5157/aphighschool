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

- Current phase: Phase 0
- Active gate: `UI-BASELINE-0`
- Scope in this gate: repository inspection and context documentation only
- UI redesign performed: no
- Application or production behavior changed: no
- Next planned gate: `UI-AUDIT-1`

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

## Known limitations

- Browser acceptance tooling is not currently runnable in this environment.
- Therefore no browser-rendered, responsive viewport, interaction, screenshot, or
  real-device evidence is claimed for `UI-BASELINE-0`.
- The full route and component quality audit is intentionally deferred to `UI-AUDIT-1`.

## Gate transition rule

Once `UI-BASELINE-0` is committed, pushed, and remote-verified, update
`UI_ACTIVE_GATE.md` only when work on `UI-AUDIT-1` actually begins. The baseline gate's
closure evidence should remain recoverable from Git history and the final handoff.
