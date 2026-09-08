# UI Audit — `UI-AUDIT-1`

## Gate identity

- Gate: `UI-AUDIT-1`
- Mode: AUDIT ONLY — no production UI was modified.
- Branch: `ui-system-production-readiness`
- Audited at SHA: `e1ec932c7ff411c81e72e9fcb89db7df55a53b8f`
- Baseline SHA: `03642c62ba099f0f413b81caee6bbfd1341e21b3`
- Scope: the public application under `app/(public)` plus the root layout, global
  stylesheet, and Tailwind configuration that govern it. `app/admin` is out of scope for
  this gate and is noted only where it shares a primitive with the public UI.

## How claims in this document were established

Rendered browser tooling was not used for this gate. To avoid guessing, styling claims
were verified by **compiling the project's own Tailwind configuration** and inspecting the
emitted CSS, rather than by reading class names and assuming they resolve:

```
npx tailwindcss -i app/globals.css -o <scratch>/tw-out.css
```

Every class used in `app/**/*.tsx` was then diffed against the selectors actually present
in that output. This is what surfaced the dead-class and undefined-colour findings below;
those are therefore facts about the build, not inferences.

Each finding carries an evidence class:

- **CONFIRMED (code)** — provable from source or from the compiled CSS. No browser needed.
- **HIGH RISK** — the mechanism is proven in code and the failure follows from it, but the
  precise visual result depends on viewport, device, or content and is worth seeing.
- **NEEDS BROWSER** — cannot be settled without rendering.

Validation run for this gate: `npx tsc --noEmit` passes (exit 0). The full Vitest suite was
not run because this gate changed no application code; `UI-REGRESSION-1` owns that.

---

## Original production-readiness checklist — status

| # | Checklist item | Status | Evidence | Gate that owns the fix |
|---|---|---|---|---|
| 1 | Remove horizontal scroll | **At risk** — no page-level `w-screen`/`100vw`/fixed-width offender found (all `w-[…px]` occurrences are `max-w-*`), but 7 horizontal scroll strips render a visible scrollbar because `no-scrollbar` does not exist | CONFIRMED (code) — F2 | `UI-RESPONSIVE-1` |
| 2 | Meta descriptions | **Mostly done** — all 18 public routes export metadata; the home route omits its own description and inherits the layout default | CONFIRMED (code) | `UI-SEO-1` |
| 3 | Favicon | **Missing** — no `favicon.*`, `icon.*`, `apple-icon.*` or manifest anywhere; `public/` holds only `.gitkeep` | CONFIRMED (code) — F10 | `UI-SEO-1` |
| 4 | Page titles | **Present but unsystematic** — title template is bare `"%s"`, so every route repeats `— AP Teacher Desk` by hand; several exceed ~60 characters | CONFIRMED (code) — F24 | `UI-SEO-1` |
| 5 | Compress/optimize images | **Not currently applicable** — no `next/image`, no `<img>`, no image assets in `public/`; the UI is inline SVG and CSS only | CONFIRMED (code) | `UI-PERF-1` (record as N/A) |
| 6 | Clickable email | **No genuine email exists** in the public UI — nothing to linkify, and none may be invented | CONFIRMED (code) | `UI-LINKS-1` (record as N/A) |
| 7 | Fix broken links | **Internal links already guarded** by `test/link-crawl.test.ts` against real DB slugs; external destinations are unverified and one is misleading | CONFIRMED (code) — F16 | `UI-LINKS-1` |
| 8 | Mobile menu | **Exists but incomplete** — off-canvas drawer has no Escape, no focus trap, no scroll lock, and stays keyboard-reachable while closed | CONFIRMED (code) — F5 | `UI-MOBILE-NAV-1` |
| 9 | Remove placeholder text | **No lorem/TODO/demo text found**; the defect is a real-looking CTA pointing at a generic destination | CONFIRMED (code) — F16 | `UI-CONTENT-1` |
| 10 | Test on mobile | **Not performed** — no browser/device tooling this gate | NEEDS BROWSER | `UI-ACCEPTANCE-1`, `UI-DEVICE-1` |
| 11 | Empty states | **Partial** — home, category filter, orders, search and nav rail have them; no generic list-empty pattern | CONFIRMED (code) | `UI-STATES-1` |
| 12 | Loading states | **Absent** — no `loading.tsx` on any route; debounced search shows no pending feedback | CONFIRMED (code) — F11 | `UI-STATES-1` |
| 13 | Optimize for mobile | **At risk** — 12px inputs trigger iOS focus zoom; multiple controls below 44px | CONFIRMED (code) — F6, F7 | `UI-RESPONSIVE-1`, `UI-A11Y-1` |
| 14 | Fix mobile overflow | **One confirmed structural defect** — two fixed bottom bars stack on post pages | CONFIRMED (code) — F1 | `UI-RESPONSIVE-1` |
| 15 | Error messages | **Route errors good; form errors not associated** — `app/(public)/error.tsx` is bilingual, offers retry and leaks no internals; field errors are visual only | CONFIRMED (code) — F13 | `UI-STATES-1`, `UI-A11Y-1` |
| 16 | Success messages | **Correctly absent** — the public surface is read-only plus client-side calculators; the only action is `window.print()`, which the browser confirms. No success state should be invented | CONFIRMED (code) | `UI-STATES-1` (record as N/A) |
| 17 | 404 page | **Missing** — no `app/not-found.tsx`; `notFound()` calls in dynamic routes fall through to the Next.js default | CONFIRMED (code) — F10 | `UI-404-1` |
| 18 | Keyboard navigation & visible focus | **Broken on form controls** — `Input` and `NativeSelect` suppress the global focus outline and their replacement ring never paints | CONFIRMED (code) — F4 | `UI-A11Y-1` |
| 19 | Touch-target sizing | **Below 44px in several primitives** | CONFIRMED (code) — F7 | `UI-A11Y-1` |
| 20 | Image dimensions / layout shift | **Not applicable** (no images); fonts use `display: swap` | CONFIRMED (code) | `UI-PERF-1` |
| 21 | Long-content handling | **Partially handled** — `truncate`/`break-words` used in 17 places; breadcrumb current page truncates at 200px with no full text exposed | CONFIRMED (code) — F27 | `UI-RESPONSIVE-1` |

