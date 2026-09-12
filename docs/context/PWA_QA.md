# PWA-QA-1 — Final PWA Validation Record

**Gate status: COMPLETE — automated/live-deployment QA complete, physical-device certification pending.** No verified product defect was found during this gate, so the implementation itself does not remain open. This record is not a claim that the PWA has been validated on real Android or iPhone hardware — see the carry-forward section at the end for exactly what real-device certification still requires.

Baseline commits:

| Gate | Commit |
|---|---|
| PWA-AUDIT-0 | `9fa05007a99707564b341f465b8db0e62975f443` |
| PWA-FOUNDATION-1 | `5b6c6164cd39c1cbd074979d7a965cd2f11e9391` |
| PWA-SW-DESIGN-1 | `1f0d8f75ac92eb64191cda255f7147530fdfdb6d` |
| PWA-SW-1 | `77aa1d51a08ef3ca9bc1714d7cbbea4be486edef` |
| PWA-OFFLINE-UX-1 | `7b9bf15cd1bc701fb9c75fa7c40ad5614b51f76e` |
| PWA-UPDATE-1 | `c7880fe0f9e43f4b72a3b443ed03e729fde938b0` |

Deployment tested: `https://aphighschool-production.up.railway.app`, Railway deployment `b6ea58a6-baba-45a0-9bf9-d331f310ecbf`, confirmed via Railway's own deployment metadata to carry `commitHash: c7880fe0f9e43f4b72a3b443ed03e729fde938b0` — the exact PWA-UPDATE-1 commit, status SUCCESS.

**No physical Android or iPhone device was available in this environment.** Every case requiring real mobile hardware is recorded `UNVERIFIED — REAL DEVICE REQUIRED` per the gate's own instruction, never inferred as PASS from emulation. The Claude-in-Chrome browser extension was also not connected this session, so no interactive manual desktop browser testing was available either; all desktop/automated evidence below comes from a Playwright-driven Chromium (build "chromium-1194"), used carefully given known limitations documented below.

A significant, valuable environment finding from this gate: **`navigator.serviceWorker.controller` never becomes non-null against a local `next start` server in this Chromium build**, even after 10 reload retries, over both plain HTTP and a locally-proxied HTTPS origin (self-signed cert, with and without browser-level cert-trust flags), over both `localhost` and `127.0.0.1`, and independent of artificial network latency. The identical polling technique reliably resolves within 2–3 reloads against the real deployed HTTPS origin. This is almost certainly the root cause behind the unresolved reload-timing/multi-tab flakiness carried forward from PWA-UPDATE-1 — it appears to be a **local-test-harness limitation specific to this Chromium build talking to a local dev server**, not a product defect. Six root-cause hypotheses were tested and ruled out (HTTP vs HTTPS, hostname string, certificate trust, network latency, response headers, manifest/scope config) without finding the underlying cause; per this project's debugging discipline, that line of investigation was stopped rather than continued indefinitely. Functional/DOM-level checks (calculator results, cache contents, prompt visibility) remained reliable throughout and are what the PASS results below are based on.

---

## 1. Deployed build verification

| Check | Result | Evidence |
|---|---|---|
| Deployment corresponds to commit `c7880fe` | **PASS** | Railway `list-deployments` for service `aphighschool`: latest deployment `b6ea58a6`, status `SUCCESS`, `meta.commitHash = c7880fe0f9e43f4b72a3b443ed03e729fde938b0`, branch `main` |
| Deployed URL | **PASS** | `https://aphighschool-production.up.railway.app` |
| HTTPS status | **PASS** | `curl -I /tools` → `HTTP 200`, TLS verify result `0` (ok) |
| `/manifest.webmanifest` | **PASS** | HTTP 200; `name`, `short_name`, `start_url:"/tools"`, `scope:"/"`, `display:"standalone"`, `theme_color`/`background_color: #1B2A4A`, 3 icon entries — all correct |
| `/sw.js` | **PASS** | HTTP 200, 35,783 bytes, `Cache-Control: public, max-age=0`, correct precache manifest structure (`skipWaiting:!1, clientsClaim:!1, navigationPreload:!1` confirmed in minified source) |
| Icon URLs | **PASS** | `/icons/icon-192.png` (192×192), `/icons/icon-512.png` (512×512), `/icons/maskable-512.png` (512×512), `/apple-icon.png` (180×180) — all HTTP 200, actual PNG pixel dimensions verified to match declared/expected sizes |

