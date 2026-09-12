# PWA capability & freshness audit — `PWA-AUDIT-0`

**Status: CLOSED. Immutable baseline.**

This is the audit of record for the PWA program, committed before any implementation so that
every later change has a written, prior reason — the same contract
`docs/ui/AI_SLOP_AUDIT.md` held for the slop program. Later gates may cite or supersede a
finding here, but they must not silently rewrite one.

Baseline: `main` at `ea0df9054d50e0dd4fcc469632d9992898636f89`, Next.js `14.2.35` (App Router).

Nothing was installed, added or configured in this gate. No manifest, no service worker, no
dependency, no change to `next.config.js`.

## Method

Classified against **build output, not source reading.** `npx next build` completed (42 static
pages generated, exit 0) and its route table is the authority for what is static, SSG or
dynamic. Source reading supplied the dependency graph; the build supplied the ground truth.

This follows the standing rule in this project that source reading alone has repeatedly
under-reported the real defect.

## Classification policy

| Category | Meaning |
| --- | --- |
| `OFFLINE_SAFE` | Genuinely client-only calculators that operate correctly with no network. |
| `STATIC_SAFE` | Safe to render/cache as static UI, but not necessarily useful offline. **Do not automatically advertise these as offline-capable.** |
| `NETWORK_ONLY` | Any route or data whose value depends on freshness or current authoritative content. |
| `NETWORK_FIRST` | **None at present.** Introduce only if a specific route is later identified where serving a stale fallback is explicitly acceptable. |

`NETWORK_FIRST` being empty is a finding, not an omission. Every data-bearing public route
carries lifecycle state, GOIR verification, or labelled dates, so a stale copy misinforms
rather than degrades. The codebase already draws this line at the data layer: `lib/db-safe.ts`
defines `safeQuery` as *"for any query whose absence would misinform the reader"* versus
`optionalQuery` for *"decorative surfaces only."* **Every `safeQuery` call site maps 1:1 onto
`NETWORK_ONLY`.** That mapping is the principled basis for this classification, not a judgement
invented by this gate.

## Route inventory

### `OFFLINE_SAFE` — 7 routes

All `○ Static` in the build output. No server work at request time, no network at runtime.

| Route | Route JS | Calculation source |
| --- | --- | --- |
| `/tools/tax-calculator` | 16.9 kB | slabs inline (`TaxCalculatorUI.tsx:310–331`) |
| `/tools/prc-calculator` | 6.94 kB | `lib/prc.ts` |
| `/tools/da-arrears` | 6.79 kB | `lib/calculators/da-arrears.ts` |
| `/tools/leave-encashment` | 5.53 kB | `lib/calculators/leave-encashment.ts` |
| `/tools/gpf-apgli` | 5.47 kB | inline constants |
| `/pensioners/pension-calculator` | 4.11 kB | `lib/pension.ts` |
| `/pensioners/commutation-tracker` | 2.23 kB | `lib/pension.ts` |

### `STATIC_SAFE` — 6 routes + 3 assets

`/tools`, `/pensioners`, `/service-desk`, `/topics`, `/pensioners/office-pipeline`,
`/tools/cfms-checker`, plus `/icon.svg`, `/robots.txt`, `/sitemap.xml`.

These render without a network, but several are navigational shells whose entire value is
links into `NETWORK_ONLY` routes or external government portals. Rendering offline is not the
same as being useful offline.

### `NETWORK_ONLY` — 5 public routes

| Route | Build classification | Why |
| --- | --- | --- |
| `/` | `ƒ Dynamic` | Document feed with lifecycle state and labelled dates |
| `/orders` | `ƒ Dynamic` | Category index and latest documents |
| `/search` | `ƒ Dynamic` | Live result set |
| `/category/[slug]` | `● SSG`, `revalidate = 3600` | Document log with per-row state |
| `/posts/[slug]` | `● SSG`, `revalidate = 3600` | The document itself: `CURRENT`/`SUPERSEDED`, GOIR verification, issue dates |

### SW-EXCLUDED entirely — stricter than `NETWORK_ONLY`

`/admin/*` and `/api/auth/[...nextauth]`. These are authenticated; authenticated HTML must
never reach a device-side cache at all. This is a scope exclusion, not a caching strategy.

## Hidden-dependency audit of the calculators

The gate's instruction was not to assume that a UI which looks client-side is genuinely
offline-safe. Verified:

- **Zero** `fetch` / XHR / `axios` / SWR / server actions anywhere under `app/(public)`.
- **Zero** database access in the calculator tree. Critically,
  `app/(public)/layout.tsx` is a **synchronous, non-`async`** component with no Prisma import,
  so the shared app shell (header, nav, drawer, bottom nav, theme toggle, footer) needs no
  database. This is what makes offline calculators possible at all; had the shell queried the
  DB, no calculator route could render from a cold offline start.
- **Zero** images in the entire public app — no `next/image`, no `<img>`. The UI is CSS, text
  and inline SVG.
- **No remotely fetched rates.** Tax slabs, DA presets, HRA presets, GPF interest and the PRC
  master scale are all hardcoded literals compiled into the bundle.
