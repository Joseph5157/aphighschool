# DESIGN.md — AP Teacher Desk design direction

Defined in gate `UI-DESIGN-1`. Read `PRODUCT.md` first; this document turns the product into
a visual and interaction direction. `docs/ui/DESIGN_SYSTEM.md` turns this direction into the
implementable spec.

This was the target at `UI-DESIGN-1`, not a claim about that gate's then-current state. The UI
System program and the later AI slop remediation program are now closed and merged on `main`;
their closure records are `docs/context/UI_SYSTEM_CLOSURE.md` and
`docs/context/SLOP_REMEDIATION_PLAN.md`.

## The direction, in one line

**A government gazette that a teacher can read on a phone in a corridor.**

Printed-record calm — a navy masthead, warm paper, hairline rules, data set in a monospace
face — carrying a dense, mobile-first document index. The authority comes from the
typographic discipline and the precision of the metadata, never from decoration.

## Why this direction and not another

The identity already exists in the codebase and is deliberate: a navy masthead
(`#1B2A4A`) that deliberately does **not** invert in dark mode, warm paper backgrounds
(`#EDE8DC` / `#F7F4EC`), turmeric and tamarind accents drawn from an Indian palette rather
than a generic product blue, and IBM Plex Mono reserved for anything data-like. This gate
**codifies that identity; it does not replace it.**

That is the right call for three reasons:

1. **The subject matter earns it.** Gazette vocabulary — masthead, hairline rules, monospace
   reference numbers, issue dates — is not borrowed styling here. The product literally
   indexes government orders. A document's GO number set in Plex Mono is doing the same job a
   gazette's reference column does.
2. **The palette is genuinely specific.** Turmeric, tamarind, kumkum and paper are named and
   chosen for this product, not sampled from a framework. Replacing them with anything more
   fashionable would make the product less itself.
3. **The audit found no evidence the direction is failing.** Every P0 and P1 finding is a
   *correctness* defect — classes that do not compile, an undefined colour, a focus ring that
   never paints, two bars stacked on top of each other. None of them is "the aesthetic is
   wrong". Redesigning in response to build bugs would be treating the wrong problem.

**What this gate targeted** were the parts of the then-current UI that contradicted the
direction: perpetual animation, emoji standing in for icons, raw framework colours leaking into
the most trust-bearing badge on the site, and a document state that rendered green when it meant
"replaced". Those targeted corrections have since been completed in the closed UI System and
AI slop remediation programs.

## Target character

| Quality | What it means here | What it rules out |
|---|---|---|
| Professional | Consistent, predictable, unfussy | Playful illustration, mascots, novelty type |
| Authoritative | Precise metadata, visible provenance, stated independence | Borrowing government insignia or implying official status |
| Modern | Current typographic and accessibility practice | Skeuomorphic "official document" pastiche |
| Calm | Motion only in response to action; one accent at a time | Perpetual animation, competing colours, alert fatigue |
| Trustworthy | Says only what is known, and labels which is which | Implied verification, decorative confidence signals |
| Information-focused | Density is a feature; whitespace serves scanning | Large hero panels, oversized cards, decorative padding |
| Mobile-first, not app-like | Real content at 320px; touch targets that work | Fake iOS chrome, tab-bar-first thinking on desktop |

## Design principles

### 1. State is the most important thing on the page

Whether an order is still in force outranks its title, its date, and its styling. Document
state must be legible in under a second, must never be carried by colour alone, and must use
one vocabulary everywhere — the same word, in the same place, on a card, a list row, and a
detail page.

The current mapping breaks this: `superseded` renders in the green family because the badge
component has no red variant. A user scanning a list sees green and reads "fine". That is the
single most consequential visual defect in the product and `docs/ui/DESIGN_SYSTEM.md` fixes
the mapping.

### 2. Say only what is known, and show which is which

The product's credibility rests on a distinction the UI must carry: *issued on* is a fact
about the department; *added to portal* is a fact about us. `lib/dates.ts` already enforces
this in data (`dateLabel()`), and the interface must never drop the label and show a bare
date.

The same rule governs GOIR: a recorded check renders a provenance marker; **no recorded check
renders nothing.** There is no "unverified" state, because absence of a check is not evidence
of a problem. Any design that implies otherwise is wrong.

### 3. Trust markers are information, not decoration

"GOIR Verified" is a statement about provenance, not a quality award. It must read as
metadata — quiet, precise, adjacent to the other facts — not as a promotional badge competing
for attention. If it looks like a marketing sticker, it will be believed less, not more.

### 4. Density is a feature; whitespace buys scanning, not comfort

A teacher looking for one order among forty is helped by seeing more of them. Space is spent
on separating groups so the eye can jump, not on making individual items feel generous. Where
this conflicts with a conventional "airy" look, density wins.

### 5. Structure earns its keep

Rules, borders, labels and numbering encode information or they come out. A hairline divides
two genuinely different things. A number appears only where the content is actually a
sequence — the recruitment stepper qualifies; a list of tools does not.

### 6. One accent at a time

Any given surface has one thing that is allowed to be loud. On a card that is the state pill.
On a form it is the primary action. Everything else recedes. Two competing accents means
neither is read.

### 7. Motion answers actions

A drawer slides because the user opened it. A disclosure expands because the user expanded
it. Nothing moves on its own. The pulsing dot on the active navigation item is perpetual
motion that signals nothing — it goes.

### 8. Telugu is a first-class script

Telugu gets its own family (Noto Sans Telugu), its own larger line-height, and never inherits
the Latin face. It is never auto-transliterated, never treated as a caption to the English,
and always marked `lang="te"` so assistive technology switches voice.