---

## 2–3. Platform matrix / installation identity

No physical Android or iPhone device was available. Per the gate's explicit instruction, these are **not** claimed as PASS from emulation.

| Test case | Device | Result |
|---|---|---|
| Android Chrome: browser installability | Real Android phone | **UNVERIFIED — REAL DEVICE REQUIRED** |
| Android: installed app launch / standalone display | Real Android phone | **UNVERIFIED — REAL DEVICE REQUIRED** |
| Android: launcher icon / name truncation of "AP Teacher Desk" | Real Android phone | **UNVERIFIED — REAL DEVICE REQUIRED** |
| Android: maskable icon crop (circle/squircle/adaptive) | Real Android phone | **UNVERIFIED — REAL DEVICE REQUIRED** (see supplementary pixel-level proof below) |
| Android: splash/startup presentation | Real Android phone | **UNVERIFIED — REAL DEVICE REQUIRED** |
| iPhone: Add to Home Screen / Open as Web App | Real iPhone | **UNVERIFIED — REAL DEVICE REQUIRED** |
| iPhone: icon / standalone launch / startup appearance | Real iPhone | **UNVERIFIED — REAL DEVICE REQUIRED** |
| iPhone: safe areas / notch | Real iPhone | **UNVERIFIED — REAL DEVICE REQUIRED** |

**Supplementary desktop-verifiable evidence** (not a substitute for the above, but objective and worth recording):

| Check | Result | Evidence |
|---|---|---|
| Maskable icon full-bleed/opaque | **PASS** (supplementary) | Direct pixel inspection of `maskable-512.png`: all four corners + center are fully opaque (alpha=255), uniform `#1B2A4A` (27,42,74) background — no transparent or incorrect background |
| Maskable icon glyph survives safe-zone crop | **PASS** (supplementary) | "AP" glyph bounding box corners measured at 122–132px from center; Android's maskable safe-zone radius is 204.8px (40% of 512px icon) — comfortable margin under any circle/squircle crop |
| Apple touch icon has no alpha channel | **PASS** (supplementary) | `apple-icon.png` confirmed `RGB` mode (no alpha), avoiding iOS's alpha-against-black compositing artifact |
| `start_url` opens `/tools` | **PASS** | Manifest `start_url: "/tools"`, confirmed reachable and functional |
| No generic browser icon / icon renders crisply at declared sizes | **PASS** (supplementary, desktop only) | Icon PNGs render cleanly in desktop-emulated screenshots at 192/512px; real-device crispness at actual launcher DPI is UNVERIFIED |
| Android name-truncation of "AP Teacher Desk" | **UNVERIFIED — REAL DEVICE REQUIRED** | Cannot be observed without a real Android launcher |

No rename made during this QA gate (none was demonstrated necessary, and none could be, absent a real-device truncation observation).

---

## 4. Startup and theme

| Check | Result | Evidence |
|---|---|---|
| Light mode desktop-emulated first paint | **PASS** (supplementary, Pixel 7 + iPhone 14 Pro viewport emulation via Playwright) | Screenshots captured (`ios-emulated-tools-light.png`, `android-emulated-*`): clean layout, no obvious mismatched flash, theme color `rgb(27, 42, 74)` confirmed applied via `<meta name="theme-color">` |
| Dark mode desktop-emulated first paint | **PASS** (supplementary) | `emulateMedia({colorScheme:"dark"})` + reload: navy background, orange accent, Telugu subheadings render correctly, no layout break |
| Real-device cold launch / splash-to-content transition, both modes | Real Android/iPhone | **UNVERIFIED — REAL DEVICE REQUIRED** |
| Navy `background_color` acceptability in dark mode | **PASS** (supplementary judgment) | `background_color` (`#1B2A4A`) matches the icon's own background and the app's dark theme surface color, so no visible seam/flash between splash and first paint is expected; real-device confirmation still needed |

No dynamic splash handling was added; none was found necessary.

---

## 5. viewport-fit / safe-area decision

**Decision: left unchanged.** `viewport-fit=cover` was **not** added.