- `DaArrearsUI` calls `new Date()` only inside a `useEffect` (client-only, device clock), with
  a source comment explaining that evaluating it during render would bake a build-time date
  into prerendered HTML. Correct as written, and not a network dependency.
- **The only API route in the codebase is NextAuth.** There are no public JSON endpoints.

## Findings that change the plan

### 1. The Telugu font is a hard offline dependency

`next/font/google` self-hosts at build time, so there is no runtime request to
`fonts.gstatic.com` — good. The cost is that **21 `woff2` files totalling 364 KB** under
`/_next/static/media/` are the font supply. Calculator UIs carry Telugu labels throughout, so
without these cached, Telugu degrades to a fallback face or tofu boxes on some devices. They
are part of the offline asset requirement, not an optimisation.

### 2. `/tools/cfms-checker` is not a calculator

It performs no computation. It is a links directory to `cfms.ap.gov.in`, `ehs.ap.gov.in` and
`agaeap.cag.gov.in`. It renders offline and every link is dead. It is `STATIC_SAFE` and **must
not be labelled "Available offline."**

### 3. Hardcoded slabs make the update gate a correctness requirement

Tax rates live in the JS bundle. A device running a stale service worker would present
outdated tax mathematics with full confidence and no visible signal. `PWA-UPDATE-1` is
therefore load-bearing, not polish.

### 4. A service worker would defeat the app's existing correction mechanism

`lib/posts/revalidate.ts` clears `/`, `/orders`, `/search`, `/posts/[slug]` and
`/category/[slug]` whenever an admin creates or edits a post — its own comment says *"or an
hour-long ISR window will serve stale content."* `revalidatePath()` reaches the server cache
only. **It cannot reach a service-worker cache on a reader's device.** Caching document pages
client-side would mean an admin correction — marking a GO superseded, for example — is applied
everywhere except on the devices of the readers who already viewed it.

This is not hypothetical. During this session
`/posts/appsc-departmental-tests-notification-material` was observed serving a stale cached
render (`x-nextjs-cache: HIT`) whose markup disagreed with current source. That is the exact
failure mode, already demonstrated in this project, one caching layer further up.

### 5. Correction to the program's stated assumptions

`PWA-FRESHNESS-1` anticipated protecting "verification endpoints, lifecycle/status APIs,
search endpoints returning live content." **None of these exist.** GOIR verification is a
render-time boolean prop (`GoirBadge`), not an endpoint; lifecycle state is derived
server-side by `resolveLifecycle()`; search is a server-rendered page.

The freshness surface is therefore HTML navigations **plus Next.js RSC payload requests**
(`?_rsc=`) used for client-side navigation. A service-worker rule that excludes only
navigation requests would miss RSC fetches entirely and still serve stale documents.

## Architectural constraints carried forward

These are binding on every later PWA gate.

1. Government orders, posts/documents, search and category results, lifecycle and
   verification-related rendered state, and equivalent freshness-sensitive content **must never
   be served from a stale service-worker cache.**
2. Protect **both** normal HTML navigations **and** Next.js RSC payload requests (`?_rsc=` /
   RSC fetches). A strategy that only excludes page navigations is insufficient.
3. Preserve the app's existing revalidation behaviour. A device-side service-worker cache must
   not override or bypass `revalidatePath()` corrections.
4. The 21 self-hosted Telugu font files under `/_next/static/media/` are part of the offline
   asset requirement for calculator routes.
5. `/tools/cfms-checker` may be `STATIC_SAFE`, but it must not be labelled "Available offline,"
   because its actual value is external government links that require connectivity.
6. PWA update behaviour is a correctness requirement, because tax slabs and rates are compiled
   into JS. A deployed calculation update must be verified to replace stale cached bundles
   reliably.

## Carried forward to `PWA-FOUNDATION-1`

- `public/` is empty except `.gitkeep`. The only icon source is `app/icon.svg` — 32×32, a
  `#1B2A4A` navy rounded square with `#E8A33D` turmeric "AP" text.
- It is SVG and scales, but **the maskable icon cannot be a naive upscale**: Android's circular
  safe zone would clip the "AP" at the current proportions. Maskable needs its own safe-area
  padding.
- `app/(public)/layout.tsx` already exports a theme-aware `viewport.themeColor` — light
  `rgb(27, 42, 74)`, dark `rgb(19, 26, 40)`. The manifest should align to these, which makes
  `background_color` a real decision: a light splash would flash white for dark-mode users.
- Note that `themeColor` lives in the `(public)` layout, not the root layout, so `/admin` has
  none. A manifest is origin-wide regardless.

## Offline budget

87.3 kB shared First Load JS + roughly 50 kB of route chunks across the seven calculators +
364 KB of fonts ≈ comfortably under 1 MB for full offline calculator coverage.

## Deliberately not done in this gate

No manifest, no icons, no service worker, no Serwist or `next-pwa` evaluation, no
`next.config.js` change, no dependency added, and no route behaviour altered. Push
notifications, background sync and periodic sync are out of scope for PWA v1 by explicit
decision and are not assessed here.
