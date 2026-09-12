# Service-worker request & caching design — `PWA-SW-DESIGN-1`

**Status: design only. No service worker exists.**

Baseline:

- `PWA-AUDIT-0` — `9fa05007a99707564b341f465b8db0e62975f443`
- `PWA-FOUNDATION-1` — `5b6c6164cd39c1cbd074979d7a965cd2f11e9391`
- Branch `main`, Next.js `14.2.35`.

This gate installs nothing. It exists so the request/caching policy is decided and evidenced
*before* a service worker is given control of the application. `docs/context/PWA_AUDIT.md` is
unchanged and remains the classification of record.

## Governing principle

> Offline convenience must never weaken freshness or correctness.

The service worker uses an **allowlist model**: nothing is cached unless it appears on an
explicit list below. It is not a blanket strategy with exclusions bolted on afterwards.
Being static in the Next.js build is **not** sufficient grounds to serve something stale.

## Method

Every claim below was observed against the real production build (`npx next build` →
`next start`), driven by a headless Chromium harness recording each request's URL, resource
type, navigation flag and headers. 191 requests were captured across cold navigation, reload,
client-side `<Link>` navigation, all seven calculators, `/orders`, `/search`, a category page, a
document page, `/service-desk` and `/tools`, plus two targeted runs (fresh-context cold loads,
and prefetch-suppressed navigation). Nothing here is inferred from documentation alone.

---

## 1. Observed request taxonomy

Four request classes exist. Only these were observed.

| # | Class | Resource type | `isNavigation` | Distinguishing signal | URL form |
| --- | --- | --- | --- | --- | --- |
| 1 | Document navigation | `document` | **true** | no `RSC` header | `/orders` |
| 2 | RSC **prefetch** | `fetch` | false | `RSC: 1` **and** `Next-Router-Prefetch: 1` | `/orders?_rsc=dwbh8` |
| 3 | RSC **navigation** | `fetch` | false | `RSC: 1`, **no** prefetch header | `/orders?_rsc=yq4gz` |
| 4 | Static build asset | `script` / `stylesheet` / `font` | false | `/_next/static/…` path | hashed filename |

Request headers observed on this app, and no others of interest: `rsc`,
`next-router-prefetch`, `next-router-state-tree`, `next-url`.

**Zero external-origin subresource requests** were recorded across the entire run. The
application is fully self-hosted: no CDN, no `fonts.gstatic.com`, no analytics, no third-party
script.

### Request examples (literal, as captured)

```
document   nav=true   rsc=-  prefetch=-   /orders
fetch      nav=false  rsc=1  prefetch=1   /orders?_rsc=dwbh8          <- prefetch
fetch      nav=false  rsc=1  prefetch=-   /orders?_rsc=yq4gz          <- real navigation
fetch      nav=false  rsc=1  prefetch=1   /admin?_rsc=dwbh8           <- see §10
script     nav=false               /_next/static/chunks/117-c591d9e307a199d6.js
stylesheet nav=false               /_next/static/css/2458d418ae2cd7d8.css
font       nav=false               /_next/static/media/8f65a5fbebf0692a-s.p.woff2
other      nav=false               /icon.svg?eb93faa2ff4d80d3
```

### Findings that drive every rule below

- **F1 — Freshness-sensitive routes are fetched without user intent.** Loading the homepage
  alone issued RSC prefetches for `/orders`, `/search`, all five `/category/*` routes, five
  `/posts/*` documents, `/service-desk`, `/tools`, `/pensioners` **and `/admin`**. A
  cache-on-success strategy would therefore populate a cache with authoritative government
  content the reader never asked for.
- **F2 — `request.mode === "navigate"` is provably insufficient.** Both RSC classes report
  `isNavigation: false` and resource type `fetch`. A navigation-only rule would leave every
  RSC payload unprotected. This is measured, not assumed.