---

## Findings

### P0 — must fix before production

#### F1. Two fixed bottom bars stack on post detail pages · CONFIRMED (code)

`ThumbZoneBar` is `fixed bottom-0 left-0 right-0 z-50` with **no responsive hiding**
(`app/(public)/posts/[slug]/_components/ThumbZoneBar.tsx:21`). `BottomNav` is
`fixed bottom-0 left-0 right-0 z-50 lg:hidden` (`app/(public)/_components/BottomNav.tsx:64`).

`ThumbZoneBar` renders whenever `post.pdfUrl` is set, from both post templates
(`_templates/GoMemoTemplate.tsx:74`, `_templates/NotificationTemplate.tsx:78`). So on every
viewport below `lg` (1024px) both bars occupy the same bottom strip at the same stacking
level. Additionally the shell reserves only `pb-[64px]` for one bar
(`app/(public)/layout.tsx:169`), so article content is also obscured.

On `lg` and above the mobile "thumb zone" bar still spans the full desktop width, which is
a design mismatch independent of the collision.

#### F2. Seven utility classes are used but never generated · CONFIRMED (compiled CSS)

The project pins `tailwindcss ^3.4.4` with no plugins, but the code uses several
Tailwind v4 utility names plus two classes that were never defined anywhere. Verified by
compiling the project config and grepping the output:

| Class | Usages | Why it does not resolve |
|---|---|---|
| `shadow-2xs` | 21 | v4 name; v3 `boxShadow` scale is `sm, DEFAULT, md, lg, xl, 2xl, inner, none` |
| `no-scrollbar` | 7 | Not in Tailwind and not defined in `app/globals.css` or `tailwind.config.js` |
| `shadow-xs` | 7 | v4 name (all in `TaxCalculatorUI.tsx`) |
| `animate-fadeIn` | 3 | No `keyframes`/`animation` extension in `tailwind.config.js` |
| `backdrop-blur-xs` | 2 | v4 name; v3 smallest is `backdrop-blur-sm` |
| `animate-slideUp` | 1 | No keyframes defined |
| `py-0.2` | 1 | Not a valid spacing step |

