# UI System & Production Readiness Master Plan

## Program purpose

This document is the repository-native roadmap for the AP Teacher Desk UI System &
Production Readiness program. It allows a future agent to recover program sequence,
responsibilities, constraints, and completion state without relying on chat history.

The program starts from the verified FRESHNESS-1 closure baseline at
`03642c62ba099f0f413b81caee6bbfd1341e21b3` on the
`ui-system-production-readiness` branch. Quality and accuracy take precedence over
delivery speed. The portal remains AP-only and School Education/teachers-only.

Each gate must preserve existing functionality and information architecture unless its
scope explicitly authorizes a change. A gate is not closed until its repository state,
validation evidence, limitations, and next gate are recorded in the context documents.

## Staged roadmap

### Phase 0 — `UI-BASELINE-0`

Establish the branch, baseline, repository-native roadmap, and state tracking. Do not
redesign the UI or make production changes in this phase.

### Phase 1 — `UI-AUDIT-1`

Audit all important public routes and UI patterns. Categorize components as KEEP /
REFINE / MERGE / REPLACE / DELETE. Audit responsive issues, horizontal scrolling,
mobile overflow, navigation, typography, spacing, controls, cards, tables, links,
images, placeholders, states, titles, metadata, favicon, accessibility, and performance
indicators. No redesign.

### Phase 2 — `UI-DESIGN-1`

Define product design direction and design rules. The intended direction is
professional, authoritative, modern, calm, trustworthy, information-focused, and
mobile-friendly. This phase may later use Impeccable for design critique and context.

### Phase 3 — `UI-SYSTEM-1`

Establish design tokens and foundations: colors, spacing, typography, radius, borders,
shadows, breakpoints, z-index, and motion.

### Phase 4 — `UI-SYSTEM-2`

Standardize reusable UI primitives such as Button, Input, Select, Badge, Card, Dialog,
Tooltip, Toast, Skeleton, and similar components. 21st.dev MCP may be used selectively
from this phase onward, but imported components must be normalized into the repository
design system.

### Phase 5 — `UI-RESPONSIVE-1`

Eliminate accidental horizontal scrolling and mobile overflow. Repair responsive
containers, long titles, breadcrumbs, search controls, filters, tables, cards,
pagination, and images.

Target widths:

- 320
- 360
- 375
- 390
- 430
- 768
- 1024
- 1440

### Phase 6 — `UI-MOBILE-NAV-1`

Implement proper mobile navigation with keyboard, focus, touch, and route-change
behavior.

### Phase 7 — `UI-PATTERNS-1`

Standardize domain-level patterns such as PageHeader, DocumentCard, SearchResult,
CategoryCard, DocumentMetadata, PublishedDate, SourceIndicator, GOIR/trust
presentation, Breadcrumbs, FilterBar, and Pagination. Related Orders context must be
considered wherever post information is surfaced.

### Phase 8 — `UI-STATES-1`

Add deliberate loading, empty, error, and success states.

### Phase 9 — `UI-CONTENT-1`

Remove placeholder/demo text, fake counters/statistics, unsupported claims, stale copy,
and dead UI.

### Phase 10 — `UI-SEO-1`

Fix page titles, meta descriptions, favicon, and appropriate metadata, canonical, and
social metadata where justified.

### Phase 11 — `UI-LINKS-1`

Audit and fix internal, external, and document links. Implement `mailto:` and `tel:`
where genuine contact information exists.

### Phase 12 — `UI-404-1`

Add a useful custom not-found/unavailable experience with recovery paths.

### Phase 13 — `UI-PERF-1`

Optimize images and frontend performance, including size, dimensions, responsive
delivery, lazy loading, layout shift, unused assets, and unnecessary frontend weight.

### Phase 14 — `UI-A11Y-1`

Perform an accessibility pass covering keyboard navigation, focus, semantics, labels,
alt text, form errors, contrast, dialogs, menus, touch targets, and reduced motion.

### Phase 15 — `UI-IMPECCABLE-1`

Use Impeccable for controlled visual critique against the established design rules.
Preserve functionality and information architecture.

### Phase 16 — `UI-21DEV-1`

Perform a selective 21st.dev enhancement pass for weak components only. Do not treat
21st.dev as the design system.

Operating rule:

> Search -> compare -> choose -> import -> normalize -> test -> own.

### Phase 17 — `UI-ACCEPTANCE-1`

Perform browser and responsive acceptance across representative routes and
desktop/tablet/mobile widths.

### Phase 18 — `UI-DEVICE-1`

Perform real-device mobile acceptance where environment and device access permit.

### Phase 19 — `UI-REGRESSION-1`

Complete full regression verification.

### Phase 20 — `UI-SYSTEM-CLOSE`

Record final state, tests, acceptance evidence, known limitations, and remote
verification.

## Design-tool responsibilities

- Impeccable is the design-direction, critique, and polish guardrail.
- 21st.dev MCP is a selective professional component and reference source.
- The Repository UI Kit is the actual design system and source of truth.
- Codex is responsible for inspection, audit, verification, and review.
- Claude Code is responsible for implementation and refactoring.
- Imported components must not introduce an inconsistent, third-party-looking visual
  language.
- Do not begin by copying an entire dashboard or template unless a later audit
  demonstrates a strong product fit.

## Initial production-readiness checklist

Preserve this checklist throughout the program. Assign each item to the appropriate
gate, retain evidence for completed items, and carry unresolved items forward.

- [ ] Remove horizontal scroll.
- [ ] Add meta descriptions where appropriate.
- [ ] Add a favicon.
- [ ] Fix page titles.
- [ ] Compress and optimize images.
- [ ] Make genuine email addresses clickable.
- [ ] Fix broken links.
- [ ] Add a mobile menu.
- [ ] Remove placeholder text.
- [ ] Test on mobile.
- [ ] Add empty states.
- [ ] Add loading states.
- [ ] Optimize for mobile.
- [ ] Fix mobile overflow.
- [ ] Add error messages.
- [ ] Add success messages.
- [ ] Add a 404 page.
- [ ] Make genuine phone numbers clickable.
- [ ] Verify keyboard navigation and visible focus behavior.
- [ ] Check touch-target sizing and spacing.
- [ ] Check image dimensions and layout shift.
- [ ] Verify long-content handling for titles, breadcrumbs, metadata, controls, tables,
  links, and user/content-derived text.

## Program boundaries

- Do not perform the full UI audit before `UI-AUDIT-1`.
- Do not redesign during `UI-BASELINE-0` or `UI-AUDIT-1`.
- Do not expand the portal beyond Andhra Pradesh School Education and teachers.
- Do not introduce engagement-first mechanics such as streaks, nudges, or infinite
  scroll.
- Do not reproduce numeric or tabular source-PDF content as post text.
- Do not replace the specified Next.js, Tailwind, Prisma, NextAuth, Vercel, Railway, or
  Google Drive decisions without explicit approval.
- Do not make the Quality-First publishing checklist an automated blocking gate unless
  explicitly requested.
- Do not merge this program branch into `main` as part of an individual gate unless the
  user explicitly authorizes it.

## State documents

- `docs/context/UI_ACTIVE_GATE.md` identifies the one active gate and its change boundary.
- `docs/context/UI_CURRENT_STATE.md` records the recoverable baseline, observations,
  validation evidence, known limitations, and next gate.
- Update both documents at every gate transition. Update this master plan only when the
  approved roadmap or operating rules change.