- **F3 — The `_rsc` token is not stable.** The same route produced `_rsc=3on76`, `99ayw`,
  `dwbh8` and `yq4gz` across different navigations. The token reflects **router state**, not
  the route. This is the direct reason RSC is not cached at all (§5): a URL-keyed cache would
  almost never hit, and normalising the token away would treat payloads built for different
  router contexts as interchangeable.
- **F4 — Blocking an RSC request degrades safely.** With prefetch suppressed, clicking a link
  produced a **full document navigation** (`document nav=true /orders`) rather than an error.
  So refusing to serve RSC from cache falls back to an ordinary network document request,
  which is precisely the desired failure path.
- **F5 — Both RSC classes carry the `RSC: 1` header**, so a single header check covers
  prefetch and navigation together, independently of pathname.

---

## 2. Strategy matrix

`✔ = cached`, `✘ = never cached`.

| Request class / route | Strategy | Cached | Rationale |
| --- | --- | --- | --- |
| `/_next/static/chunks/*.js` | PRECACHE / CACHE_FIRST | ✔ | Content-hashed, immutable per build |
| `/_next/static/css/*.css` | PRECACHE / CACHE_FIRST | ✔ | Content-hashed; one file for the whole app |
| `/_next/static/media/*.woff2` (allowlisted 9) | PRECACHE / CACHE_FIRST | ✔ | Content-hashed; see §4 |
| `/icons/*.png`, `/apple-icon.png`, `/icon.svg`, `/manifest.webmanifest` | PRECACHE / CACHE_FIRST | ✔ | Install identity; changes only with a build |
| 7 calculator routes — **canonical HTML document only** | OFFLINE_ROUTE | ✔ | Proven `OFFLINE_SAFE` in `PWA_AUDIT.md`; their RSC is *not* cached — see §5 |
| `/` | NETWORK_ONLY | ✘ | Document feed, lifecycle state, labelled dates |
| `/orders` | NETWORK_ONLY | ✘ | Category index + latest documents |
| `/search`, `/search?*` | NETWORK_ONLY | ✘ | Live result set |
| `/category/*` | NETWORK_ONLY | ✘ | Document log with per-row state |
| `/posts/*` | NETWORK_ONLY | ✘ | `CURRENT`/`SUPERSEDED`, GOIR verification, dates |
| **Any request carrying `RSC: 1`** — prefetch or navigation, *any* route, calculators included | NETWORK_ONLY | ✘ | Never cached in PWA v1 (§5) |
| `/tools`, `/pensioners`, `/service-desk`, `/topics`, `/pensioners/office-pipeline` | STATIC_SAFE — shell only | ✔ (shell) | Navigational shells; see §3 |
| `/tools/cfms-checker` | STATIC_SAFE — **not** offline-marketed | ✔ (shell) | Renders offline, but its value is external links |
| `/admin/*`, `/api/auth/*` | NEVER — outside scope | ✘ | Authenticated; see §10 |
| Any external origin | NETWORK_ONLY / passthrough | ✘ | See §9 |
| **Any other GET not listed above** | NETWORK_ONLY / passthrough | ✘ | No generic fallback strategy — see below |
| **NETWORK_FIRST** | — | — | **Zero routes. Not introduced.** |

`NETWORK_FIRST` remains empty. This gate found no route where serving a stale fallback is
acceptable, so the category is not created merely because it is a conventional PWA strategy.

### Default for unrecognised requests

There is **no catch-all strategy**. Any GET that does not match an explicit allowlist entry
above is passed through as an ordinary network request — no `CacheFirst`, no `NetworkFirst`,
no `StaleWhileRevalidate` fallback. An unrecognised request must never be cached by default;
if something new needs offline support, it is added to the allowlist deliberately.

---

## 3. OFFLINE_SAFE allowlist — exactly seven routes

```
/tools/tax-calculator
/tools/prc-calculator
/tools/da-arrears
/tools/gpf-apgli
/tools/leave-encashment
/pensioners/pension-calculator
/pensioners/commutation-tracker
```