User-visible consequences: intended shadows never paint; the seven horizontal scroll strips
(breadcrumbs, tabs, topic tags, category filters, sidebar content) show a **visible
scrollbar** the code intends to hide; and the `Sheet` slide-up/fade-in animations never run.

#### F3. The `accent` colour does not exist, so active states render unstyled · CONFIRMED (compiled CSS)

`tailwind.config.js` defines `ink, inkSoft, turmeric, turmericDeep, tamarind, tamarindDark,
kumkum, paper, paperRaised, hair, masthead, mastheadText`. There is no `accent`. Tailwind's
default palette has none either. `bg-accent`, `text-accent` and `border-accent` are absent
from the compiled output.

- `app/(public)/_components/Sidebar.tsx:275` — active quick-menu item:
  `bg-accent/15 text-accent border border-accent/20 font-bold shadow-2xs`
- `app/(public)/_components/Sidebar.tsx:387` — active submenu item: `text-accent font-bold bg-accent/10`
- `app/(public)/_components/Pagination.tsx:36` — current page: `bg-accent/15 border-accent text-accent shadow-sm`

Every colour token in the active branch is dropped, and `shadow-2xs` (F2) is dropped too.
**The sidebar is mounted in the public layout, so its "you are here" highlight is currently
invisible to sighted users.** The `Pagination` instance is latent only because that component
is unused (F14).

#### F4. Form controls have effectively no visible focus indicator · CONFIRMED (compiled CSS)

`app/globals.css:93` sets a global focus ring:

```css
:where(a, button, input, select, textarea, summary, [tabindex]):focus-visible {
  outline: 2px solid var(--color-tamarind);
}
```

`Input.tsx:16` and `NativeSelect.tsx:15` both apply bare `outline-none` plus
`focus:ring-tamarind/20`. Two independent problems compound:

1. `.outline-none { outline: 2px solid transparent }` is emitted at line 2706 of the
   compiled sheet; the `:where(...)` base rule is at line 557. `:where()` contributes zero
   specificity, so both selectors are `(0,1,0)` and **the later utility wins** — the global
   outline is cancelled on these controls.
2. `focus:ring-tamarind/20` sets only `--tw-ring-color`. **No ring-width utility is
   generated anywhere in the build** (`ring-2` exists only as `focus-visible:ring-2`, used
   by other components), so `--tw-ring-shadow` stays at its `0 0 #0000` initial value and
   the ring never paints.

What survives is `focus:border-tamarind` — a 1px border colour change. Every calculator
form on the site uses these two primitives.

Only these two files strip the outline without a `focus-visible` replacement; every other
component that uses `outline-none` pairs it with `focus-visible:ring-*` correctly.

#### F5. Mobile navigation drawer is incomplete · CONFIRMED (code)

`app/(public)/_components/Sidebar.tsx:114-137`. The drawer is always in the DOM and is only
translated off-screen (`-translate-x-full`) when closed. It has:

- no `Escape` handler;
- no focus trap, no focus move into the panel, no focus return to the trigger;
- no body scroll lock, so the page scrolls behind the scrim;
- no `inert`/`aria-hidden`/`display:none` when closed — **the closed drawer's links stay
  keyboard-focusable and screen-reader reachable**, so tabbing from the header walks into an
  invisible menu;
- a `<div onClick>` scrim with no keyboard equivalent (line 118).

`SidebarTrigger` (line 404) is icon-only with a `title` but no `aria-label`,
`aria-expanded`, or `aria-controls`.

Phase 6 explicitly requires Escape, focus handling and scroll locking, so this is the
central `UI-MOBILE-NAV-1` work item.

---

### P1 — required for a credible production release

#### F6. 12px inputs trigger iOS zoom-on-focus · CONFIRMED (code) / HIGH RISK (visual)

`Input.tsx:16` and `NativeSelect.tsx:15` use `text-xs sm:text-sm` — 12px at mobile widths.
Mobile Safari zooms the viewport whenever a focused control's font-size is below 16px. Every
calculator form is affected. Confirming the resulting layout jump needs a device.