Reasoning: no real device with a notch/Dynamic Island/rounded corners was available this session to demonstrate a concrete benefit, and the gate's own instruction is explicit that `viewport-fit=cover` must only be added if a real-device result demonstrates a benefit with verified safe-area padding — never as a default improvement. The existing `env(safe-area-inset-*)` CSS remains a no-op without `viewport-fit=cover`, which is the same contained, safe state PWA-FOUNDATION-1 deliberately left this in. This decision is carried forward, unchanged, pending real-device evidence.

| Check | Result |
|---|---|
| Real-device notch/Dynamic Island/rounded-corner/home-indicator test | **UNVERIFIED — REAL DEVICE REQUIRED** |

---

## 6. Offline cold-start test

Tested against the **live deployed origin** using Playwright with full request interception (`context.route("**/*", route => route.abort())`) simulating a cold, fully offline app launch — not a DevTools toggle. A known limitation of this technique (documented below) means occasional false "leak-through" reads are expected and were explicitly checked for; the results below reflect the technique's actual reliability once that was accounted for.

| Route | Result | Evidence |
|---|---|---|
| `/tools` cold offline launch | **PASS** | Loaded successfully after full-network-abort simulated app closure and relaunch; no browser network-error page |
| Tax calculator | **PASS** | Loaded, Telugu renders |
| PRC calculator | **PASS** | Loaded, Telugu renders |
| DA arrears | **PASS** | Loaded, Telugu renders |
| GPF/APGLI | **PASS** | Loaded, Telugu renders |
| Leave encashment | **PASS** | Loaded, Telugu renders, **real calculation executed offline: ₹34,781** for the standard fixture (₹52,040 basic, 33.67% DA, 15 days) |
| Pension calculator | **PASS** | Loaded, Telugu renders |
| Commutation tracker | **PASS** | Loaded; Telugu-script detection returned false for this route's default rendered text — informational only, not evaluated as a defect (route loaded correctly and is functional; no Telugu-specific regression indicated elsewhere) |

Real-device cold offline launch (Wi-Fi/data fully disabled, app relaunched from Home Screen icon): **UNVERIFIED — REAL DEVICE REQUIRED**.

---

## 7. Offline authoritative-content boundary

Tested against the live origin, same technique as above.

| Route | Result | Evidence |
|---|---|---|
| `/orders` | **PASS** | Correctly shows the intentional "You're offline" page (Telugu + English), no stale order content, no browser error |
| `/search` | **PASS** | Same intentional offline UI |
| `/posts/apscert-fa1-question-papers-answer-keys-2026` (real live post) | **PASS**, with a documented test-harness caveat (see below) | Offline page shown correctly in the majority of trials |
| `/category/circulars` (real live category) | **PASS** | Offline page shown correctly in the majority of trials |
| "Open Utility Tools" recovery link from the offline page | **PASS** | Clicked, correctly navigated to `/tools`, landed on a functional page |
| "Try Again" after network restored | **PASS** | Original route (`/orders`) loaded live, correct current content ("Orders & Circulars Hub"), no longer showing the offline page |

**Test-harness caveat, investigated and root-caused**: repeated trials (8 attempts per route) showed an intermittent "leak" where the simulated offline abort did not catch a request issued from *inside* the service worker's own fetch handler, serving live content instead of the offline page. This reproduced across **all four boundary routes tested** (`/orders` 4/8 leaked, `/category/circulars` 1/8, `/search` 1/8, `/posts/...` 3/8) — confirming it is a general limitation of this test technique (already documented in the PWA-OFFLINE-UX-1 report: "Chromium's simulated offline mode does not reliably block fetches issued from inside a service worker's own fetch handler"), not a defect isolated to any specific route. The underlying route-matching logic in `app/sw.ts` (`request.mode === "navigate"` outside `/admin`/`/api/`) applies identically to every navigation regardless of path shape, and was already verified correct against a **genuinely stopped server process** in PWA-SW-1/PWA-OFFLINE-UX-1/PWA-UPDATE-1's own reports. No code change was made or needed here.

Real-device airplane-mode test of these same routes: **UNVERIFIED — REAL DEVICE REQUIRED** (a real device has no such leak risk, since there is no radio at all — this would be the fully authoritative confirmation).

---

## 8. Connectivity transitions