Nothing else is offline-capable. In particular `/tools` and `/pensioners` are cached as
**navigational shells only** — they may be shown offline so a reader can reach a calculator,
but they must not imply that the documents or external portals they also link to are
available.

`/tools/cfms-checker` is `STATIC_SAFE` and **must never be labelled "Available offline."** It
performs no computation; its entire purpose is links to `cfms.ap.gov.in`, `ehs.ap.gov.in` and
`agaeap.cag.gov.in`, which require connectivity.

---

## 4. Calculator offline model

### Measured cold-launch dependency set

Each route was loaded in a **fresh browser context** so nothing was warm.

| Route | Requests | Decoded bytes |
| --- | --- | --- |
| `/tools/tax-calculator` | 23 | 791 KB |
| `/tools/prc-calculator` | 25 | 710 KB |
| `/tools/da-arrears` | 21 | 671 KB |
| `/tools/gpf-apgli` | 23 | 688 KB |
| `/tools/leave-encashment` | 23 | 676 KB |
| `/pensioners/pension-calculator` | 26 | 713 KB |
| `/pensioners/commutation-tracker` | 23 | 539 KB |

### The offline model: document fallback, never RSC

A calculator is made available offline through its **canonical HTML document only**:

1. its **canonical HTML document** — precached;
2. the **shared app shell**: 16 assets, **446 KB** (11 JS chunks, 1 CSS file, 3 fonts, `icon.svg`) — precached;
3. its **route-specific hashed JS/CSS** — precached;
4. the **font subset files** its glyphs require — precached (§4 font table);
5. its **RSC payload — network only, never cached.**

No database, network call, server action or external asset is involved — confirmed in
`PWA_AUDIT.md` and unchanged here.

**How client-side arrival works without a cached RSC payload.** When a reader taps through to
a calculator from another page, the router attempts an RSC fetch. Offline that fetch has no
cached entry and no network, so it fails — and per **F4** Next.js falls back to a full document
navigation, which the service worker serves from the precached HTML.

**The limit of the present evidence.** F4 was measured with prefetch suppressed while the
network was *available*: a blocked prefetch produced `document nav=true /orders`. The offline
variant — an RSC fetch failing because the device has no connectivity, behind a real installed
service worker — has **not** been observed. It is a reasoned extrapolation from F4, not a
measurement.

> `PWA-SW-1` must verify document fallback with a real installed service worker in offline mode
> before this is relied on as production behaviour. If it does not hold, the offline entry path
> for calculators must be reconsidered — but **not** by caching RSC.

### Font policy — the required nine of twenty-one

21 `woff2` files exist; the seven calculators need **9 files, 239 KB**. Mapped by
`unicode-range` from the built stylesheet:

| File | Family / subset | Size |
| --- | --- | --- |
| `8f65a5fbebf0692a-s.p.woff2` | **Noto Sans Telugu — Telugu block `u+0c00-0c7f`** | **120.9 KB** |
| `bd22cb49c66b861c-s.woff2` | Noto Sans Telugu — latin | 31.1 KB |
| `36966cca54120369-s.p.woff2` | Space Grotesk — latin | 21.8 KB |
| `b7387a63dd068245-s.woff2` | Space Grotesk — latin-ext | 18.5 KB |
| `db96af6b531dc71f-s.p.woff2` | IBM Plex Mono — latin | 9.9 KB |
| `98e207f02528a563-s.p.woff2` | IBM Plex Mono — latin | 9.8 KB |
| `d3ebbfd689654d3a-s.p.woff2` | IBM Plex Mono — latin | 9.8 KB |
| `5356a6a4f2c8c8d8-s.woff2` | IBM Plex Mono — latin-ext | 8.8 KB |
| `92eeb95d069020cc-s.woff2` | IBM Plex Mono — latin-ext | 8.7 KB |

The audit's constraint that Telugu is a hard offline dependency resolves to **one specific
file**, `8f65a5fbebf0692a-s.p.woff2` — the single largest font asset. Without it, Telugu
labels on every calculator fall back or render as tofu.