#### F7. Touch targets below the 44px floor · CONFIRMED (code)

| Control | Computed size | Location |
|---|---|---|
| `Button` size `sm` | `px-2.5 py-1.5 text-xs` → ~28px tall | `Button.tsx:34` |
| `Button` size `md` | `px-4 py-2 text-xs sm:text-sm` → ~32–34px tall | `Button.tsx:35` |
| `Input` / `NativeSelect` | `px-3 py-2 text-xs` → ~34px tall | `Input.tsx:16`, `NativeSelect.tsx:15` |
| Pagination page link | `min-w-[32px] h-8` → 32×32 | `Pagination.tsx:34` |
| Bottom-nav item | `p-1.5` around a 20px icon → ~32px wide | `BottomNav.tsx:75` |
| Search clear `✕` | bare glyph, `absolute right-3.5 top-3.5` | `SearchUI.tsx:147` |

`ThumbZoneBar` is the counter-example and gets it right: explicit `h-[48px] min-h-[48px]`
and `w-[48px] min-w-[48px]` (lines 27, 38).

#### F8. Fixed bottom bars ignore iOS safe-area insets · CONFIRMED (code) / NEEDS BROWSER

Neither `BottomNav` nor `ThumbZoneBar` uses `env(safe-area-inset-bottom)` or
`pb-[env(...)]`, and there is no `viewport-fit=cover` handling. On notched iPhones the bars
sit under the home indicator.

#### F9. Production URLs fall back to `localhost` in metadata and structured data · CONFIRMED (code)

`app/(public)/layout.tsx:25` and `app/(public)/_components/Breadcrumb.tsx:86` both use
`process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"`. If that variable is not set
in the deployed environment, `metadataBase` and every emitted `BreadcrumbList` JSON-LD
`item` URL point at `localhost:3000` — published to search engines as the canonical trail.
There is no build-time guard that the variable is set.

#### F10. No custom 404, no favicon, no social or crawler metadata · CONFIRMED (code)

- No `app/not-found.tsx` or route-group `not-found.tsx`. `notFound()` in
  `category/[slug]` and `posts/[slug]` renders the unstyled Next.js default, which drops the
  user out of the site shell entirely.
- No `favicon.ico`, `icon.*`, `apple-icon.*`, `manifest.*`, `robots.*`, `sitemap.*`, or
  `opengraph-image.*`.
- No `openGraph`, `twitter`, `alternates.canonical`, or `robots` keys in any route's
  metadata.

#### F11. No loading states anywhere · CONFIRMED (code)

No `loading.tsx` exists on any route. The home page is `dynamic = 'force-dynamic'`
(`app/(public)/page.tsx:17`) and both category and post pages are DB-backed, so first paint
waits on the database with no skeleton.

`SearchUI` debounces 400ms and then calls `router.push` (`SearchUI.tsx:109-121`) without
`useTransition`, so between keystroke and new results there is no pending affordance at all.

#### F12. Heading structure defects · CONFIRMED (code)

Three routes render **no `h1`** in the page or its components:

- `/pensioners/commutation-tracker` (top heading is `h2`, `CommutationTrackerUI.tsx:48`)
- `/pensioners/pension-calculator` (`PensionCalculatorUI.tsx:67`)
- `/tools/prc-calculator` (`PrcCalculatorUI.tsx:97`)

`/tools/tax-calculator` renders **two `h1`s** — `TaxCalculatorUI.tsx:448` (page title) and
`:1783` ("RECEIPT OF HOUSE RENT", inside a printable form).

#### F13. Field errors are visual only · CONFIRMED (code)

`Field` renders `FieldError` as a plain `<p>` (`Field.tsx:56-61, 92-96`) with no `id`, and
`Input`'s `error` prop only swaps the border colour (`Input.tsx:10`). There is no
`aria-invalid` and no `aria-describedby` linking control to message, so assistive technology
is never told a field is invalid or why.

Label association is largely correct — 36 of 39 `<Field>` usages pass `htmlFor`; the
`CommutationTrackerUI` and `PensionCalculatorUI` call sites are the exceptions to check.