## What to avoid

Some of these are general AI-design tells; some are things already present in this codebase.
Both kinds are listed because both make the product worse.

**Reject outright:**

- Glassmorphism, decorative gradient washes, gradient text.
- Oversized cards and large border radii; one radius applied to everything regardless of
  hierarchy.
- The uniform SaaS-card kit — identical rounded boxes with the same soft grey shadow under
  each, used as a substitute for hierarchy.
- Large hero panels on a reference product.
- Decorative statistics, counters, or icons that carry no information.
- Emoji used as iconography. Emoji render differently per platform, cannot be recoloured, and
  read as informal. The listed `UI-DESIGN-1` instances, including the WhatsApp banner and
  `"SD"` mark, were removed in later closed work; this remains a prohibition, not an active
  remediation item.
- Fake device chrome: no drawn iOS status bar, no drawn keyboard.
- Any visual that implies official government endorsement.

**Constrain, do not ban** — these are established here and defensible, but are currently
overused:

- **Monospace for data.** Mandated by `AGENTS.md` for dates, GO numbers and status labels.
  Keep exactly that scope. Mono is not for body copy, headings, or navigation labels.
- **Uppercase tracked labels.** Legitimate for genuine section labels; not to be stacked above
  every heading. One per region, never two in sequence, never below 11px.
- **Middle-dot metadata strings.** Acceptable when each value is self-describing or labelled.
  `Issued · 12 Mar 2026` is fine; `GO · 129 · 2026 · Current` is a puzzle.
- **The `→` glyph.** 25 occurrences today. It may not replace a verb in a label, must be
  `aria-hidden`, and belongs on directional links, not on every button.

## Key decisions made in this gate

### D1. The `accent` colour is retired, not defined

The audit found `bg-accent` / `text-accent` / `border-accent` used for active navigation and
current-page states against a token that does not exist, so those states render unstyled.

**The fix is not to define an `accent` token.** `AGENTS.md` fixes a deliberate, closed token
set, and `accent` is a semantically empty name that would invite exactly this drift again.
Navigation position is also not a document status, so it must not borrow `tamarind` or
`turmeric`'s document-state meaning.

Active navigation is therefore defined as a **composition of existing tokens plus a
structural indicator** — see `DESIGN_SYSTEM.md`. `accent` must never be reintroduced.

### D2. Focus is a first-class, specified treatment

Focus visibility is currently defeated twice over: a bare `outline-none` overrides the global
`:focus-visible` outline at equal specificity, and `focus:ring-<color>` sets a ring colour
with no ring width so nothing paints.

Focus is not styling polish on this product — a teacher filling a pension form with a
keyboard needs it. The system defines one focus treatment, specifies that it must be visible
on paper, on the navy masthead, and in dark mode, and forbids removing an outline without
supplying a replacement.

### D3. Shadows are minimal and bordered surfaces are the default

The direction is printed-record, and the audit found 28 shadow classes that never compile at
all — meaning the product has been shipping essentially flat and nobody noticed. That is
evidence the shadows were not load-bearing.

Elevation is therefore expressed primarily by `hair` borders and background steps
(`paper` → `paperRaised`), with a deliberately short shadow scale reserved for genuinely
floating surfaces. This also removes the "identical soft shadow under every card" tell.

### D4. The document-state palette is corrected

`superseded` moves off the green family onto `kumkum`. A user who acts on a superseded order
is materially harmed, so it warrants the warning colour; `archived` stays neutral because it
is merely historical. The badge component gains the `kumkum` variant its own source comment
already asks for.

### D5. Badge colours come from project tokens

`success` and `warning` currently use raw `emerald-*` and `amber-*` from the default Tailwind
palette, against an explicit `AGENTS.md` rule. Worse, `success` is what "GOIR Verified" and
"Current" use — so the two most trust-bearing markers on the site are off-palette and do not
participate in the dark-mode flip. They move onto project tokens.

### D6. One navigation breakpoint

The drawer switches behaviour in JavaScript at 768px while the tab bar and desktop nav switch
in CSS at 1024px, so the 768–1023px band gets a mixed navigation model. The system defines a
single navigation breakpoint and requires the JS and CSS to agree on it.

### D7. Typography floors are set, and the label scale inversion is resolved

At `UI-DESIGN-1`, the product rendered 9px badge text and 10px helper text, and `--label-*`
custom properties both shrank at `md` *and* were swapped for the next size down at `md` in
`TaxCalculatorUI`, double-stepping labels to 11px on desktop. `--label-helper` was declared and
never used.

The system sets absolute minimum sizes and replaces the `--label-*` mechanism with a single
scale.

## What this gate deliberately does not decide

- **Information architecture.** Routes, navigation structure and page composition are
  unchanged. `UI-PATTERNS-1` owns pattern consolidation.
- **Component APIs.** `UI-SYSTEM-2` decides prop shapes; this gate decides appearance and
  states.
- **Which components are deleted or merged.** `docs/ui/UI_AUDIT.md` already records the
  KEEP / REFINE / MERGE / REPLACE / DELETE dispositions.
- **Measured colour contrast.** The token pairs are specified here, but no ratios were
  measured because no browser was available. `UI-A11Y-1` must verify them and may adjust
  values — the roles defined here should survive any such adjustment.

## Tooling note

Impeccable was not available in this environment, so no external design critique was run.
The critique in this document is self-applied against the audit findings and the product
constraints. If Impeccable becomes available, `UI-IMPECCABLE-1` is the gate that uses it, and
this document is what it should critique against.