**These hashes change on any build that alters the fonts.** The precache list must be generated
from the build manifest, never hand-copied.

### Budget, and a correction to `PWA_AUDIT.md`

| Scope | Measured |
| --- | --- |
| Shared shell (needed by all 7) | 446 KB |
| Route-specific assets (6 additional calculators) | 395 KB |
| Union of all assets for 7 calculators | 841 KB |
| 7 HTML documents | 354 KB |
| **Proactive package (assets + HTML)** | **≈ 1.17 MB** |
| 7 RSC payloads (~19 KB each) | **excluded — not precached** (§5) |

Because RSC is never cached, the ~133 KB of RSC payloads is **not** part of the package. The
final figure is **≈ 1.17 MB**.

> **Correction.** `PWA_AUDIT.md` estimated "well under 1 MB." Measured, the package is
> **≈ 1.17 MB** — the estimate omitted the HTML documents and counted a narrower font set.
> These are decoded sizes; wire transfer is smaller under compression. The conclusion is
> unchanged (this is a modest budget), but the figure is corrected here rather than in the
> audit, which stays immutable.

### Recommendation: **proactive package for all seven**

The shared shell is 446 KB and is paid on the **first** calculator visit regardless. The
marginal cost of the remaining six is only **395 KB**. So visit-once caching saves at most
~0.4 MB while producing an experience a teacher cannot predict — the tool you happened to open
last month works on the bus, the one you need today does not.

Given the product's users (AP teachers, phone-first, frequently poor corridor/rural
connectivity) a predictable "all calculators work offline" guarantee is worth 395 KB. Proactive
precaching is also **simpler to reason about for update correctness** (§5): one versioned
precache manifest replaced atomically, rather than a partially-populated runtime cache whose
contents differ per device.

Recommended, not implemented. `PWA-SW-1` decides.

---

## 5. RSC and prefetch handling (mandatory)

Rules must be expressed on **pathname**, and must be evaluated for all four request classes.

```
isFreshnessSensitive(pathname):
    pathname === "/"
 || pathname === "/orders"
 || pathname === "/search"
 || pathname.startsWith("/category/")
 || pathname.startsWith("/posts/")
```

### Rule 1 — RSC is never cached, on any route

**Every request carrying `RSC: 1` is network-only in PWA v1.** This covers both RSC
navigation and `Next-Router-Prefetch: 1` prefetch, and it applies to *all* routes — the seven
`OFFLINE_SAFE` calculators included. No RSC response is read from or written to a cache.

**No pathname-only RSC cache key will be constructed.** The earlier draft proposed normalising
the unstable `?_rsc=` value away and keying RSC entries by pathname. That is rejected: the
token's instability (F3) reflects **router state**, so two RSC requests for the same pathname
are not necessarily interchangeable payloads. Treating them as equivalent purely by pathname
would risk serving a payload assembled for a different router context. Since RSC is not cached
at all, the question of normalising its cache key does not arise.

### Rule 2 — freshness-sensitive routes are network-only in every transport

- If `isFreshnessSensitive(url.pathname)` → **network only** for the document request as well,
  not just RSC. Never read from or write to a cache.
- Prefetch requests for these routes (F1) pass through untouched and must never seed a cache.

### Detection signals

Available and confirmed present in this build: the `RSC` request header, the
`Next-Router-Prefetch` request header, the `?_rsc=` query parameter, `Next-Router-State-Tree`
and `Next-URL`.

**Do not rely on `request.mode`, `request.destination`, or `isNavigationRequest()`** — F2 shows
RSC requests fail all three. A rule of the shape `if (request.mode === "navigate")` is
explicitly rejected by this design.

The primary discriminator is the **`RSC` request header**; pathname decides freshness
sensitivity for document requests.

---

## 6. Static asset policy

Cache-first is permitted **only** for content-addressed build output, whose filename changes
whenever its bytes change:

- `/_next/static/chunks/*.js`
- `/_next/static/css/*.css`
- `/_next/static/media/*.woff2` — restricted to the nine files in §4
- `/icons/*.png`, `/apple-icon.png`, `/icon.svg`, `/manifest.webmanifest`

Not cached: anything under `/_next/` that is not content-hashed, and any HTML or RSC response
not explicitly allowlisted in §3.

`/icon.svg` and `/apple-icon.png` are served with a `?<hash>` query by Next's file convention;
they are versioned by that query and must be matched accordingly.

---

## 7. Update lifecycle requirements

Tax slabs and DA/PRC rates are compiled into JavaScript (`TaxCalculatorUI.tsx:310–331` and
`lib/`), so a stale bundle is a **correctness** defect, not a staleness annoyance.

**Invariant.**

> After a deployment containing updated calculator logic, an installed PWA must not continue
> indefinitely using old calculator bundles.

Conceptual design:

1. The precache manifest is generated at build time and keyed by build ID, so any changed
   chunk produces a different precache entry.
2. A new service worker installs alongside the old one and precaches the new revision.
3. Activation replaces the previous precache and **deletes obsolete cache entries and old
   cache buckets**, so superseded calculator bundles cannot be served again.
4. The takeover must be bounded — a reader must not be able to keep an old calculator alive
   indefinitely by never fully closing the app. Whether that is `skipWaiting`, an
   update-on-next-launch model, or a visible "update available" affordance is a `PWA-SW-1`
   decision; this gate requires only that it be **bounded and deliberate**, not left to
   default behaviour.

**Test required later (`PWA-UPDATE-1`), with a deliberately changed calculation fixture:**

```
install/use version A
  → deploy version B whose calculator output differs for a known input
  → reopen the installed PWA
  → assert version B's result is produced for that input
  → assert version A's chunks are gone from Cache Storage
```

The fixture must assert a **calculated value**, not merely that an asset hash changed.

---

## 8. Failure behaviour (design only — no UI built in this gate)

| Situation | Required behaviour |
| --- | --- |
| Offline, offline-safe calculator | Works normally, indistinguishable from online |
| Offline, freshness-sensitive route | **Never** show stale authoritative content. Show an intentional offline state, e.g. "Internet connection required to view current government orders." |
| Offline, external government link | Ordinary network failure. Do not intercept, fake, or explain away availability |
| Offline, `STATIC_SAFE` shell | May render, but must not imply that the documents or external portals it links to are reachable |

The offline UI itself belongs to `PWA-OFFLINE-UX-1` and is not designed here.

---

## 9. External-origin policy

Inventory: **zero external origins are requested as subresources.** The only external origins
in the product are destinations a user clicks — `cfms.ap.gov.in`, `ehs.ap.gov.in`,
`agaeap.cag.gov.in`, and the government portals linked from `/pensioners` and document pages.

Policy: **do not service-worker-cache any third-party or government-origin resource.** These
remain ordinary network destinations, opened in the normal way. No exceptions are defined,
and none should be invented without a specific recorded reason.

Rationale beyond caching hygiene: these are the authoritative systems the product deliberately
defers to. Interposing a cache between a teacher and a government portal would misrepresent
the product's own trust boundary.

---

## 10. Authentication and admin policy

**Finding F6 — `/admin` is prefetched from public pages.** The "CMS →" link in the public
header causes every public page load to issue `GET /admin?_rsc=…`, which returns **HTTP 307
with `content-type: text/x-component` and a 6518-byte body**. `/admin/posts` returns 307 to
`/admin/login?callbackUrl=…`.

Consequences for the design:

- A rule that caches responses by success/content-type would store an **authentication redirect
  payload**. It must not.
- Admin and auth surfaces are **outside runtime caching entirely** — a scope exclusion, not a
  strategy choice.