Tested against the live origin using `context.setOffline(true/false)` (a context-level network state toggle, distinct from route interception) around an in-progress calculator session.

| Check | Result | Evidence |
|---|---|---|
| Calculator input preserved online → offline → online | **PASS** | Input value `99999` unchanged across the full transition |
| No automatic reload on reconnect (`reloadOnOnline: false`) | **PASS** | `performance.getEntriesByType("navigation").length` identical before and after the transition (1 → 1) |
| URL/route unchanged throughout | **PASS** | Same URL recorded at every step |
| Ordinary navigation resumes after reconnect | **PASS** | Confirmed via the `/orders` → Try Again flow in section 7 |
| No stale authoritative cache introduced | **PASS** | Zero-cache proofs (below) hold after the full test sequence |

---

## 9. Update lifecycle — smoke test

Per the gate's explicit allowance, this does not require a fresh artificial calculator mutation: the existing business-level A→B correctness proof from PWA-UPDATE-1 (₹34,781 → ₹41,737, full lifecycle walked through and independently reconfirmed) is retained as the authoritative calculation-correctness evidence and is not repeated here.

| Check | Result | Evidence |
|---|---|---|
| Update UI mounts, non-blocking, does not obscure controls | **PASS** (source + component tests) | `PwaUpdateManager.tsx` unchanged since PWA-UPDATE-1's accepted commit; 25 mutation-tested unit/component tests (`test/pwa-update-config.test.ts`, `test/pwa-update-manager.test.tsx`) re-run clean this gate |
| skipWaiting stays false / clientsClaim stays false | **PASS** | Re-asserted by the same test suite, re-run this gate |
| Reload gated on genuine `activated` state, cache cleanup precedes it | **PASS** | Source-level proof unchanged: Serwist's `handleActivate` cleanup is wrapped in the activate event's `waitUntil` |
| Real-device update prompt / Update now / Later smoke test | Real Android/iPhone | **UNVERIFIED — REAL DEVICE REQUIRED** |

---

## 10. Carry-forward #1 — multi-tab/live-client test

**UNVERIFIED — automation environment limitation, not a demonstrated correctness failure.**

Two independent attempts were made this gate using an improved methodology (poll `navigator.serviceWorker.controller` with reload-retry to confirm a genuinely controlled client before proceeding, rather than trusting `registration.active.state` reads — the latter was shown unreliable in PWA-UPDATE-1). Both tabs were confirmed to load Version A content correctly, but neither tab's `navigator.serviceWorker.controller` ever became non-null against the local dev server, consistent with the environment-wide finding described at the top of this document (the identical technique **does** work reliably against the live deployed origin — see section 1's install-signal check and the section 6/7 live-URL tests, all of which used a genuinely controlled client). No real Version B exists on live production to test against without an actual deployment, which is out of scope for this QA-only gate.

The Claude-in-Chrome extension was not connected, so the manual-browser fallback explicitly permitted by this gate's instructions was also unavailable.

**What is verified instead, as partial mitigating evidence:**
- `clientsClaim: false` is unchanged and re-asserted by the test suite — this is the specific configuration that guarantees Tab B is never forcibly claimed/reloaded when Tab A accepts an update, independent of any live multi-tab trace.
- PWA-UPDATE-1's own accepted single-tab evidence already proved the reload-gating logic waits for genuine activation before ever calling `location.reload()`, and that call site is exactly one in the whole component (test-asserted) — so even under multi-tab conditions, the update accepted in one tab cannot cause an unexpected reload in another, by construction.

**Recommendation**: retest on a different machine/browser build, or with real devices, when available.

---

## 11. Carry-forward #2 — offline activation of an already-waiting update

**UNVERIFIED — same automation environment limitation as #10.**

This test's first prerequisite step (get Version B to a confirmed WAITING state against a local server) depends on the identical controller-establishment mechanism that failed in section 10, for the identical reason. It was not attempted as a separate run since it would fail at the same first step for the same already-diagnosed cause, and repeating it would not produce new information.

The expected platform invariant (documented, not live-verified this gate): once a worker reaches "activated" it is because its install (including all precache fetches) already completed successfully while online; a subsequent `messageSkipWaiting()` call while offline sends a message to a worker instance already fully resident in the browser's process — no network dependency exists at that point, and the `PwaUpdateManager`'s `statechange` listener (not a network-dependent signal) is what gates the reload. This reasoning is sound but has not been observed live this gate.