#### F14. `Sheet` is unused, keyboard-inoperable, and lacks dialog semantics · CONFIRMED (code)

`app/(public)/_components/Sheet.tsx` is imported by **zero** files.

Were it used it would fail: `SheetTrigger` is a `<div onClick>` with no `role`, `tabIndex`
or key handler (line 41); `SheetContent` has no `role="dialog"`, `aria-modal`,
`aria-labelledby`, focus trap, Escape handler, focus return, or scroll lock; the close
button is a bare `✕` with no accessible name (line 80); and its three animation/blur classes
are dead (F2).

`Pagination` is likewise imported by zero files and referenced by no test.

#### F15. Collapsed accordion content stays focusable · CONFIRMED (code)

`AccordionContentPrimitive` (`Accordion.tsx:76-92`) collapses via
`grid-rows-[0fr] opacity-0 overflow-hidden` with no `hidden`, `inert` or `aria-hidden`.
Content is visually gone but still in the tab order and the accessibility tree. The
accordion is used by 9 files, so this is the most widely repeated a11y defect after F4.

Otherwise this component is the best-built primitive in the repo: correct `aria-expanded`,
`aria-controls`, id linkage and `focus-visible` ring.

#### F16. WhatsApp CTA promises a channel and links to the WhatsApp homepage · CONFIRMED (code)

`app/(public)/posts/[slug]/_components/WhatsAppBanner.tsx:19-27` renders
"Join WhatsApp Channel" / "Get instant AP School Education G.O.s & TET/DSC notifications
directly on WhatsApp" pointing at `https://whatsapp.com`. No such channel is referenced
anywhere in the repository.

This is an unsupported claim plus a dead-end CTA on every post page. It must be removed or
pointed at a real, verified channel URL — not invented.

#### F17. Active navigation state is not exposed to assistive technology · CONFIRMED (code)

`BottomNav`, `DesktopNav` and the sidebar menu components compute an `isActive` flag and use
it for styling only. None sets `aria-current="page"`. `Pagination` and `Breadcrumb` do set
it correctly — the pattern exists in the codebase and simply is not applied to navigation.

The public shell also mounts at least three `<nav>` landmarks (header, bottom bar, sidebar)
without distinguishing `aria-label`s, so screen-reader landmark lists read three
identical "navigation" entries. `Breadcrumb` and `Pagination` label theirs correctly.

There is also no skip-to-content link in `app/(public)/layout.tsx`.

---

### P2 — quality, consistency, and maintenance

- **F18. Navigation breakpoints disagree.** `SidebarProvider` switches on
  `window.innerWidth < 768` (`Sidebar.tsx:69`), while `BottomNav` (`lg:hidden`) and
  `DesktopNav` switch at 1024px. Between 768px and 1023px the drawer behaves as a desktop
  push-sidebar while the mobile tab bar is still shown. CONFIRMED (code) / HIGH RISK visually.
- **F19. Drawer scrim sits below the bottom tab bar.** Scrim is `z-40` (`Sidebar.tsx:119`),
  `BottomNav` is `z-50`. With the drawer open the tab bar stays fully lit and clickable
  above the overlay. CONFIRMED (code).
- **F20. `pb-[64px]` is unconditional.** `app/(public)/layout.tsx:169` reserves bottom-bar
  space at every width, including `lg`+ where `BottomNav` is hidden. CONFIRMED (code).
- **F21. Two parallel icon systems.** Navigation, cards and controls use hand-drawn inline
  SVG, while the sidebar (`layout.tsx:66-120`), `ThemeToggle`, `DesktopLeftNav:28`,
  search chips (`SearchUI.tsx:205`), `ThumbZoneBar:29` and `WhatsAppBanner:8` use emoji —
  including a literal `"SD"` string as an icon (`layout.tsx:75`). Emoji render
  inconsistently across platforms, cannot be recoloured, and conflict with the intended
  calm/authoritative direction. CONFIRMED (code).
- **F22. Raw palette colours outside the token system.** `Button` `danger` uses
  `bg-red-600` (`Button.tsx:29`); `Input`/`NativeSelect` error borders use `border-red-500`;
  `FieldLabel` required marker and `FieldError` use `text-red-500`. The project already has
  `kumkum` for this role. CONFIRMED (code).