```
isExcludedFromServiceWorker(pathname):
    pathname === "/admin"
 || pathname.startsWith("/admin/")
 || pathname.startsWith("/api/auth/")
```

For these paths the service worker must not read cache, must not write cache, and must not
transform the response — including their RSC prefetch and navigation variants, and including
redirect (3xx) responses. No session, credential or authenticated response may ever reach
Cache Storage.

---

## 11. Library configuration constraints

These are binding on whatever library `PWA-SW-1` adopts.

### Do not use Serwist's `defaultCache`

Serwist was suggested as the likely tool. If adopted, its `defaultCache` preset **must not be
imported or spread into the runtime caching configuration.** Its normal Next.js page handling
includes page and RSC runtime caching, which directly conflicts with the freshness boundary
this document exists to defend — it would reintroduce exactly the stale-authoritative-content
risk that `PWA_AUDIT.md` §4 records.

The configuration must be constructed deliberately, rule by rule, from the allowlist in §2.
**Five explicit rules beat one `defaultCache`.**

### Keep `cacheOnNavigation: false`

Proactive caching of Next `<Link>` navigations must stay disabled. Enabling it would cache
navigation results for routes the reader merely passed through — including, per **F1**, routes
whose payloads were prefetched without any user intent.

### No generic fallback strategy

No `CacheFirst`, `NetworkFirst` or `StaleWhileRevalidate` may be registered as a catch-all for
arbitrary GET requests (§2, "Default for unrecognised requests"). Any request not explicitly
approved for caching stays an ordinary network request.

### Verify the tool against this build

Confirm the chosen library supports this project's **webpack** production build on Next
`14.2.35` before adoption, rather than following examples written for a different bundler or
major version.

---

## 12. Explicit non-goals

Not designed, not decided, and out of scope for `PWA-SW-1`:

- **Caching RSC payloads of any kind, on any route** — prefetch or navigation (§5).
- **Serwist's `defaultCache`**, or any preset that runtime-caches pages/RSC (§11).
- **`cacheOnNavigation`** — stays `false` (§11).
- **Any catch-all caching strategy** for unrecognised GET requests (§2, §11).
- Push notifications, background sync, periodic sync.
- Offline access to any government order, document, category or search result.
- A `NETWORK_FIRST` tier.
- Caching of any external/government origin.
- Any install-prompt UI or install-nagging behaviour.
- Offline write/queueing of any kind — the public app has no writes.
- `viewport-fit=cover` (carried from `PWA-FOUNDATION-1` to `PWA-QA-1`).

---

## 13. Carry-forward requirements for `PWA-SW-1`

1. Allowlist model only. Nothing cached that is not named in §2/§3.
2. Never key rules on `request.mode`, `destination`, or `isNavigationRequest()` (F2). Use the
   `RSC` header for transport, pathname for freshness sensitivity.
3. **No RSC response is cached, on any route, in either variant** (§5). Do not build a
   pathname-normalised RSC cache key.
4. Prefetches must pass through and must never seed a cache (F1).
5. Calculator offline support is **document fallback only** — precached HTML plus hashed
   assets; RSC stays network-only. **Verify document fallback with a real installed service
   worker in offline mode before relying on it** (§4).
6. No Serwist `defaultCache`; `cacheOnNavigation: false`; no catch-all strategy (§11).
7. Precache list generated from the build manifest — never hand-maintained hashes (§4).
8. The nine font files in §4, including the 120.9 KB Telugu-block file, are required for
   calculator offline support.
9. Admin/auth paths excluded from the service worker entirely, including 3xx responses (§10).
10. Activation must delete superseded precache entries, with a bounded takeover (§7).
11. No external origin cached (§9).
12. Confirm the chosen library fits this project's **webpack** production build on Next
    `14.2.35` before adopting it (§11).
13. `/tools/cfms-checker` must not be presented as offline-capable anywhere in UI or copy.
14. The measured proactive package is **≈1.17 MB** (§4) — RSC excluded — not the audit's
    <1 MB estimate.