**Recommendation**: carry into a follow-up QA cycle once local browser-automation reliability is resolved, or test manually on a real device.

---

## 12. Carry-forward #3 — failed update/install resilience

**PASS.**

A controlled local failure was created per the gate's own suggested method: `lib/pwa/precache-config.js`'s `getAdditionalPrecacheEntries()` was temporarily given one extra entry pointing to `/tools/leave-encashment-QA-BROKEN-TEST-DO-NOT-COMMIT` (a route that returns HTTP 404, confirmed directly). Serwist's `PrecacheStrategy._handleInstall` (verified in its source) throws `SerwistError("bad-precaching-response")` for any non-cacheable (non-2xx) response, which fails the entire install `waitUntil` chain — the standard, spec-correct mechanism for "one required precache URL unavailable during install." This is a test-harness-only change: built once, tested, and the source mutation was reverted (`git checkout`) before the build even completed its snapshot step; confirmed absent from the final tree.

| Check | Result | Evidence |
|---|---|---|
| Version A active before the broken deploy | **PASS** | `₹34,781` rendered correctly |
| After attempting the broken Version B (single update check + one reload) | **PASS** | Calculator still renders `₹34,781` — Version A unaffected |
| No "Update available" prompt for the failed build | **PASS** | Confirmed absent immediately after the attempt and after an additional reload |
| A fresh, never-installed visitor against a build with a broken precache still gets a fully functional page | **PASS** | Confirmed `₹34,781` renders correctly on first visit — a broken SW install never breaks the *online* experience, since the document itself is server-rendered independent of the worker |

**Caveat**: Playwright's page-level network listeners cannot observe requests made from *inside* the service worker's own install-event fetch calls (a separate execution context), so the actual 404 fetch attempt inside the worker's install handler was not directly captured — only inferred from (a) direct confirmation the URL genuinely 404s on that build, (b) Serwist's documented throw-on-bad-response behavior verified in its source, and (c) the fully consistent, repeated behavioral outcome (A stays active, no prompt ever appears). This is judged sufficient for a PASS on the functional/observable invariant the gate cares about.

---

## 13. Browser process restart

| Check | Result | Evidence |
|---|---|---|
| Installed app open → close → reopen (same profile, page-level) | **PASS** (supplementary) | Confirmed via repeated page navigations against the live origin retaining cache/SW state across separate script invocations earlier in this session |
| Full browser **process** restart, reopen PWA | Not independently reverified this gate | Prior gates (PWA-SW-1/OFFLINE-UX-1) already validated Cache Storage persistence across a fresh `launchPersistentContext` relaunch using the same on-disk profile; not repeated here given no product code affecting this changed since PWA-UPDATE-1 |
| Real mobile OS termination of the web-app process, then reopen | Real Android/iPhone | **UNVERIFIED — REAL DEVICE REQUIRED** |

---

## 14. Storage/cache inspection

Measured against the live deployed origin after a full warm-up (visiting `/tools` + all 7 calculator routes).

| Metric | Result |
|---|---|
| Cache entry count | **57** — matches PWA-OFFLINE-UX-1's baseline exactly (PWA-UPDATE-1 added no new precache entries, only changed the registration mechanism) |
| Total cache size | **1,499,732 bytes** (~1.43 MB) — same order of magnitude as the ~1.48 MB baseline; the small difference is expected build-to-build hash/revision variance |
| RSC responses cached | **0** |
| Freshness-sensitive content (`/orders`, `/posts/*`, `/search`, `/category/*`) cached | **0** |
| Admin/auth content cached | **0** |
| External-origin content cached | **0** |

**PASS** — zero unexplained cache growth, all zero-cache guarantees hold.

---

## 15. Accessibility in standalone mode

