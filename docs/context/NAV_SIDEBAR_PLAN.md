# Desktop persistent sidebar — audit and remediation record

Branch: `nav-sidebar-2` (implementation); audit was `nav-sidebar-1`.

Branch point: verified clean `main` at `d9882ee96dd1a02eb7ecd128aba32f05ce210d2a`.

Part of the small `NAV-*` series started by `docs/context/HOME_POLISH_PLAN.md`'s sibling
gates. Each gate here is deliberately small: one finding in, one fix out.

## `NAV-SIDEBAR-1` — audit record

Design/IA audit of the desktop persistent "Public Quick Menu" sidebar, using 21st.dev for
comparison references. No application code changed. Full findings delivered in-conversation.

**Decision: `KEEP SIDEBAR, REMOVE DUPLICATED PRIMARY LINKS`.**

Measured evidence: when expanded, the sidebar's `NAVIGATION` group (Home, Orders & Circulars,
Utility Tools, Service Desk, Pensioners Hub, Search) duplicated `DesktopNav` 1:1, visible in the
same viewport simultaneously — not a mutually-exclusive mobile/desktop split like the drawer, a
genuine side-by-side repeat. The eight `TEACHER UTILITIES` deep links (5 under `Calculators &
Bills`, 3 under `Pension Services`) are unique to the sidebar and were kept.

A real, reproducible layout defect was also found and explicitly **not fixed** in that
audit-only gate: at 1024–1280px, expanding the sidebar pushes `DesktopNav` into a header row too
narrow for it, and "Home" visibly overlaps "AP SCHOOL EDUCATION". Isolated by comparing the
identical viewport with the sidebar collapsed (clean) vs. expanded (collision) — confirmed
caused by the sidebar's 256px width claim, not a pre-existing header bug.

## `NAV-SIDEBAR-2` — implementation record

Scope: remove exactly the six duplicated primary links from the **desktop persistent sidebar
only**. Do not touch the mobile drawer, `DesktopNav`, `BottomNav`, `SidebarCollapsible`'s
behavior, the sidebar's width model, or attempt the 1024–1280px collision fix.

### Mechanism

`Sidebar` (the component) picks `MobileDrawer` vs. the desktop collapsible `<aside>` based on
`isMobile`, but passes the same `children` to both — so `layout.tsx`'s composition is one JSX
tree shared by both surfaces. There was no existing way to keep content in one and drop it from
the other.

Added `SidebarMobileOnly` to `Sidebar.tsx`: a small client component that reads `isMobile` from
`useSidebar()` and returns `null` when not mobile — the same self-hiding pattern
`SidebarGroupLabel` already uses for its own open/collapsed check. `layout.tsx`'s primary
`NAVIGATION` `SidebarGroup` is now wrapped in it; the `TEACHER UTILITIES` group is untouched and
renders on both surfaces exactly as before.

Because `SidebarMobileOnly` returns `null` (a real subtree removal) rather than a CSS `hidden`
class, this carries none of the dead-space risk `HOME-POLISH-1` found in a similar-looking but
CSS-only case (`space-y-*` sibling margin landing on an empty-but-present element).

### Measured acceptance (real Chromium, production build)

| Width | State | Sidebar duplication | Deep links | Header collision |
| --- | --- | --- | --- | --- |
| 1024×768 | collapsed | n/a (0px, invisible) | n/a | n/a |
| 1024×768 | expanded | **none** — sidebar starts at `TEACHER UTILITIES` | all 8 present | **unchanged — still colliding** (numeric bounding-box overlap confirmed) |
| 1280×900 | expanded | none | all 8 present | **unchanged — still colliding** (21×9px measured overlap) |
| 1440×1000 | expanded | none | all 8 present | none (matches `NAV-SIDEBAR-1` baseline) |
| 1920×1080 | expanded | none | all 8 present | none |

Sidebar width: **unchanged, 256px expanded / 0px collapsed at every width tested.** Removing the
six duplicated links did not reduce the panel's width — exactly as `NAV-SIDEBAR-1` predicted and
this gate was explicitly told not to assume otherwise. The collision is a width-allocation
problem, not a content problem, and content-only surgery doesn't touch it.

Content-width impact at 1440px: feed 809px, category rail 248px — **identical** to
`NAV-SIDEBAR-1`'s pre-change measurement. At 1920px: feed 1180px, rail 372px — also identical.
No content-width regression or improvement from this gate, as expected.

Mobile drawer, re-verified live: still contains all six primary links plus all eight deep links.
Full accessibility contract intact — a real pointer click opens it, Escape closes it, `inert`
reapplied, focus returns to the trigger, body scroll unlocks. `SidebarCollapsible`'s
`aria-expanded` verified correct on the desktop panel too: `Calculators & Bills` starts `"true"`
(its `defaultOpen`), `Pension Services` starts `"false"` and flips to `"true"` on a real click.

### Regression guards

Two new tests, addressing the two ways this could silently regress:

1. `test/mobile-nav.test.tsx` — `SidebarMobileOnly` describe block: renders the real component
   at a phone-width viewport (children present) and at desktop width (children absent, sibling
   content unaffected). Proves the mechanism itself.
2. `test/nav.test.tsx` — `desktop sidebar carries no duplicated primary links` describe block:
   reads `layout.tsx`'s actual source, locates the `<SidebarMobileOnly>…</SidebarMobileOnly>`
   block, and asserts all six primary `href`s are inside it while all eight deep-link `href`s are
   outside it (and still present in the file). Proves the mechanism is wired to the right content.

Both mutation-checked: widening the wrapper past the `TEACHER UTILITIES` group's closing tag
(simulating an accidental over-wrap) fails guard 2 with the specific deep-link href in the
diff; disabling `SidebarMobileOnly`'s `isMobile` check fails guard 1's desktop-absence case.
Both restored to green after reverting.

### Verification

`tsc --noEmit` clean · full Vitest **69 files / 496 tests pass** (up from 492 — 2 new tests in
`nav.test.tsx`, 2 in `mobile-nav.test.tsx`) · Tailwind class/colour guards pass (part of the
suite) · `git diff --check` clean · `npx next build` succeeds, First Load JS shared unchanged at
87.3 kB · real-Chromium acceptance at 1024×768, 1280×900, 1440×1000, 1920×1080 (collapsed and
expanded) plus 390×844 for the mobile drawer, on an isolated production server instance.

### Files changed

- `app/(public)/_components/Sidebar.tsx` — added `SidebarMobileOnly`.
- `app/(public)/layout.tsx` — wrapped the primary `NAVIGATION` group in it.
- `test/mobile-nav.test.tsx` — added the `SidebarMobileOnly` describe block.
- `test/nav.test.tsx` — added the source-structure describe block.

### Follow-up

**`NAV-SIDEBAR-WIDTH-1`** — the 1024–1280px header collision remains, unchanged by this gate as
instructed. It's a width-allocation problem (the panel still claims 256px regardless of how much
content it holds) needing its own scoped decision: shrink the expanded width, make the header
responsive to the sidebar's presence, or something else — not decided here.

### Deliberately not done here

`DesktopNav`, the mobile drawer, `BottomNav`, `SidebarCollapsible`'s implementation, the
1024px navigation breakpoint, the sidebar's width model, `SidebarProvider`'s architecture, and
the Service Desk/Topics IA (A16) are all unchanged. No 21st.dev component was installed.