- **F23. Title template is inert.** `template: "%s"` (`layout.tsx:31`) adds nothing, so all
  17 static routes hand-append `— AP Teacher Desk`. A real template would remove the
  repetition and the drift risk. CONFIRMED (code).
- **F24. Several titles exceed display limits.** e.g. `/tools/cfms-checker` at 75 chars,
  `/tools/leave-encashment` at 72, `/pensioners/office-pipeline` at 69. CONFIRMED (code).
- **F25. Metadata references Telangana.** `/tools/da-arrears`, `/tools/gpf-apgli` and
  `/tools/prc-calculator` descriptions advertise "AP and TS" / "Telangana". The master plan's
  program boundary is Andhra Pradesh School Education only. Needs a product decision, not a
  silent edit. CONFIRMED (code).
- **F26. Table semantics.** `Table.tsx` wraps in `overflow-x-auto` (correct, and permitted
  by the plan) but the scroll container is not focusable (`tabIndex`) and carries no
  `role="region"`/label, so keyboard users cannot scroll it; `TableHead` emits `<th>` with no
  `scope`. CONFIRMED (code).
- **F27. Breadcrumb current-page semantics and truncation.** `BreadcrumbPage`
  (`Breadcrumb.tsx:49-61`) puts `role="link" aria-disabled="true"` on a non-focusable
  `<span>`, announcing an unusable link; `aria-current="page"` alone is the correct pattern.
  It also truncates at `max-w-[200px]` with no `title`, so long GO references are
  unrecoverable. CONFIRMED (code).
- **F28. Global `Ctrl/Cmd+B` shortcut.** `Sidebar.tsx:77-86` binds a window keydown handler
  that calls `preventDefault()` unconditionally, with no check for `input`/`textarea`/
  `contenteditable` targets, and overrides the browser's bookmark-sidebar shortcut.
  CONFIRMED (code).
- **F29. No pagination anywhere.** Search returns up to 100 rows (`lib/posts/query.ts:119`)
  in one page; listings are hard-capped at 3–6 items with no "view more". The `Pagination`
  component that would serve this is unused (F14). CONFIRMED (code).
- **F30. Hardcoded quick-search chips.** `SearchUI.tsx:21-28` offers "TET 2026", "Mega DSC",
  "Form 16" etc. These are not derived from indexed content, so a chip can lead to an empty
  result set. Needs verification against real data before `UI-CONTENT-1` keeps them.
- **F31. 10px label text on mobile.** `FieldLabel` uses `text-[10px] sm:text-xs`
  (`Field.tsx:34`); `--label-helper` bottoms out at 10px and the bottom-nav labels are
  `text-[10px]`. CONFIRMED (code).
- **F32. ThemeToggle details.** No `aria-pressed` for a toggle; the pre-mount placeholder
  (`ThemeToggle.tsx:36-42`) is `opacity-0` but still focusable and unlabelled; the `title`
  exposes internal design codenames ("Digital Secretariat", "Imperial Gazette").
  CONFIRMED (code).
- **F33. No about/contact/privacy route** exists, and no genuine contact details appear
  anywhere in the public UI. This blocks checklist items 6 and 17 legitimately — nothing may
  be fabricated. Needs a product decision.

### P3 — polish

- **F34.** `animate-pulse` dot on the active bottom-nav item (`BottomNav.tsx:82`) is
  perpetual motion serving no state change; conflicts with the calm direction.
- **F35.** `DesktopLeftNav` and `DesktopSidebar` are `hidden lg:block` but are server
  components that query the database on every request regardless of viewport
  (`DesktopLeftNav.tsx:9-18`).
- **F36.** `app/(public)/page.tsx:17` sets `dynamic = 'force-dynamic'`, opting the home page
  out of caching entirely. Worth confirming this is deliberate rather than inherited.

---

## Test coverage gaps this audit exposes

The existing suite is substantial (43 files, including DB-backed link crawling and lifecycle
guards), but three of this audit's most serious findings were invisible to it. Each is a case
of a test that passes while proving less than its name suggests:

1. **`test/a11y.test.ts`** guards against `focus:outline-none` without a `focus-visible`
   replacement. `Input.tsx` and `NativeSelect.tsx` use **bare** `outline-none`, which the
   pattern does not match — so F4, a total loss of focus indication on every form control,
   passes the accessibility guard. The check is also per-file rather than per-element: a file
   containing `focus:outline-none` on one element and `focus-visible:ring` on a different one
   passes.
2. **`test/tailwind-colors.test.ts`** proves that *defined* tokens compile to real CSS. It
   never asserts that *used* classes resolve. `bg-accent` (F3) and all seven dead classes
   (F2) sail through.
3. **No test compiles the stylesheet and asserts that every class used in `app/` exists in
   the output.** That single guard would have caught F2 and F3 outright, and is the highest-
   value test to add during `UI-SYSTEM-1`.

Recommended additions, to be implemented in the gate that fixes the corresponding finding:

- A dead-class guard (compile Tailwind, diff against classes used in `app/**`). Owns F2, F3.
- An element-level focus-indicator guard replacing the current file-level heuristic. Owns F4.
- A "one `h1` per public route" guard. Owns F12.
- A "no two `fixed bottom-0` elements render on the same route" guard, or a post-page
  regression test. Owns F1.

---

## Component inventory and disposition

### Shared public primitives — `app/(public)/_components`

| Component | Disposition | Rationale |
|---|---|---|
| `Accordion` | **REFINE** | Best-built primitive here; only needs collapsed content removed from the tab order (F15) and `shadow-2xs` fixed (F2). Used by 9 files. |
| `Badge` | **KEEP** | Widely used (29 files), token-driven, no defects found. |
| `BottomNav` | **REFINE** | Touch targets (F7), `aria-current` (F17), safe-area (F8), decorative pulse (F34), z-index vs scrim (F19). |
| `Breadcrumb` | **REFINE** | Fix `role="link"` span (F27), truncation without `title`, `no-scrollbar` (F2), and the localhost JSON-LD fallback (F9). |
| `Button` | **REFINE** | Raise `sm`/`md` to a 44px target (F7); move `danger` onto `kumkum` (F22); add `aria-busy` for `isLoading`. Good `buttonClassName` escape hatch — keep that. |
| `Card` | **KEEP** | 23 usages, consistent, no defects found. |
| `DesktopLeftNav` | **REFINE** | Replace emoji icon (F21); avoid querying when hidden (F35). |
| `DesktopNav` | **REFINE** | Needs `aria-current` (F17). |
| `DesktopSidebar` | **REFINE** | Same as `DesktopLeftNav`. |
| `Field` | **REFINE** | Wire `aria-describedby`/`aria-invalid` (F13); raise 10px label (F31); tokenise red (F22). |
| `HeroCard` | **KEEP** | Single-purpose, no defects found. |
| `Input` | **REPLACE** | Focus indication (F4), 16px mobile font (F6), 44px target (F7), `aria-invalid` (F13), dead `shadow-2xs`. The primitive that fails most checklist items. |
| `NativeSelect` | **REPLACE** | Identical defect set to `Input`. |
| `OrderStateBadge` | **KEEP** | Trust/lifecycle semantics; do not alter presentation without `UI-PATTERNS-1`. |
| `Pagination` | **REFINE, then adopt** | Unused today (F14) but structurally sound with correct `aria-current` and ellipsis logic. Fix the `accent` active state (F3) and 32px targets (F7), then use it for F29 rather than writing a new one. |
| `PostCard` | **KEEP** | Pending `UI-PATTERNS-1` review alongside `HeroCard`. |
| `Separator` | **KEEP** | 7 usages, trivial. |
| `Sheet` | **DELETE** | Zero usages; keyboard-inoperable trigger; no dialog semantics; three dead animation classes (F14, F2). If a dialog is needed later, `UI-SYSTEM-2` should build one properly rather than revive this. |
| `Sidebar` | **REFINE (substantial)** | Escape, focus trap, scroll lock, closed-state inertness, trigger labelling (F5); `accent` active state (F3); breakpoint alignment (F18); scrim z-index (F19); global shortcut (F28). Primary `UI-MOBILE-NAV-1` work. |
| `Table` | **REFINE** | Add `scope`, focusable scroll region (F26). Only 1 usage — confirm it should remain the shared table before investing. |
| `Tabs` | **REFINE** | `no-scrollbar`, `animate-fadeIn`, `py-0.2` all dead (F2). |
| `ThemeToggle` | **REFINE** | `aria-pressed`, non-focusable placeholder, emoji icons, codenames in tooltip (F32, F21). |
| `TopicTagBar` | **REFINE** | `no-scrollbar` (F2). |
| `UpcomingActionDates` | **KEEP** | Recently added, correct focus handling, guards its own empty case. |
| `lifecyclePill.ts` | **KEEP** | Trust/lifecycle logic — out of scope for UI gates. |