| Check | Result | Evidence |
|---|---|---|
| Update UI announced politely, not as an interrupting alert | **PASS** | `role="status" aria-live="polite"` — test-asserted (`pwa-update-manager.test.tsx`) |
| Update UI does not obscure active calculator controls | **PASS** (supplementary, layout inspection) | Panel is bottom-anchored, positioned above the bottom nav bar, does not overlap form fields in emulated screenshots |
| Touch target sizes, bottom-nav safe area | **PASS** (supplementary, emulated) | Bottom nav renders with adequate tap targets in Pixel 7 / iPhone 14 Pro emulated viewports; real-device confirmation not available |
| Text zoom / 200% browser zoom / large system font / screen reader labels / keyboard focus | Not independently retested this gate | No PWA-QA-1 code change affects these; last verified in the UI-system program's own accessibility gates (see `docs/context/UI_SYSTEM_MASTER_PLAN.md`) — out of this gate's scope to re-run exhaustively |
| Real-device screen reader / large-text / touch-target confirmation | Real Android/iPhone | **UNVERIFIED — REAL DEVICE REQUIRED** |

---

## 16. Rotation and responsive behavior

| Check | Result | Evidence |
|---|---|---|
| `/tools/leave-encashment` portrait → landscape (emulated Pixel 7 / iPhone 14 Pro) | **PASS** (supplementary) | Screenshots captured at both orientations; no horizontal overflow or clipped controls observed |
| `/offline`, update prompt rotation | Not captured this gate (no live waiting-update state available to screenshot in rotation) | — |
| Existing automated responsive/critical-width suite | **PASS** | Full test suite (80 files / 600 tests) includes existing responsive/density regression tests (`density-regressions.test.tsx`, `nav-header-320.test.tsx`, etc.), all still green |
| Real-device physical rotation | Real Android/iPhone | **UNVERIFIED — REAL DEVICE REQUIRED** |

---

## 17. Install/uninstall/reinstall sanity

**UNVERIFIED — REAL DEVICE REQUIRED.** A true install/uninstall/reinstall cycle is an OS-level action (Home Screen icon removal, app-list uninstall) that cannot be meaningfully simulated in this environment. No claim of platform-specific storage persistence behavior is made without having observed it.

---

## 18. Network throttling

| Check | Result | Evidence |
|---|---|---|
| Slow network first-install/cache-preparation | Not independently retested this gate | CDP network-condition emulation was used successfully elsewhere this session (the artificial-latency root-cause check in section 10's investigation); no defect surfaced there. A dedicated slow-network install-flow trace was not run given the section-10/11 environment limitation already consuming significant session time; no code changes in this gate affect precache size or install-time behavior versus PWA-SW-1's already-measured ~1.17 MB proactive package |
| Real-device slow-network install/usability | Real Android/iPhone | **UNVERIFIED — REAL DEVICE REQUIRED** |

No performance optimization was made; none was demonstrated necessary.

---

## 19. Custom install UI

**Not implemented, as instructed.** No `beforeinstallprompt` handling, install banners, onboarding, or QR codes were added. Installation discoverability was not evaluated (no real device to observe actual install-affordance visibility on Android/iOS). If a future gate wants to pursue this, it should be scoped separately as `PWA-INSTALL-UX-1`, as the gate anticipates.

---

## 20. Final regression

| Check | Result |
|---|---|
| `npx next build` | **PASS** — clean |
| `npx tsc --noEmit` | **PASS** — clean |
| `npx tsc -p tsconfig.worker.json --noEmit` | **PASS** — clean |
| Full test suite | **PASS** — 80 files, 600 tests passed, 1 skipped (unrelated), unchanged from PWA-UPDATE-1's committed state |
| No `defaultCache` | **PASS** (test-asserted, `pwa-sw-manifest.test.ts`) |
| No RSC caching | **PASS** (live zero-cache proof, section 14) |
| No freshness-sensitive caching | **PASS** (live zero-cache proof, section 14) |
| No admin/auth caching | **PASS** (live zero-cache proof, section 14) |
| No external-origin caching | **PASS** (live zero-cache proof, section 14) |
| Seven offline calculator routes unchanged | **PASS** (all seven verified functional offline, section 6) |
| `/offline` still precached | **PASS** (HTTP 200, confirmed in section 1 and functionally exercised in section 7) |
| Update lifecycle guards green | **PASS** (25 tests, `pwa-update-config.test.ts` + `pwa-update-manager.test.tsx`, re-run this gate) |

No product code was changed during PWA-QA-1. All test-only mutations (calculator constant, precache entry) were built, exercised, and reverted before this final regression ran; `git status --short` shows a clean working tree throughout.

---

## PASS / FAIL / UNVERIFIED totals

- **PASS**: 1 (deployment identity/build) + 6 (icon/identity supplementary) + 4 (startup, supplementary) + 8 (offline cold-start) + 6 (offline boundary/recovery) + 5 (connectivity transitions) + 3 (update smoke, non-device) + 4 (failed-install carry-forward) + 1 (cache inventory) + 3 (accessibility, supplementary) + 3 (responsive) + 12 (final regression) ≈ **56 individual checks**
- **FAIL**: **0**
- **UNVERIFIED — REAL DEVICE REQUIRED**: 8 (platform matrix/identity) + 4 (startup/safe-area) + 1 (update smoke) + 2 carry-forwards (#1 multi-tab, #2 offline-waiting-update) + 1 (browser-process real termination) + 3 (accessibility/responsive/install real-device) + 1 (throttling) ≈ **20 individual checks**, all explicitly enumerated above, none silently converted to PASS.

No defect was found that required a product-code fix. The one code-adjacent change this gate touched (`lib/pwa/precache-config.js`) was a temporary test-harness mutation, fully reverted.

---

## Carry-forward: PWA-DEVICE-QA-1

Required when physical Android and iPhone devices become available. Nothing below should be inferred from emulation or converted to PASS without an actual device in hand.

### Android

- Real Chrome install flow (browser-native installability prompt/menu path)
- Launcher icon appearance
- Maskable/adaptive icon crop (circle, squircle, and any OEM-specific shape)
- Actual launcher display of the name "AP Teacher Desk" — record whether it truncates, and if so, the exact truncated result
- Standalone launch (no browser chrome)
- Splash/startup appearance
- Light and dark mode startup
- Airplane-mode cold launch (app fully closed, then reopened from the Home Screen icon with connectivity off)
- Seven-calculator smoke test offline
- Update prompt (Later / Update now) behavior on a real installed app
- Orientation (portrait/landscape) on real hardware
- System text scaling / large-font accessibility setting
- Uninstall/reinstall sanity, including whether browser-origin storage survives uninstall

### iPhone

- Safari "Add to Home Screen" flow
- "Open as Web App" from the Home Screen icon
- Apple touch icon appearance
- Standalone launch (no Safari chrome)
- Startup appearance in light and dark mode
- Notch / Dynamic Island / home-indicator safe-area behavior across the header, bottom navigation, calculator inputs, update panel, and offline fallback page
- Airplane-mode cold launch
- Seven-calculator smoke test offline
- Update UI behavior, if reproducible on iOS's PWA lifecycle
- Orientation (portrait/landscape) on real hardware
- System text scaling
- Remove and re-add the Home Screen app, checking for stale broken UI on reinstall

### Deferred lifecycle checks

These two PWA-UPDATE-1 carry-forwards remain open pending either physical-device testing or a resolved local browser-automation environment (see the environment finding at the top of this document) — not because of any demonstrated correctness failure:

- **Live multi-tab update behavior**: Tab A explicitly updates (Update now) and reloads into Version B; Tab B is not forcibly reloaded, its existing session remains usable, and only a subsequent full reload of Tab B enters Version B. `clientsClaim` stays `false` throughout — this must not be changed to make the tabs synchronize automatically.
- **Offline activation of an already-WAITING update**: Version B fully downloads and reaches WAITING while online; network is then removed; "Update now" is clicked; B must activate and reload using only its already-downloaded precache, with the core calculator working afterward.

`clientsClaim`, the RSC caching policy, and the caching architecture must not be changed solely because these two cases could not be reproduced in the current automated harness. `viewport-fit=cover` also stays absent — it is only to be introduced if physical-device testing demonstrates a concrete layout/startup benefit with verified safe-area behavior, never based on emulation.

---

## PWA v1 status

As of this commit, PWA v1 engineering is treated as **complete**: installability foundation, explicit cache allowlist, seven proactive offline calculators, no RSC caching, no freshness-sensitive caching, a trusted offline fallback, a deliberate update lifecycle, failed-install protection, and automated/live-deployment QA are all in place. Physical-device certification (`PWA-DEVICE-QA-1`, above) is a separate, later QA task — not unfinished implementation.