### Route-local components of note

| Component | Disposition | Rationale |
|---|---|---|
| `posts/[slug]/_components/ThumbZoneBar` | **REFINE** | Correct 48px targets, but must not co-exist with `BottomNav` and should not span desktop (F1). |
| `posts/[slug]/_components/WhatsAppBanner` | **DELETE or REPOINT** | Unsupported claim and dead-end CTA (F16). Product decision. |
| `posts/[slug]/_templates/GoMemoTemplate`, `NotificationTemplate` | **MERGE candidate** | Near-identical shells (both `max-w-[1700px]`, same masthead block, same `prose-gazette overflow-x-auto` body, same `ThumbZoneBar` call). `UI-PATTERNS-1` should extract the shared document shell. |
| `posts/[slug]/_components/TableOfContents` | **REFINE** | `no-scrollbar` (F2); `sticky top-24` hardcodes header height. |
| `search/_components/SearchUI` | **REFINE** | Add pending state (F11); verify chips (F30); enlarge clear button (F7). Otherwise strong — `role="search"`, labelled sections, real empty state, and a well-reasoned `highlightMatch`. |
| `orders/_components/OrdersFilterTabs`, `category/[slug]/_components/CategoryLogList` | **MERGE candidate** | Both implement a horizontal filter strip with the same dead `no-scrollbar`; `UI-PATTERNS-1` should produce one `FilterBar`. |
| `tools/tax-calculator/_components/TaxCalculatorUI` | **REFINE** | 1800+ lines, duplicate `h1` (F12), 7 dead `shadow-xs` (F2), and a `sticky top-3 z-30` summary bar that sits *behind* the `z-40` sticky header — HIGH RISK, worth seeing in a browser. |

---

## What genuinely requires browser verification

These could not be settled from source and must not be reported as passing until seen:

1. Whether any page actually scrolls horizontally at 320/360/375/390/430px. No structural
   cause was found in code, but only rendering proves it.
2. The visual result of F1 — how the two bottom bars stack, and how much content is hidden.
3. F18's 768–1023px band: what the navigation actually looks like mid-transition.
4. The `TaxCalculatorUI` sticky-bar-behind-header interaction.
5. iOS focus zoom (F6) and safe-area clipping (F8) — real device, per `UI-DEVICE-1`.
6. Colour contrast of `inkSoft`, `inkSoft/70` and `inkSoft/60` on `paper`/`paperRaised` in
   both themes. The tokens are known; the computed ratios were not measured this gate.
7. Whether the dead shadows (F2) leave any layout visibly flat enough to matter, or whether
   removing the classes is purely a correctness cleanup.
8. Print output (`@page A4`, `print:hidden` coverage) for the calculators' printable forms.

---

## Recommended gate sequencing adjustment

`UI-DESIGN-1` is the next gate per the master plan and should proceed. However **F1, F3 and
F4 are correctness defects, not design questions** — a stacked pair of bottom bars, an
invisible active-navigation state, and unfocusable form controls will need fixing regardless
of which visual direction is chosen.

Recommendation: leave the roadmap order intact, but have `UI-SYSTEM-1` open with the
dead-class and token audit (F2, F3) plus the focus-indicator repair (F4), since all three are
token/foundation-layer problems that every later gate would otherwise build on top of. F1
belongs to `UI-RESPONSIVE-1` and F5 to `UI-MOBILE-NAV-1` as already planned.

No fixes were implemented in this gate.
